type CompletionStatus = "draft" | "incomplete" | "rejected" | null;

const INCOMPLETE_STATUSES = ["draft", "incomplete", "rejected"];

export function isIncompleteHotelPayload(payload: Record<string, any>) {
  return (
    payload?.isIncomplete === true ||
    INCOMPLETE_STATUSES.includes(payload?.completionStatus)
  );
}

export function resolveCompletionStatus(
  isIncomplete: boolean,
  payload: Record<string, any>,
): CompletionStatus {
  if (!isIncomplete) return null;
  return (payload?.completionStatus || "draft") as CompletionStatus;
}

export function normalizeDateToMonthDay(value?: string) {
  if (!value || !value.includes("-")) return value;

  const parts = value.split("-");
  if (parts.length !== 3) return value;

  return `${parts[1]}-${parts[2]}`;
}

export function splitRoomTypesByAvailability(
  roomTypes: any[],
  rooms: number,
  guests: number,
) {
  const available: any[] = [];
  const unavailable: any[] = [];

  roomTypes.forEach((room: any) => {
    if (room.stock >= rooms && room.capacity >= guests) {
      available.push(room);
      return;
    }
    unavailable.push(room);
  });

  available.sort((a, b) => a.price - b.price);
  unavailable.sort((a, b) => a.price - b.price);

  return { available, unavailable };
}

export function createHotelPayload(params: {
  body: Record<string, any>;
  userId?: string;
}) {
  const { body, userId } = params;
  const isIncomplete = isIncompleteHotelPayload(body);
  const completionStatus = resolveCompletionStatus(isIncomplete, body);

  return {
    ...body,
    ownerId: userId,
    status: "pending",
    isIncomplete,
    completionStatus,
    isActive: isIncomplete ? false : (body?.isActive ?? false),
    createTime: new Date(),
    updateTime: new Date(),
    auditHistory: [
      {
        action: "create",
        status: "pending",
        operatorId: userId,
        operatorRole: "merchant",
        timestamp: new Date(),
        beforeStatus: null,
        afterStatus: {
          status: "pending",
          isIncomplete,
          completionStatus,
        },
      },
    ],
  };
}

export function sanitizeAuditSnapshot(snapshot: Record<string, any>) {
  const sanitized = { ...snapshot };
  delete sanitized._id;
  delete sanitized.__v;
  delete sanitized.auditHistory;
  return sanitized;
}

export function buildHotelUpdatePayload(params: {
  body: Record<string, any>;
  ownerId: string;
  currentVersion: number;
  isMerchant: boolean;
}) {
  const { body, ownerId, currentVersion, isMerchant } = params;

  const isIncomplete = isIncompleteHotelPayload(body);
  const completionStatus = resolveCompletionStatus(isIncomplete, body);
  const { ownerId: _ownerId, ...restBody } = body || {};

  const shouldForcePending = isMerchant && !isIncomplete;

  const updateData: any = {
    ...restBody,
    ownerId,
    updateTime: new Date(),
    version: (currentVersion || 0) + 1,
  };

  if (isIncomplete) {
    updateData.isIncomplete = true;
    updateData.completionStatus = completionStatus;
    updateData.isActive = false;
  } else {
    updateData.isIncomplete = false;
    updateData.completionStatus = null;
  }

  if (shouldForcePending) {
    updateData.status = "pending";
    updateData.isActive = false;
    updateData.rejectReason = "";
  }

  return {
    updateData,
    isIncomplete,
    completionStatus,
    shouldForcePending,
  };
}
