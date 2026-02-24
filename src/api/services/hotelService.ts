import type { Hotel } from "../../types/hotel";
import { post, get, put, patch, del } from "../http/request";

/**
 * 酒店业务逻辑封装 (Service 层)
 * 作用：统一管理数据的增删改查，屏蔽存储细节
 */

export const hotelService = {
  getMyHotels: async (): Promise<Hotel[]> => {
    try {
      const res = await get<any>("/hotels/records");
      return Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
    } catch (error) {
      console.error("获取酒店列表失败:", error);
      return [];
    }
  },

  getOnlineHotels: async (): Promise<Hotel[]> => {
    try {
      const hotels = await hotelService.getMyHotels();
      return hotels.filter((h) => {
        return h.status === "approved" && h.isActive === true;
      });
    } catch (error) {
      console.error("获取在线酒店失败:", error);
      return [];
    }
  },

  getIncompleteHotels: async (): Promise<Hotel[]> => {
    try {
      const hotels = await hotelService.getMyHotels();
      return hotels.filter(
        (h) => h.isIncomplete === true && h.isDeleted === false,
      );
    } catch (error) {
      console.error("获取待完善酒店失败:", error);
      return [];
    }
  },

  getIncompleteHotelsByStatus: async (status: string): Promise<Hotel[]> => {
    try {
      const hotels = await hotelService.getIncompleteHotels();
      if (status === "all") {
        return hotels;
      }
      return hotels.filter((h) => h.completionStatus === status);
    } catch (error) {
      console.error("按状态获取待完善酒店失败:", error);
      return [];
    }
  },
  saveHotel: async (hotel: Hotel): Promise<Hotel> => {
    try {
      const hotelData = {
        ...hotel,
        status: "pending",
        updateTime: new Date().toISOString(),
      };

      return await post<Hotel>("/hotels", hotelData);
    } catch (error) {
      console.error("保存酒店失败:", error);
      throw error;
    }
  },
  updateHotel: async (id: string, hotel: Partial<Hotel>): Promise<Hotel> => {
    try {
      const hotelData = {
        ...hotel,
        status: "pending",
        updateTime: new Date().toISOString(),
      };

      return await put<Hotel>(`/hotels/${id}`, hotelData);
    } catch (error) {
      console.error("更新酒店失败:", error);
      throw error;
    }
  },

  offlineHotel: async (id: string): Promise<void> => {
    try {
      await patch(`/hotels/${id}/offline`);
    } catch (error) {
      console.error("下线酒店失败:", error);
      throw error;
    }
  },

  onlineHotel: async (id: string): Promise<void> => {
    try {
      await patch(`/hotels/${id}/online`);
    } catch (error) {
      console.error("上线酒店失败:", error);
      throw error;
    }
  },

  reapplyOnline: async (id: string): Promise<any> => {
    try {
      return await post(`/hotels/${id}/re-apply`);
    } catch (error) {
      console.error("申请恢复上线失败:", error);
      throw error;
    }
  },

  restoreHotel: async (id: string): Promise<void> => {
    try {
      await post("/hotels/restore", { id });
    } catch (error) {
      console.error("恢复酒店失败:", error);
      throw error;
    }
  },
  getHotelsByStatus: async (status: Hotel["status"]): Promise<Hotel[]> => {
    try {
      const hotels = await hotelService.getMyHotels();
      return hotels.filter((h) => h.status === status);
    } catch (error) {
      console.error("按状态获取酒店失败:", error);
      return [];
    }
  },
  getPendingHotels: async (): Promise<Hotel[]> => {
    try {
      return await hotelService.getHotelsByStatus("pending");
    } catch (error) {
      console.error("获取待审核酒店失败:", error);
      return [];
    }
  },

  getHotelById: async (
    id: string,
    signal?: AbortSignal,
  ): Promise<Hotel | null> => {
    try {
      const res = await get<any>(`/hotels/detail/${id}`, { signal });
      return res?.data || null;
    } catch (error: any) {
      if (error.name === "CanceledError" || error.name === "AbortError") {
        return null;
      }
      console.error("无法获取酒店详情，请检查 ID 是否正确");
      throw error;
    }
  },

  deleteHotel: async (id: string): Promise<void> => {
    try {
      await del(`/hotels/${id}`);
    } catch (error) {
      console.error("删除酒店失败:", error);
      throw error;
    }
  },
};
