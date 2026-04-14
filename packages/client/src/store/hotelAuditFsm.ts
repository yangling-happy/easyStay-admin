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
