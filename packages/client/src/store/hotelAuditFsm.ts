import type { CompletionStatus, Hotel, HotelStatus } from "../types/hotel";

export type AuditFlowNode =
  | "editing_incomplete"
  | "pending_review"
  | "approved_online"
  | "approved_offline"
  | "rejected";

export type AuditFlowEvent =
  | { type: "MARK_INCOMPLETE"; completionStatus?: CompletionStatus }
  | { type: "SUBMIT_FOR_REVIEW" }
  | { type: "APPROVE" }
  | { type: "REJECT"; reason?: string }
  | { type: "OFFLINE" }
  | { type: "RESTORE" };

export const getAuditFlowNode = (
  hotel: Pick<Hotel, "status" | "isActive" | "isIncomplete">,
): AuditFlowNode => {
  if (hotel.isIncomplete) return "editing_incomplete";

  if (hotel.status === "approved") {
    return hotel.isActive ? "approved_online" : "approved_offline";
  }

  if (hotel.status === "rejected") return "rejected";

  return "pending_review";
};

export const getAuditResultConfig = (
  hotel?: Pick<
    Hotel,
    "status" | "isActive" | "isIncomplete" | "completionStatus" | "rejectReason"
  > | null,
) => {
  if (!hotel) {
    return {
      status: "info" as const,
      title: "审核中",
      message: "您的酒店信息已提交审核。",
    };
  }

  const node = getAuditFlowNode(hotel);

  if (node === "editing_incomplete") {
    return {
      status: "warning" as const,
      title: "信息待完善",
      message: "您的酒店信息尚未完善，补全后可再次提交审核。",
    };
  }

  if (node === "rejected") {
    return {
      status: "warning" as const,
      title: "审核未通过",
      message: hotel.rejectReason
        ? `很抱歉，您的酒店未通过审核。原因：${hotel.rejectReason}`
        : "很抱歉，您的酒店未通过审核。",
    };
  }

  if (node === "approved_online" || node === "approved_offline") {
    return {
      status: "success" as const,
      title: "审核通过",
      message:
        node === "approved_online"
          ? "恭喜！您的酒店已通过审核并上线。"
          : "恭喜！您的酒店已通过审核，当前为下线状态。",
    };
  }

  return {
    status: "info" as const,
    title: "审核中",
    message: "您的酒店信息已提交审核，审核结果将在24小时内通知您。",
  };
};

export const getCompletionStatusDisplay = (
  completionStatus?: CompletionStatus,
): { color: string; text: string } => {
  const statusMap: Record<CompletionStatus, { color: string; text: string }> = {
    draft: { color: "default", text: "草稿" },
    incomplete: { color: "warning", text: "信息不全" },
    rejected: { color: "error", text: "被驳回" },
  };

  if (!completionStatus) {
    return { color: "default", text: "未知" };
  }

  return statusMap[completionStatus] || { color: "default", text: "未知" };
};

export type IncompleteFilter = "all" | CompletionStatus;

export const matchIncompleteFilter = (
  hotel: Pick<
    Hotel,
    "status" | "isActive" | "isIncomplete" | "isDeleted" | "completionStatus"
  >,
  filter: IncompleteFilter,
) => {
  if (!hotel.isIncomplete || hotel.isDeleted) return false;
  if (filter === "all") return true;
  return hotel.completionStatus === filter;
};

export const getAuditFieldsByEvent = (
  source: Partial<
    Pick<
      Hotel,
      | "status"
      | "isActive"
      | "isIncomplete"
      | "completionStatus"
      | "rejectReason"
    >
  > = {},
  event: AuditFlowEvent,
) => {
  const base = {
    status: source.status ?? ("pending" as HotelStatus),
    isActive: source.isActive ?? false,
    isIncomplete: source.isIncomplete ?? false,
    completionStatus: source.completionStatus,
    rejectReason: source.rejectReason,
  };

  switch (event.type) {
    case "MARK_INCOMPLETE":
      return {
        ...base,
        status: "pending",
        isIncomplete: true,
        completionStatus: event.completionStatus ?? "incomplete",
        isActive: false,
      };
    case "SUBMIT_FOR_REVIEW":
      return {
        ...base,
        status: "pending",
        isIncomplete: false,
        completionStatus: undefined,
      };
    case "APPROVE":
      return {
        ...base,
        status: "approved",
        isIncomplete: false,
        completionStatus: undefined,
        rejectReason: undefined,
        isActive: true,
      };
    case "REJECT":
      return {
        ...base,
        status: "rejected",
        isIncomplete: false,
        rejectReason: event.reason ?? base.rejectReason,
        isActive: false,
      };
    case "OFFLINE":
      return {
        ...base,
        status: "approved",
        isActive: false,
      };
    case "RESTORE":
      return {
        ...base,
        status: "approved",
        isActive: true,
      };
    default:
      return base;
  }
};

const transitionMap: Record<AuditFlowNode, AuditFlowEvent["type"][]> = {
  editing_incomplete: ["SUBMIT_FOR_REVIEW", "MARK_INCOMPLETE"],
  pending_review: ["APPROVE", "REJECT", "MARK_INCOMPLETE"],
  approved_online: ["OFFLINE", "MARK_INCOMPLETE"],
  approved_offline: ["RESTORE", "MARK_INCOMPLETE"],
  rejected: ["MARK_INCOMPLETE", "SUBMIT_FOR_REVIEW"],
};

export const canTransit = (
  node: AuditFlowNode,
  eventType: AuditFlowEvent["type"],
) => {
  return transitionMap[node].includes(eventType);
};

export const transitHotelAuditState = (
  hotel: Hotel,
  event: AuditFlowEvent,
): Hotel => {
  const node = getAuditFlowNode(hotel);

  if (!canTransit(node, event.type)) {
    return hotel;
  }

  switch (event.type) {
    case "MARK_INCOMPLETE":
      return {
        ...hotel,
        status: "pending" as HotelStatus,
        isIncomplete: true,
        completionStatus: event.completionStatus ?? "incomplete",
        isActive: false,
      };

    case "SUBMIT_FOR_REVIEW":
      return {
        ...hotel,
        status: "pending" as HotelStatus,
        isIncomplete: false,
        completionStatus: undefined,
      };

    case "APPROVE":
      return {
        ...hotel,
        status: "approved" as HotelStatus,
        isIncomplete: false,
        completionStatus: undefined,
        rejectReason: undefined,
        isActive: true,
      };

    case "REJECT":
      return {
        ...hotel,
        status: "rejected" as HotelStatus,
        isIncomplete: false,
        rejectReason: event.reason ?? hotel.rejectReason,
        isActive: false,
      };

    case "OFFLINE":
      return {
        ...hotel,
        status: "approved" as HotelStatus,
        isActive: false,
      };

    case "RESTORE":
      return {
        ...hotel,
        status: "approved" as HotelStatus,
        isActive: true,
      };

    default:
      return hotel;
  }
};
