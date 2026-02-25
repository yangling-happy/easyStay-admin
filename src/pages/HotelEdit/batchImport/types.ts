/**
 * 批量导入相关类型定义
 */

/**
 * Excel行数据接口（酒店数据）
 */
export interface ExcelRow {
  酒店中文名: string;
  酒店英文名: string;
  所在省份?: string;
  所在城市?: string;
  所在区县?: string;
  详细地址?: string;
  联系电话: string;
  酒店星级: string;
  开业时间: string;
  酒店设施?: string;
  房型名称: string;
  每晚价格: string;
  剩余库存: string;
  标准入住人数: string;
  床型: string;
  配套权益?: string;
}

/**
 * Excel行数据接口（选项数据）
 */
export interface OptionExcelRow {
  选项类型: string;
  选项值: string;
  选项标签?: string;
}

/**
 * 验证错误接口
 */
export interface ValidationError {
  row: number;      // 行号（从2开始，第1行为表头）
  field: string;    // 字段名
  message: string;  // 错误信息
}

/**
 * 导入结果接口
 */
export interface ImportResult {
  hotelName: string;
  status: 'success' | 'error';
  message: string;
  hotelId?: string;
}

/**
 * 导入模式类型
 */
export type ImportMode = 'hotel' | 'options';
