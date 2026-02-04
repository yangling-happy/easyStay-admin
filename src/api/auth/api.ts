import request from '../http/request';
import type { RegisterParams, LoginParams, AuthResponse, MeResponse, UserInfo } from './types'; // 导入 UserInfo 类型

export const authApi = {
  /**
   * 用户注册
   */
  register: async (data: RegisterParams): Promise<AuthResponse> => {
    return request.post('/auth/register', data);
  },

  /**
   * 用户登录
   */
  login: async (data: LoginParams): Promise<AuthResponse> => {
    return request.post('/auth/login', data);
  },

  /**
   * 获取当前用户信息
   */
  getCurrentUser: async (): Promise<MeResponse> => {
    return request.get('/auth/me');
  },

  /**
   * 退出登录
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // 可以调用后端的退出接口（如果有）
    // return request.post('/auth/logout');
  },

  /**
   * 检查登录状态
   */
  checkAuth: (): boolean => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  /**
   * 获取当前用户角色
   */
  getUserRole: (): 'merchant' | 'admin' | null => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
      const user: UserInfo = JSON.parse(userStr); // 显式指定类型为 UserInfo
      return user.role;
    } catch (error) {
      console.error('解析用户信息失败:', error);
      return null;
    }
  },

  /**
   * 获取当前用户完整信息
   */
  getUserInfo: (): UserInfo | null => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
      const user: UserInfo = JSON.parse(userStr); // 显式指定类型为 UserInfo
      return user;
    } catch (error) {
      console.error('解析用户信息失败:', error);
      return null;
    }
  },
};