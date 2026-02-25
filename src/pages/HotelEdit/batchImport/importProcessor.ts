/**
 * 批量导入处理器
 */

import { message } from "antd";
import { hotelService } from "../../../api/services/hotelService";
import type { Hotel } from "../../../types/hotel";
import type {
  ExcelRow,
  OptionExcelRow,
  ImportResult,
  ValidationError,
} from "./types";
import {
  validateHotelBasicInfo,
  validateRoomTypeInfo,
  validateHotelRoomTypes,
} from "./validators";
import { getCodesFromNames } from "../../../utils/addressData";

/**
 * 验证酒店数据
 * @param hotels 酒店数据数组
 * @returns 验证结果
 */
export const validateHotelData = (
  hotels: ExcelRow[],
): { valid: Hotel[]; errors: ValidationError[] } => {
  const errors: ValidationError[] = [];
  const validHotels: Hotel[] = [];
  const hotelMap = new Map<string, Hotel>();

  const resolveCompletionStatus = (hotel: Hotel) => {
    const missingRequiredFields =
      !hotel.name?.trim() ||
      !hotel.nameEn?.trim() ||
      !hotel.address?.trim() ||
      !hotel.phone?.trim() ||
      !hotel.openingDate ||
      !hotel.star ||
      !hotel.location ||
      hotel.location.length < 2 ||
      !hotel.photos ||
      hotel.photos.length === 0 ||
      !hotel.roomTypes ||
      hotel.roomTypes.length === 0 ||
      hotel.roomTypes.some((room) => !room.photos || room.photos.length === 0);

    return missingRequiredFields ? "incomplete" : "draft";
  };

  hotels.forEach((row: ExcelRow, index: number) => {
    const rowNum = index + 2;

    // 验证基础信息和房型信息
    const basicInfoErrors = validateHotelBasicInfo(row, rowNum);
    const roomTypeErrors = validateRoomTypeInfo(row, rowNum);

    // 收集所有错误
    if (basicInfoErrors.length > 0 || roomTypeErrors.length > 0) {
      errors.push(...basicInfoErrors);
      errors.push(...roomTypeErrors);
      return;
    }

    // 解析数据
    const star = parseInt(row["酒店星级"], 10);
    const price = parseFloat(row["每晚价格"]);
    const stock = parseInt(row["剩余库存"], 10);
    const capacity = parseInt(row["标准入住人数"], 10);

    // 按酒店分组
    const hotelKey = `${row["酒店中文名"]}_${row["酒店英文名"]}`;
    if (!hotelMap.has(hotelKey)) {
      // 将省、市、区名称转换为编码数组
      const locationCodes = getCodesFromNames(
        row["所在省份"] || "",
        row["所在城市"] || "",
        row["所在区县"] || "",
      );

      const newHotel: Hotel = {
        name: row["酒店中文名"].trim(),
        nameEn: row["酒店英文名"].trim(),
        location:
          locationCodes.length > 0
            ? locationCodes
            : ([row["所在省份"], row["所在城市"], row["所在区县"]].filter(
                Boolean,
              ) as string[]),
        address: row["详细地址"]?.trim() || "",
        phone: row["联系电话"].trim(),
        star: star as 1 | 2 | 3 | 4 | 5,
        openingDate: row["开业时间"],
        amenities: row["酒店设施"]
          ? row["酒店设施"]
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean)
          : [],
        roomTypes: [],
        photos: [],
        status: "pending",
        isActive: false,
        isIncomplete: true,
        completionStatus: "draft",
        ownerId: localStorage.getItem("userId") || "user_001",
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
        isDeleted: false,
      };
      newHotel.completionStatus = resolveCompletionStatus(newHotel);
      hotelMap.set(hotelKey, newHotel);
    }

    // 添加房型信息
    const hotel = hotelMap.get(hotelKey);
    if (hotel) {
      const newRoomType = {
        name: row["房型名称"].trim(),
        price: price,
        stock: stock,
        capacity: capacity,
        bedType: row["床型"] as "big" | "double" | "king",
        tags: row["配套权益"]
          ? row["配套权益"]
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean)
          : [],
        photos: [], // 照片需要单独上传
        isActive: true, // 默认上线状态
      };
      hotel.roomTypes.push(newRoomType);
      hotel.completionStatus = resolveCompletionStatus(hotel);
    }
  });

  // 验证每个酒店至少包含一种房型
  const roomTypeErrors = validateHotelRoomTypes(hotelMap);
  errors.push(...roomTypeErrors);

  // 过滤掉没有房型的酒店
  const hotelsWithRoomTypes = Array.from(hotelMap.values()).filter(
    (hotel) => hotel.roomTypes.length > 0,
  );

  validHotels.push(...hotelsWithRoomTypes);
  return { valid: validHotels, errors };
};

/**
 * 处理选项导入
 * @param optionData 选项数据数组
 * @param importFromExcel 从Excel导入选项的函数
 * @returns Promise<void>
 */
export const handleOptionsImport = async (
  optionData: OptionExcelRow[],
  importFromExcel: (data: any[]) => any,
): Promise<void> => {
  try {
    importFromExcel(optionData);
    message.success(`选项导入成功！共导入 ${optionData.length} 个选项`);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "导入失败";
    message.error("选项导入失败: " + errorMessage);
  }
};

/**
 * 处理酒店数据导入
 * @param validHotels 验证通过的酒店数据
 * @returns Promise<ImportResult[]>
 */
export const handleHotelImport = async (
  validHotels: Hotel[],
): Promise<ImportResult[]> => {
  const results: ImportResult[] = [];

  for (const hotel of validHotels) {
    try {
      const res = await hotelService.saveHotel(hotel);
      const hotelId = res?.id || "";
      results.push({
        hotelName: hotel.name,
        status: "success",
        message: `提交成功，酒店编号: ${hotelId}`,
        hotelId: hotelId,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "提交失败";
      results.push({
        hotelName: hotel.name,
        status: "error",
        message: errorMessage,
      });
    }
  }

  return results;
};

/**
 * 批量审核相关代码预留位置
 * @param hotelIds 酒店ID数组
 * @returns Promise<void>
 */
export const handleBatchAudit = async (hotelIds: string[]): Promise<void> => {
  // 批量审核逻辑将在此实现
  console.log("批量审核酒店:", hotelIds);
  // 这里将调用批量审核API
};
