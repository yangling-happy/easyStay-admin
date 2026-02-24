/**
 * 批量导入模板下载工具
 */

import * as XLSX from "xlsx";
import { message } from "antd";

/**
 * 下载酒店基础信息模板
 */
export const downloadHotelTemplate = (): void => {
  const template = [
    {
      酒店中文名: "示例酒店",
      酒店英文名: "Example Hotel",
      所在省份: "北京市",
      所在城市: "市辖区",
      所在区县: "朝阳区",
      详细地址: "建国路88号",
      联系电话: "010-12345678",
      酒店星级: "4",
      开业时间: "2020-01-01",
      酒店设施: "WiFi,Parking,Breakfast",
    },
  ];

  const ws = XLSX.utils.json_to_sheet(template);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "酒店基础信息模板");

  // 添加说明工作表，解释各字段的含义和选项
  const instructions = [
    {
      字段名称: "酒店中文名",
      必填: "是",
      说明: "酒店的中文名称",
      示例: "示例酒店",
    },
    {
      字段名称: "酒店英文名",
      必填: "是",
      说明: "酒店的英文名称",
      示例: "Example Hotel",
    },
    {
      字段名称: "所在省份",
      必填: "是",
      说明: "酒店所在的省份",
      示例: "北京市",
    },
    {
      字段名称: "所在城市",
      必填: "是",
      说明: "酒店所在的城市",
      示例: "市辖区",
    },
    {
      字段名称: "所在区县",
      必填: "是",
      说明: "酒店所在的区县",
      示例: "朝阳区",
    },
    {
      字段名称: "详细地址",
      必填: "是",
      说明: "酒店的详细地址",
      示例: "建国路88号",
    },
    {
      字段名称: "联系电话",
      必填: "是",
      说明: "酒店的联系电话",
      示例: "010-12345678",
    },
    {
      字段名称: "酒店星级",
      必填: "是",
      说明: "酒店的星级，1-5之间的数字",
      示例: "4",
    },
    {
      字段名称: "开业时间",
      必填: "是",
      说明: "酒店的开业时间，格式：YYYY-MM-DD",
      示例: "2020-01-01",
    },
    {
      字段名称: "酒店设施",
      必填: "否",
      说明: "酒店的设施，多个设施用逗号分隔，可选值：WiFi(WiFi)、Parking(停车场)、Breakfast(早餐)、Family(亲子友好)、Gym(健身房)、Pool(泳池)、Pets(可带宠物)、Airport(机场接送)",
      示例: "WiFi,Parking,Breakfast",
    },
    {
      字段名称: "酒店照片",
      必填: "否",
      说明: "酒店整体照片，建议上传3-8张大堂或外景图。批量导入后需要上传照片才能进入审核流程",
      示例: "导入后上传",
    },
  ];

  const instructionsWs = XLSX.utils.json_to_sheet(instructions);
  XLSX.utils.book_append_sheet(wb, instructionsWs, "字段说明");

  XLSX.writeFile(wb, "酒店基础信息导入模板.xlsx");
  message.success("酒店基础信息模板下载成功");
};

/**
 * 下载房型信息模板
 */
