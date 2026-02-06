// src/pages/HotelList/hooks/useHotelActions.ts
import { post } from "@/api/http/request";
import { message } from "antd";

export const useHotelActions = (refresh: () => void) => {
  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      // 这里的路径对应你后端的更新接口
      const res: any = await post(`/hotels/${id}/toggle-active`, {
        isActive: !currentStatus
      });
      if (res.success) {
        message.success(res.isActive ? "酒店已上线" : "酒店已下线");
        refresh(); // 刷新列表
      }
    } catch (error) {
      message.error("操作失败，请重试");
    }
  };

  return { toggleActive };
};