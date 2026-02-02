import axios from "axios";
import { compressImages, compressImage } from "../../utils/imageCompressor";

// 创建配置好的 axios 实例
const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 30000, // 30秒超时，图片上传可能较慢
});

export const uploadService = {
  // 上传单张图片（带压缩）
  async uploadSingleImage(file: File, compress = true): Promise<string> {
    let fileToUpload = file;

    if (compress) {
      try {
        const compressedBlob = await compressImage(file, {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 0.7,
          maxSizeMB: 1,
          outputType: "image/jpeg",
        });

        fileToUpload = new File([compressedBlob], `compressed_${file.name}`, {
          type: compressedBlob.type,
        });
      } catch (error) {
        console.warn("图片压缩失败，使用原文件上传", error);
      }
    }

    const formData = new FormData();
    formData.append("image", fileToUpload);

    // 使用 api 实例，路径会自动加上 baseURL
    const response = await api.post("/api/upload/single", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.url;
  },

  // 上传酒店图片（优化版本）
  async uploadHotelImages(files: File[]): Promise<string[]> {
    console.log("开始上传酒店图片，数量:", files.length);

    // 批量压缩
    const compressedFiles = await compressImages(files, {
      maxWidth: 1200,
      maxHeight: 800,
      quality: 0.8,
      maxSizeMB: 2,
      outputType: "image/jpeg",
    });

    const formData = new FormData();
    compressedFiles.forEach((file) => {
      formData.append("images", file);
    });

    formData.append("type", "hotel");

    const response = await api.post("/api/upload/hotel", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        const percent = progressEvent.total
          ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
          : 0;
        console.log(`上传进度: ${percent}%`);
      },
      timeout: 60000, // 图片上传需要更长时间
    });

    console.log("上传成功:", response.data);
    return response.data.data.map((item: any) => item.url);
  },

  // 上传房型图片（压缩得更小）
  async uploadRoomImages(files: File[]): Promise<string[]> {
    console.log("开始上传房型图片，数量:", files.length);

    const compressedFiles = await compressImages(files, {
      maxWidth: 800,
      maxHeight: 600,
      quality: 0.6,
      maxSizeMB: 0.5,
      outputType: "image/jpeg",
    });

    const formData = new FormData();
    compressedFiles.forEach((file) => {
      formData.append("images", file);
    });

    formData.append("type", "room");

    const response = await api.post("/api/upload/room-type", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data.map((item: any) => item.url);
  },

  // 上传多张图片（带压缩） - 更新版
  async uploadMultipleImages(
    files: File[],
    compress = true,
  ): Promise<string[]> {
    let filesToUpload = files;

    if (compress) {
      try {
        filesToUpload = await compressImages(files, {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 0.7,
          maxSizeMB: 1,
          outputType: "image/jpeg",
        });
      } catch (error) {
        console.warn("批量图片压缩失败，使用原文件上传", error);
      }
    }

    const formData = new FormData();
    filesToUpload.forEach((file) => {
      formData.append("images", file);
    });

    const response = await api.post("/api/upload/multiple", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.files.map((item: any) => item.url);
  },
};