export const downloadRoomTemplate = (): void => {
  const template = [
    {
      酒店名称: "示例酒店",
      房型名称: "豪华大床房",
      每晚价格: "500",
      剩余库存: "10",
      标准入住人数: "2",
      床型: "big",
      配套权益: "breakfast,wifi,window",
    },
    {
      酒店名称: "示例酒店",
      房型名称: "温馨双床房",
      每晚价格: "550",
      剩余库存: "8",
      标准入住人数: "2",
      床型: "double",
      配套权益: "breakfast,wifi,window,bathroom",
    },
  ];

  const ws = XLSX.utils.json_to_sheet(template);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "房型信息模板");

  // 添加说明工作表，解释各字段的含义和选项
  const instructions = [
    {
      字段名称: "酒店名称",
      必填: "是",
      说明: "房型所属的酒店名称，必须与已成功导入的酒店名称完全一致",
      示例: "示例酒店",
    },
    {
      字段名称: "房型名称",
      必填: "是",
      说明: "房型的名称",
      示例: "豪华大床房",
    },
    {
      字段名称: "每晚价格",
      必填: "是",
      说明: "房型的每晚价格",
      示例: "500",
    },
    {
      字段名称: "剩余库存",
      必填: "是",
      说明: "房型的剩余库存",
      示例: "10",
    },
    {
      字段名称: "标准入住人数",
      必填: "是",
      说明: "房型的标准入住人数，1-4之间的整数",
      示例: "2",
    },
    {
      字段名称: "床型",
      必填: "是",
      说明: "房型的床型，可选值：big(1.8m 大床)、double(1.2m 双床)、king(2.0m 超大床)",
      示例: "big",
    },
    {
      字段名称: "配套权益",
      必填: "否",
      说明: "房型的配套权益，多个权益用逗号分隔，可选值：breakfast(含早餐)、cancel(免费取消)、window(有窗)、bathroom(独立卫浴)、wifi(免费WiFi)",
      示例: "breakfast,wifi,window",
    },
    {
      字段名称: "房型照片",
      必填: "否",
      说明: "房型照片，建议上传3-5张，展示客房细节、卫浴等。批量导入后需要上传照片才能进入审核流程",
      示例: "导入后上传",
    },
  ];

  const instructionsWs = XLSX.utils.json_to_sheet(instructions);
  XLSX.utils.book_append_sheet(wb, instructionsWs, "字段说明");

  XLSX.writeFile(wb, "房型信息导入模板.xlsx");
  message.success("房型信息模板下载成功");
};

/**
 * 下载Select选项模板
 */
export const downloadOptionsTemplate = (): void => {
  const template = [
    // 酒店设施
    {
      选项类型: "酒店设施",
      选项值: "WiFi",
      选项标签: "WiFi",
    },
    {
      选项类型: "酒店设施",
      选项值: "Parking",
      选项标签: "停车场",
    },
    {
      选项类型: "酒店设施",
      选项值: "Breakfast",
      选项标签: "早餐",
    },
    {
      选项类型: "酒店设施",
      选项值: "Family",
      选项标签: "亲子友好",
    },
    {
      选项类型: "酒店设施",
      选项值: "Gym",
      选项标签: "健身房",
    },
    {
      选项类型: "酒店设施",
      选项值: "Pool",
      选项标签: "泳池",
    },
    {
      选项类型: "酒店设施",
      选项值: "Pets",
      选项标签: "可带宠物",
    },
    {
      选项类型: "酒店设施",
      选项值: "Airport",
      选项标签: "机场接送",
    },
    // 床型
    {
      选项类型: "床型",
      选项值: "big",
      选项标签: "1.8m 大床",
    },
    {
      选项类型: "床型",
      选项值: "double",
      选项标签: "1.2m 双床",
    },
    {
      选项类型: "床型",
      选项值: "king",
      选项标签: "2.0m 超大床",
    },
    // 配套权益
    {
      选项类型: "配套权益",
      选项值: "breakfast",
      选项标签: "含早餐",
    },
    {
      选项类型: "配套权益",
      选项值: "cancel",
      选项标签: "免费取消",
    },
    {
      选项类型: "配套权益",
      选项值: "window",
      选项标签: "有窗",
    },
    {
      选项类型: "配套权益",
      选项值: "bathroom",
      选项标签: "独立卫浴",
    },
    {
      选项类型: "配套权益",
      选项值: "wifi",
      选项标签: "免费WiFi",
    },
  ];

  const ws = XLSX.utils.json_to_sheet(template);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Select选项导入模板");
  XLSX.writeFile(wb, "Select选项导入模板.xlsx");
  message.success("选项模板下载成功");
};
