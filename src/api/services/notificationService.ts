import { get, patch } from "../http/request";

/**
 * 通知业务逻辑封装 (Service 层)
 * 作用：统一管理通知相关的API调用
 */

export interface Notification {
  id: string;
  type: "audit_result" | "feedback_reply" | "system";
  hotelId?: string;
  hotelName?: string;
  ownerId: string;
  status: "unread" | "read";
  message: string;
  relatedId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
    unreadCount: number;
  };
}

export interface NotificationReadResponse {
  success: boolean;
  message: string;
  data: Notification;
}

export interface NotificationReadAllResponse {
  success: boolean;
  message: string;
  data: {
    modifiedCount: number;
  };
}

export interface NotificationDetailResponse {
  success: boolean;
  data: {
    notification: Notification;
    relatedFeedback?: {
      id: string;
      content: string;
      reply?: string;
      status: string;
      createdAt: string;
      repliedAt?: string;
    } | null;
  };
}



export const notificationService = {
  /**
   * 获取当前用户的通知列表
   * @param params 查询参数（type, status, page, pageSize）
   * @returns 通知列表和未读数
   */
  getNotifications: async (params?: {
    type?: string;
    status?: "unread" | "read";
    page?: number;
    pageSize?: number;
  }): Promise<NotificationListResponse> => {
    try {
      // ✅ 添加时间戳参数防止浏览器缓存（304）
      const queryParams = {
        ...params,
        _t: Date.now(), // 时间戳参数
      };
      const response = await get<NotificationListResponse>("/notification", queryParams);
      return response;
    } catch (error) {
      console.error("获取通知列表失败:", error);
      throw error;
    }
  },

  /**
     * 获取单个通知详情
     * @param notificationId 通知ID
     * @returns 通知详情和关联的反馈信息（如果有）
     */
  getNotificationDetail: async (notificationId: string): Promise<NotificationDetailResponse> => {
    try {
      const response = await get<NotificationDetailResponse>(`/notification/${notificationId}`);
      return response;
    } catch (error) {
      console.error("获取通知详情失败:", error);
      throw error;
    }
  },




  /**
   * 标记单个通知为已读
   * @param notificationId 通知ID
   * @returns 更新后的通知信息
   */
  markAsRead: async (notificationId: string): Promise<NotificationReadResponse> => {
    try {
      const response = await patch<NotificationReadResponse>(
        `/notification/${notificationId}/read`
      );
      return response;
    } catch (error) {
      console.error("标记通知已读失败:", error);
      throw error;
    }
  },

  /**
   * 标记所有通知为已读
   * @returns 更新的通知数量
   */
  markAllAsRead: async (): Promise<NotificationReadAllResponse> => {
    try {
      const response = await patch<NotificationReadAllResponse>("/notification/read-all");
      return response;
    } catch (error) {
      console.error("批量标记已读失败:", error);
      throw error;
    }
  },



};