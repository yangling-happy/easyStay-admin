import axiosInstance from './axiosConfig';

// 封装GET请求
export const get = <T>(url: string, params?: Record<string, any>): Promise<T> => {
  return axiosInstance.get(url, { params });
};

// 封装POST请求
export const post = <T>(url: string, data?: Record<string, any>): Promise<T> => {
  return axiosInstance.post(url, data);
};

// 封装PUT请求
export const put = <T>(url: string, data?: Record<string, any>): Promise<T> => {
  return axiosInstance.put(url, data);
};

// 封装DELETE请求
export const del = <T>(url: string, params?: Record<string, any>): Promise<T> => {
  return axiosInstance.delete(url, { params });
};

export default {
  get,
  post,
  put,
  delete: del
};