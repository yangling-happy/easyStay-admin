import type { Hotel } from "../../types/hotel";
import { post, get } from "../http/request";

/**
 * 酒店业务逻辑封装 (Service 层)
 * 作用：统一管理数据的增删改查，屏蔽存储细节
 */
export const hotelService = {
  // 1. 获取当前登录用户的所有酒店
  getMyHotels: async (): Promise<Hotel[]> => {
    try {
      return await get<Hotel[]>('/my/hotels');
    } catch (error) {
      console.error('获取酒店列表失败:', error);
      return [];
    }
  },

  // 2. 根据 ID 获取单个酒店
  getHotelById: async (id: string): Promise<Hotel | undefined> => {
    try {
      const hotels = await hotelService.getMyHotels();
      return hotels.find((h) => h.id === id);
    } catch (error) {
      console.error('获取酒店详情失败:', error);
      return undefined;
    }
  },

  // 3. 保存/新增酒店
  saveHotel: async (hotel: Hotel): Promise<Hotel> => {
    try {
      // 确保酒店数据符合后端要求
      const hotelData = {
        ...hotel,
        status: hotel.status || "pending", // 默认为pending状态
        ownerId: localStorage.getItem('userId') || "", // 从localStorage获取当前用户ID
        createTime: hotel.createTime || new Date().toISOString(),
        updateTime: new Date().toISOString(),
        isActive: hotel.isActive !== false, // 默认为true
        isDeleted: hotel.isDeleted || false // 默认为false
      };

      return await post<Hotel>('/hotels', hotelData);
    } catch (error) {
      console.error('保存酒店失败:', error);
      throw error;
    }
  },

  // 4. 逻辑删除酒店
  deleteHotel: async (id: string): Promise<void> => {
    try {
      // 这里应该调用后端的删除接口
      // 假设后端提供了DELETE /api/hotels/:id接口
      await post('/hotels/delete', { id });
    } catch (error) {
      console.error('删除酒店失败:', error);
      throw error;
    }
  },

  // 5. 恢复酒店
  restoreHotel: async (id: string): Promise<void> => {
    try {
      // 这里应该调用后端的恢复接口
      // 假设后端提供了POST /api/hotels/restore接口
      await post('/hotels/restore', { id });
    } catch (error) {
      console.error('恢复酒店失败:', error);
      throw error;
    }
  },

  // 6. 按状态获取酒店
  getHotelsByStatus: async (status: Hotel["status"]): Promise<Hotel[]> => {
    try {
      const hotels = await hotelService.getMyHotels();
      return hotels.filter((h) => h.status === status);
    } catch (error) {
      console.error('按状态获取酒店失败:', error);
      return [];
    }
  },

  // 7. 获取待审核酒店
  getPendingHotels: async (): Promise<Hotel[]> => {
    try {
      return await hotelService.getHotelsByStatus('pending');
    } catch (error) {
      console.error('获取待审核酒店失败:', error);
      return [];
    }
  },
};


