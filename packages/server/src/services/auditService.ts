import { parseAddress } from "../utils/addressUtils.js";
import { calculateDynamicPrices } from "../utils/priceUtils.js";
import { sanitizeAuditSnapshot } from "./hotelService.js";

interface PublishedQueryInput {
  location?: unknown;
  keyword?: unknown;
  stars?: unknown;
}

export function buildPublishedHotelQuery(input: PublishedQueryInput) {
  const query: any = {
    status: "approved",
    isDeleted: false,
    isActive: true,
  };

  if (input.location) {
    const { codes, streetAddress } = parseAddress(String(input.location));
    const addressConditions: any[] = [];

    if (codes.length > 0) {
      addressConditions.push({ location: { $in: codes } });
    }
    if (streetAddress) {
      addressConditions.push({
        address: { $regex: streetAddress, $options: "i" },
      });
    }

    if (addressConditions.length > 0) {
      query.$or = addressConditions;
    }
  }

  if (input.keyword) {
    const keywordStr = String(input.keyword);
    const keywords = keywordStr.split(/\s+/).filter((k: string) => k.trim());
    if (keywords.length > 0) {
      const orConditions: any[] = [];
      keywords.forEach((k: string) => {
        orConditions.push(
          { name: { $regex: k, $options: "i" } },
          { nameEn: { $regex: k, $options: "i" } },
          { amenities: { $regex: k, $options: "i" } },
        );
      });
      query.$or = orConditions;
    }
  }

  if (input.stars) {
    const starArray = String(input.stars)
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((s) => !Number.isNaN(s));

    if (starArray.length > 0) {
      query.star = { $in: starArray };
    }
  }

  return query;
}

export function parsePaginationParams(query: Record<string, unknown>) {
  const isPaginationRequest = Boolean(query.page || query.limit);
  const pageNum = Number.parseInt(String(query.page || 1), 10) || 1;
  const limitNum = Number.parseInt(String(query.limit || 15), 10) || 15;
  const skip = (pageNum - 1) * limitNum;

  return {
    isPaginationRequest,
    pageNum,
    limitNum,
    skip,
  };
}

export function filterHotelsByPriceAndCapacity(
  hotels: any[],
  params: {
    minPrice?: unknown;
    maxPrice?: unknown;
    rooms?: unknown;
    guests?: unknown;
  },
) {
  let result = hotels;

  if (params.minPrice || params.maxPrice) {
    const min = params.minPrice ? Number(params.minPrice) : 0;
    const max = params.maxPrice
      ? Number(params.maxPrice)
      : Number.POSITIVE_INFINITY;

    result = result.filter((hotel) =>
      hotel.roomTypes.some(
        (room: any) => room.price >= min && room.price <= max,
      ),
    );
  }

  if (params.rooms || params.guests) {
    const requiredRooms = params.rooms ? Number(params.rooms) : 1;
    const requiredGuests = params.guests ? Number(params.guests) : 1;

    result = result.filter((hotel) =>
      hotel.roomTypes.some(
        (room: any) =>
          room.stock >= requiredRooms && (room.capacity || 0) >= requiredGuests,
      ),
    );
  }

  return result;
}

export function mapHotelsForPublishedResponse(
  hotels: any[],
  startDate?: unknown,
  endDate?: unknown,
) {
  return hotels.map((hotel) => {
    const hotelObj = hotel.toObject();

    if (hotelObj.roomTypes && Array.isArray(hotelObj.roomTypes)) {
      hotelObj.roomTypes.sort((a: any, b: any) => a.price - b.price);
      (hotelObj as any).roomTypes = calculateDynamicPrices(
        hotelObj.roomTypes,
        String(startDate || ""),
        String(endDate || ""),
      );
    }

    return {
      ...hotelObj,
      id: hotelObj._id.toString(),
      _id: undefined,
    };
  });
}

export function mapHotelsWithId(hotels: any[]) {
  return hotels.map((hotel) => {
    const hotelObj = hotel.toObject();
    return {
      ...hotelObj,
      id: hotelObj._id.toString(),
      _id: undefined,
    };
  });
}

export function buildAdminAuditUpdateData(params: {
  status: "approved" | "rejected";
  rejectReason?: string;
  snapshot: Record<string, any>;
}) {
  const { status, rejectReason, snapshot } = params;
  const snapshotWithoutId = sanitizeAuditSnapshot(snapshot);

  const updateData: any = {
    status,
    updateTime: new Date(),
    $push: {
      auditHistory: {
        action: status === "approved" ? "audit_approved" : "audit_rejected",
        status,
        rejectReason: status === "rejected" ? rejectReason || "" : "",
        operatorRole: "admin",
        timestamp: new Date(),
        snapshot: snapshotWithoutId,
      },
    },
  };

  if (status === "rejected") {
    updateData.rejectReason = rejectReason;
    updateData.isIncomplete = true;
    updateData.completionStatus = "rejected";
    updateData.isActive = false;
  } else {
    updateData.rejectReason = undefined;
    updateData.isActive = true;
    updateData.isIncomplete = false;
    updateData.completionStatus = null;
  }

  return updateData;
}
