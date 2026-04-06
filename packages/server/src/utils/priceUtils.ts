/**
 * @description 计算动态价格
 * @param roomTypes 房间类型数组
 * @param startDate 入住日期（MM-DD格式）
 * @param endDate 离店日期（MM-DD格式）
 * @returns 调整后的房间类型数组
 */
export function calculateDynamicPrices(roomTypes: any[], startDate?: string, endDate?: string): any[] {
  let processedRoomTypes = [...roomTypes];
  
  if (processedRoomTypes && Array.isArray(processedRoomTypes) && startDate && endDate) {
    // 获取当前年份
    const currentYear = new Date().getFullYear();
    
    // 解析日期格式：MM-DD
    const checkInDate = new Date(`${currentYear}-${startDate}`);
    const checkOutDate = new Date(`${currentYear}-${endDate}`);
    // 计算入住期间的周末天数
    let weekendDays = 0;
    let currentDate = new Date(checkInDate);
    
    while (currentDate < checkOutDate) {
      const dayOfWeek = currentDate.getDay();
      // 0 是周日，6 是周六
      if (dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6) {
        weekendDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // 计算总天数
    const totalDays = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // 应用价格调整
    if (totalDays > 0) {
      const weekendRatio = weekendDays / totalDays;
      // 1. 季节性定价
      const checkInMonth = checkInDate.getMonth() + 1; // 1-12
      const checkOutMonth = checkOutDate.getMonth() + 1; // 1-12
      let seasonFactor = 0.98; // 默认淡季
      // 定义旺季：6-8月、9-10月、2月
      const seasons = [2, 6, 7, 8, 9, 10];
      // 检查入住或离店月份是否在旺季
      if (seasons.includes(checkInMonth) || seasons.includes(checkOutMonth)) {
        seasonFactor = 1.1; // 旺季加价10%
      }

      // 应用价格调整
      processedRoomTypes = processedRoomTypes.map((room: any) => {
        let adjustedPrice = room.price;
        // 周末比例越高，价格调整幅度越大
        if (weekendRatio > 0) {
          // 基础价格调整：周末加价 10%
          const weekendSurcharge = 0.1 * weekendRatio;
          adjustedPrice = Math.round(adjustedPrice * (1 + weekendSurcharge));
        }
        // 季节性调价
        adjustedPrice = Math.round(adjustedPrice * seasonFactor);
        return {
          ...room,
          price: adjustedPrice,      // 只更新价格字段
        };
      });
    }
  }
  
  return processedRoomTypes;
}
