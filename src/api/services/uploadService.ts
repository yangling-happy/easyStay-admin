import axios from "axios";
import { compressImages, compressImage } from "../../utils/imageCompressor";

// 创建配置好的 axios 实例
const api = axios.create({
  baseURL: "https://easystay-admin-production.up.railway.app",
  timeout: 30000,
});

// 辅助函数：确保返回完整 URL
const ensureFullUrl = (url: string): string => {
  // 如果已经是完整 URL，直接返回
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // 如果是相对路径（以 /uploads/ 开头），加上 baseURL
  if (url.startsWith("/uploads/")) {
    return `https://easystay-admin-production.up.railway.app${url}`;
  }

  // 其他情况，直接返回（可能是文件名）
  return url;
};

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

    const response = await api.post("/api/upload/single", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // 确保返回完整 URL
    return ensureFullUrl(response.data.url);
  },

  // 上传酒店图片（优化版本）
  async uploadHotelImages(files: File[]): Promise<string[]> {
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
        // Calculate upload progress (not currently used)
        progressEvent.total
          ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
          : 0;
      },
      timeout: 60000,
    });
    return response.data.data.map((item: any) => ensureFullUrl(item.url));
  },

  // 上传房型图片（压缩得更小）
  async uploadRoomImages(files: File[]): Promise<string[]> {
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

    // 确保所有 URL 都是完整的
    return response.data.data.map((item: any) => ensureFullUrl(item.url));
  },

  // 上传多张图片（带压缩）
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

    // 确保所有 URL 都是完整的
    return response.data.files.map((item: any) => ensureFullUrl(item.url));
  },
};
