import dayjs from "dayjs";

/**
 * 统一的日期格式化工具
 */

/**
 * 格式化日期为标准格式：YYYY-MM-DD HH:MM:SS
 * @param date 日期字符串、Date 对象或 dayjs 对象
 * @param format 自定义格式（可选，默认：YYYY-MM-DD HH:MM:SS
 * @returns 格式化后的日期字符串
 */
export const formatDateTime = (
  date: string | Date | dayjs.Dayjs | null | undefined,
  format: string = "YYYY-MM-DD HH:MM:SS"
): string => {
  if (!date) {
    return "-";
  }
  return dayjs(date).format(format);
};

/**
 * 格式化日期为 YYYY-MM-DD（只显示日期部分）
 * @param date 日期字符串、Date 对象或 dayjs 对象
 * @returns 格式化后的日期字符串
 */
export const formatDate = (
  date: string | Date | dayjs.Dayjs | null | undefined
): string => {
  return formatDateTime(date, "YYYY-MM-DD");
};

/**
 * 格式化日期为 HH:MM:SS（只显示时间部分）
 * @param date 日期字符串、Date 对象或 dayjs 对象
 * @returns 格式化后的时间字符串
 */
export const formatTime = (
  date: string | Date | dayjs.Dayjs | null | undefined
): string => {
  return formatDateTime(date, "HH:mm:ss");
};
