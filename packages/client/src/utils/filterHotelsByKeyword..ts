/**
 * 根据关键词过滤酒店数据
 * @param data 酒店数据数组
 * @param keyword 搜索关键词
 * @returns 过滤后的数据
 */
export const filterHotelsByKeyword = (data: any[], keyword: string): any[] => {
  // 处理搜索关键词：转小写 + 去除空格
  const normalizedKeyword = keyword.toLowerCase().trim();

  // 如果没有输入关键词，则返回所有数据
  if (!normalizedKeyword) return data;

  // 过滤逻辑
  return data.filter((item: any) => {
    const name = item.name || "";
    const nameEn = item.nameEn || ""; // 英文名称（如果存在）
    const id = item.id || item._id || ""; // 编号（兼容 _id）

    return (
      name.toLowerCase().includes(normalizedKeyword) ||
      nameEn.toLowerCase().includes(normalizedKeyword) ||
      id.toLowerCase().includes(normalizedKeyword)
    );
  });
};
