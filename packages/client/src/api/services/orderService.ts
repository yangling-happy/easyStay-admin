import type { Order, OrderStatus } from "../../types/order";
import { get, patch } from "../http/request";

export const orderService = {
  getOrders: async (status?: OrderStatus, hotelId?: string): Promise<Order[]> => {
    try {
      const params: any = {};
      if (status) params.status = status;
      if (hotelId) params.hotelId = hotelId;
      const res = await get<any>("/orders/list", { params });
      return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
      console.error("获取订单列表失败:", error);
      return [];
    }
  },

  getOrderById: async (id: string): Promise<Order | null> => {
    try {
      const res = await get<any>(`/orders/detail/${id}`);
      return res?.data || null;
    } catch (error) {
      console.error("获取订单详情失败:", error);
      return null;
    }
  },

  updateOrderStatus: async (id: string, status: OrderStatus): Promise<Order | null> => {
    try {
      const res = await patch<any>(`/orders/${id}/status`, { status });
      return res?.data || null;
    } catch (error) {
      console.error("更新订单状态失败:", error);
      throw error;
    }
  },
};
