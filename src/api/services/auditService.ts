import type { Hotel } from "../../types/hotel";
import { get, post, patch } from "../http/request";

/**
 * 审核业务逻辑封装 (Service 层)
 * 作用：统一管理审核相关的API调用
 */
export const auditService = {
  /**
   * 获取待审核酒店列表
   * @returns 待审核的酒店列表
   */
  getPendingHotels: async (): Promise<Hotel[]> => {
    try {
      const response = await get<Hotel[]>('/admin/hotels/pending');
      return response;
    } catch (error) {
      console.error('获取待审核列表失败:', error);
      throw error;
    }
  },


  //获取已发布酒店列表
  getPublishedHotels: async (): Promise<Hotel[]> => {
    try {
      const response = await get<Hotel[]>('/admin/hotels/published');
      return response;
    } catch (error) {
      console.error('获取已发布酒店列表失败:', error);
      throw error;
    }
  },


  //获取已下线酒店列表
  getOfflineHotels: async (): Promise<Hotel[]> => {
    try {
      const response = await get<Hotel[]>('/admin/hotels/offline');
      return response;
    } catch (error) {
      console.error('获取已下线酒店列表失败:', error);
      throw error;
    }
  },



  //获取已拒绝酒店列表
  getRejectedHotels: async (): Promise<Hotel[]> => {
    try {
      const response = await get<Hotel[]>('/admin/hotels/rejected');
      return response;
    } catch (error) {
      console.error('获取已拒绝酒店列表失败:', error);
      throw error;
    }
  },

  /**
   * 提交审核结果
   * @param id 酒店ID
   * @param status 审核状态：'approved' | 'rejected'
   * @param rejectReason 拒绝原因（当status为'rejected'时必填）
   * @returns 更新后的酒店信息
   */
  submitAudit: async (
    id: string,
    status: 'approved' | 'rejected',
    rejectReason?: string
  ): Promise<{ message: string; hotel: Hotel }> => {
    try {
      // 如果拒绝，必须提供拒绝原因
      if (status === 'rejected' && !rejectReason) {
        throw new Error('拒绝审核时必须提供拒绝原因');
      }

      const response = await post<{ message: string; hotel: Hotel }>(
        `/admin/hotels/${id}/audit`,
        {
          status,
          rejectReason: status === 'rejected' ? rejectReason : undefined,
        }
      );
      return response;
    } catch (error) {
      console.error('提交审核结果失败:', error);
      throw error;
    }
  },

  /**
   * 切换酒店发布状态（上线/下线）
   * @param id 酒店ID
   * @returns 更新后的酒店信息
   */
  toggleHotelStatus: async (id: string): Promise<{ message: string; hotel: Hotel }> => {
    try {
      const response = await patch<{ message: string; hotel: Hotel }>(
        `/admin/hotels/${id}/toggle`
      );
      return response;
    } catch (error) {
      console.error('切换发布状态失败:', error);
      throw error;
    }
  },
};