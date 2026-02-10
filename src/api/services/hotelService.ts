import type { Hotel } from "../../types/hotel";
import { post, get, del } from "../http/request";

/**
 * 酒店业务逻辑封装 (Service 层)
 * 作用：统一管理数据的增删改查，屏蔽存储细节
 */
export const hotelService = {
  // 1. 修改这个基础方法，确保它返回的是数组
  getMyHotels: async (): Promise<Hotel[]> => {
    try {
      // 这里的 res 结构是 { success: true, data: Hotel[] }
      const res = await get<any>("/hotels/records");

      // 返回 res.data 而不是 res
      return Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
    } catch (error) {
      console.error("获取酒店列表失败:", error);
      return [];
    }
  },

  // 2. 这里的过滤逻辑就正常了
  getOnlineHotels: async (): Promise<Hotel[]> => {
    try {
      const hotels = await hotelService.getMyHotels();

      console.log("现在获取到的数组:", hotels);

      // 现在 hotels 是数组了，可以安全使用 .filter
      return hotels.filter((h) => {
        // 建议打印一下，看看你的酒店状态到底是 'approved' 还是 'pending'
        // console.log(`酒店 ${h.name} 的状态是: ${h.status}`);
        return h.status === "approved" && h.isActive === true;
      });
    } catch (error) {
      console.error("获取在线酒店失败:", error);
      return [];
    }
  },

  // 3. 保存/新增酒店
  saveHotel: async (hotel: Hotel): Promise<Hotel> => {
    try {
      const hotelData = {
        ...hotel,
        status: "pending", // 强制设为待审核
        // 提示：ownerId 已经在后端通过 Token 自动挂载了，前端可以不用传
        updateTime: new Date().toISOString(),
      };

      return await post<Hotel>("/hotels", hotelData);
    } catch (error) {
      console.error("保存酒店失败:", error);
      throw error;
    }
  },

  // 4. 逻辑删除酒店
  deleteHotel: async (id: string): Promise<void> => {
    try {
      await del(`/hotels/${id}`);
    } catch (error) {
      console.error("删除酒店失败:", error);
      throw error;
    }
  },

  // 5. 恢复酒店
  restoreHotel: async (id: string): Promise<void> => {
    try {
      await post("/hotels/restore", { id });
    } catch (error) {
      console.error("恢复酒店失败:", error);
      throw error;
    }
  },

  // 6. 按状态获取酒店
  getHotelsByStatus: async (status: Hotel["status"]): Promise<Hotel[]> => {
    try {
      const hotels = await hotelService.getMyHotels();
      return hotels.filter((h) => h.status === status);
    } catch (error) {
      console.error("按状态获取酒店失败:", error);
      return [];
    }
  },

  // 7. 获取待审核酒店
  getPendingHotels: async (): Promise<Hotel[]> => {
    try {
      return await hotelService.getHotelsByStatus("pending");
    } catch (error) {
      console.error("获取待审核酒店失败:", error);
      return [];
    }
  },
};
