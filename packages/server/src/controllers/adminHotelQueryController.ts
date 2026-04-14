import type { NextFunction, Request, Response } from "express";
import { HotelModel } from "../models/Hotel.js";
import { logger } from "../services/logger.js";
import {
  buildPublishedHotelQuery,
  filterHotelsByPriceAndCapacity,
  mapHotelsForPublishedResponse,
  mapHotelsWithId,
  parsePaginationParams,
} from "../services/auditService.js";

export async function getPublishedHotels(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const {
      location,
      keyword,
      rooms,
      guests,
      minPrice,
      maxPrice,
      stars,
      startDate,
      endDate,
    } = req.query;

    const query = buildPublishedHotelQuery({ location, keyword, stars });
    const { isPaginationRequest, pageNum, limitNum, skip } =
      parsePaginationParams(req.query as Record<string, unknown>);

    let hotels: any[] = [];
    let total = 0;

    if (isPaginationRequest) {
      total = await HotelModel.countDocuments(query);
      hotels = await HotelModel.find(query)
        .sort({ createTime: -1 })
        .skip(skip)
        .limit(limitNum);
    } else {
      hotels = await HotelModel.find(query).sort({ createTime: -1 });
    }

    const filteredHotels = filterHotelsByPriceAndCapacity(hotels, {
      minPrice,
      maxPrice,
      rooms,
      guests,
    });

    const hotelsWithId = mapHotelsForPublishedResponse(
      filteredHotels,
      startDate,
      endDate,
    );

    if (!isPaginationRequest) {
      return res.json(hotelsWithId);
    }

    return res.json({
      success: true,
      data: hotelsWithId,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasMore: skip + limitNum < total,
      },
    });
  } catch (error) {
    logger.error("获取已发布酒店列表失败", error);
    return next(error);
  }
}

export async function getPendingHotels(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const hotels = await HotelModel.find({
      status: "pending",
      isDeleted: false,
      isIncomplete: false,
    }).sort({ createTime: -1 });

    return res.json(mapHotelsWithId(hotels));
  } catch (error) {
    logger.error("获取待审核列表失败", error);
    return next(error);
  }
}

export async function getRejectedHotels(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const hotels = await HotelModel.find({
      status: "rejected",
      isDeleted: false,
    }).sort({ createTime: -1 });

    return res.json(mapHotelsWithId(hotels));
  } catch (error) {
    logger.error("获取已拒绝酒店列表失败", error);
    return next(error);
  }
}

export async function getOfflineHotels(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const hotels = await HotelModel.find({
      status: "approved",
      isActive: false,
      isDeleted: false,
    }).sort({ createTime: -1 });

    return res.json(mapHotelsWithId(hotels));
  } catch (error) {
    logger.error("获取已下线酒店列表失败", error);
    return next(error);
  }
}
