import type { Hotel } from "../../types/hotel";

const STORAGE_KEY = "ctrip_hotels_data";

/**
 * 酒店业务逻辑封装 (Service 层)
 * 作用：统一管理数据的增删改查，屏蔽存储细节
 */
export const hotelService = {
  // 1. 获取所有酒店 (支持过滤掉已逻辑删除的)
  getHotels: (): Hotel[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  // 2. 根据 ID 获取单个酒店
  getHotelById: (id: string): Hotel | undefined => {
    const hotels = hotelService.getHotels();
    return hotels.find((h) => h.id === id);
  },

  // 3. 保存/新增酒店
  saveHotel: (hotel: Hotel): void => {
    const hotels = hotelService.getHotels();
    const index = hotels.findIndex((h) => h.id === hotel.id);

    if (index > -1) {
      // 更新
      hotels[index] = hotel;
    } else {
      // 新增 (放在最前面)
      hotels.unshift(hotel);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(hotels));
  },

  // 4. 审核操作 (快捷方法)
  auditHotel: (id: string, status: Hotel["status"], reason?: string): void => {
    const hotels = hotelService.getHotels();
    const index = hotels.findIndex((h) => h.id === id);
    if (index > -1) {
      hotels[index].status = status;
      if (reason) hotels[index].rejectReason = reason;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(hotels));
    }
  },

  // 5. 逻辑删除/下线
  deleteHotel: (id: string): void => {
    const hotels = hotelService.getHotels();
    const index = hotels.findIndex((h) => h.id === id);
    if (index > -1) {
      hotels[index].isDeleted = true; // 仅标记，不物理删除
      localStorage.setItem(STORAGE_KEY, JSON.stringify(hotels));
    }
  },
};
