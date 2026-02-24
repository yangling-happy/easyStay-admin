/**
 * 批量导入验证工具
 */

import type { ExcelRow, OptionExcelRow, ValidationError } from "./types";

/**
 * 验证酒店基础信息字段
 * @param row Excel行数据
 * @param rowNum 行号
 * @returns 验证错误数组
 */
export const validateHotelBasicInfo = (
  row: ExcelRow,
  rowNum: number,
): ValidationError[] => {
  const errors: ValidationError[] = [];

  // 酒店中文名验证
  if (!row["酒店中文名"]?.trim()) {
    errors.push({ row: rowNum, field: "酒店中文名", message: "不能为空" });
  }

  // 酒店英文名验证
  if (!row["酒店英文名"]?.trim()) {
    errors.push({ row: rowNum, field: "酒店英文名", message: "不能为空" });
  }

  // 联系电话验证
  if (!row["联系电话"]?.trim()) {
    errors.push({ row: rowNum, field: "联系电话", message: "不能为空" });
  } else {
    const phoneRegex = /^[0-9+\-\s()]+$/;
    if (!phoneRegex.test(row["联系电话"])) {
      errors.push({ row: rowNum, field: "联系电话", message: "格式不正确" });
    }
  }

  // 酒店星级验证
  if (!row["酒店星级"]) {
    errors.push({ row: rowNum, field: "酒店星级", message: "不能为空" });
  } else {
    const star = parseInt(row["酒店星级"], 10);
    if (isNaN(star) || star < 1 || star > 5) {
      errors.push({
        row: rowNum,
        field: "酒店星级",
        message: "必须是1-5之间的数字",
      });
    }
  }

  // 开业时间验证
  if (!row["开业时间"]) {
    errors.push({ row: rowNum, field: "开业时间", message: "不能为空" });
  } else {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(row["开业时间"])) {
      errors.push({
        row: rowNum,
        field: "开业时间",
        message: "格式应为YYYY-MM-DD",
      });
    }
  }

  // 所在地区验证
  if (!row["所在省份"]?.trim()) {
    errors.push({ row: rowNum, field: "所在省份", message: "不能为空" });
  }

  if (!row["所在城市"]?.trim()) {
    errors.push({ row: rowNum, field: "所在城市", message: "不能为空" });
  }

  if (!row["所在区县"]?.trim()) {
    errors.push({ row: rowNum, field: "所在区县", message: "不能为空" });
  }

  // 详细地址验证
  if (!row["详细地址"]?.trim()) {
    errors.push({ row: rowNum, field: "详细地址", message: "不能为空" });
  }

  return errors;
};

/**
 * 验证酒店房型数量
 * @param hotelMap 酒店数据映射
 * @returns 验证错误数组
 */
export const validateHotelRoomTypes = (
  hotelMap: Map<string, any>,
): ValidationError[] => {
  const errors: ValidationError[] = [];

  hotelMap.forEach((hotel) => {
    if (!hotel.roomTypes || hotel.roomTypes.length === 0) {
      errors.push({
        row: 1,
        field: "酒店房型",
        message: `酒店"${hotel.name}"没有房型数据，每个酒店必须至少包含一种房型`,
      });
    } else {
      // 验证每个酒店至少包含一个已上线状态的房间
      const hasActiveRoom = hotel.roomTypes.some(
        (room: any) => room.isActive !== false,
      );
      if (!hasActiveRoom) {
        errors.push({
          row: 1,
          field: "房间状态",
          message: `酒店"${hotel.name}"没有已上线的房间，每个酒店必须至少包含一个已上线状态的房间`,
        });
      }
    }
  });

  return errors;
};

/**
 * 验证房型信息字段
 * @param row Excel行数据
 * @param rowNum 行号
 * @returns 验证错误数组
 */
export const validateRoomTypeInfo = (
  row: ExcelRow,
  rowNum: number,
): ValidationError[] => {
  const errors: ValidationError[] = [];

  // 房型名称验证
  if (!row["房型名称"]?.trim()) {
    errors.push({ row: rowNum, field: "房型名称", message: "不能为空" });
  }

  // 每晚价格验证
  const price = parseFloat(row["每晚价格"]);
  if (isNaN(price) || price < 0) {
    errors.push({
      row: rowNum,
      field: "每晚价格",
      message: "必须是有效的正数",
    });
  }

  // 剩余库存验证
  const stock = parseInt(row["剩余库存"], 10);
  if (isNaN(stock) || stock < 0) {
    errors.push({
      row: rowNum,
      field: "剩余库存",
      message: "必须是有效的非负整数",
    });
  }

  // 标准入住人数验证
  const capacity = parseInt(row["标准入住人数"], 10);
  if (isNaN(capacity) || capacity < 1 || capacity > 4) {
    errors.push({
      row: rowNum,
      field: "标准入住人数",
      message: "必须是1-4之间的整数",
    });
  }

  // 床型验证
  const validBedTypes = ["big", "double", "king"];
  if (!row["床型"] || !validBedTypes.includes(row["床型"])) {
    errors.push({
      row: rowNum,
      field: "床型",
      message: "必须是big/double/king之一",
    });
  }

  return errors;
};

/**
 * 验证Select选项数据
 * @param optionData 选项数据数组
 * @returns 验证错误数组
 */
export const validateOptionData = (
  optionData: OptionExcelRow[],
): ValidationError[] => {
  const errors: ValidationError[] = [];
  const validTypes = ["酒店设施", "床型", "配套权益"];

  optionData.forEach((row, index) => {
    const rowNum = index + 2;

    // 选项类型验证
    if (!row["选项类型"]?.trim()) {
      errors.push({ row: rowNum, field: "选项类型", message: "不能为空" });
    } else if (!validTypes.includes(row["选项类型"])) {
      errors.push({
        row: rowNum,
        field: "选项类型",
        message: `必须是以下之一：${validTypes.join("、")}`,
      });
    }

    // 选项值验证
    if (!row["选项值"]?.trim()) {
      errors.push({ row: rowNum, field: "选项值", message: "不能为空" });
    }

    // 选项标签验证（可选）
    if (row["选项标签"] && typeof row["选项标签"] !== "string") {
      errors.push({
        row: rowNum,
        field: "选项标签",
        message: "必须是字符串类型",
      });
    }
  });

  return errors;
};
