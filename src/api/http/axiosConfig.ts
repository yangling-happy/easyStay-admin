import axios from "axios";

// 创建axios实例
const axiosInstance = axios.create({
  baseURL: "https://easystay-admin-production.up.railway.app/api", // 后端API地址
  timeout: 10000, // 请求超时时间
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error("API请求错误:", error);
    return Promise.reject(error);
  },
);

export default axiosInstance;
