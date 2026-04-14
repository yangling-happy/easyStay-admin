import { HotelModel } from "../models/Hotel.js";

const VALID_ORDER_STATUSES = [
  "pending",
  "confirmed",
  "checkin",
  "checkout",
  "cancelled",
  "refunded",
];

export function isValidOrderStatus(status: string) {
  return VALID_ORDER_STATUSES.includes(status);
}

export async function getOwnerHotelIds(ownerId?: string) {
  const hotels = await HotelModel.find({ ownerId });
  return hotels.map((hotel) => hotel._id.toString());
}

export function buildOrderQuery(params: {
  status?: unknown;
  hotelId?: unknown;
}) {
  const query: any = { isDeleted: false };

  if (params.status) {
    query.status = params.status;
  }

  if (params.hotelId) {
    query.hotelId = params.hotelId;
  }

  return query;
}

export function buildCreateOrderPayload(
  body: Record<string, any>,
  userId?: string,
) {
  return {
    ...body,
    userId,
    orderNumber: `ORD${Date.now()}`,
    createTime: new Date(),
    updateTime: new Date(),
  };
}
