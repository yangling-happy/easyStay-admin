import axios from 'axios';

// 定义接口返回的类型（对应后端的 IFeedback）
export interface FeedbackItem {
  id: string;
  hotelId: string;
  ownerId: string;
  content: string;
  reply?: string;
  status: 'pending' | 'replied';
  createdAt: string;
  repliedAt?: string;
}

const API_BASE = '/api/feedback';

export const feedbackService = {
  // 管理员获取所有反馈
  getList: (status?: string) => 
    axios.get<{ data: FeedbackItem[] }>(`${API_BASE}/list`, { params: { status } }),

  // 管理员回复反馈
  reply: (id: string, reply: string) => 
    axios.patch<{ data: FeedbackItem }>(`${API_BASE}/${id}/reply`, { reply }),
};