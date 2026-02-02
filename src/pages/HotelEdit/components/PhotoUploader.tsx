import React, { useState, useRef } from "react";
import { Modal, Typography, message, Progress, Button } from "antd";
import { PlusOutlined, CompressOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd";
import { uploadService } from "../../../api/services/uploadService";
import {
  compressImage,
  previewCompression,
} from "../../../utils/imageCompressor";

interface PhotoUploaderProps {
  value?: string[];
  onChange?: (urls: string[]) => void;
  maxCount?: number;
  label?: string;
  type?: "hotel" | "room";
  showCompressInfo?: boolean;
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  value = [],
  onChange,
  maxCount = 8,
  type = "hotel",
  showCompressInfo = true,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [compressPreview, setCompressPreview] = useState<{
    original: string;
    compressed: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件选择
  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    // 检查是否超过最大数量
    if (value.length + files.length > maxCount) {
      message.warning(`最多只能上传 ${maxCount} 张图片`);
      return;
    }

    setUploading(true);

    try {
      let uploadedUrls: string[] = [];

      if (type === "hotel") {
        uploadedUrls = await uploadService.uploadHotelImages(files);
      } else {
        uploadedUrls = await uploadService.uploadRoomImages(files);
      }

      // 合并新图片
      const newValue = [...value, ...uploadedUrls];
      onChange?.(newValue);

      message.success(`成功上传 ${uploadedUrls.length} 张图片`);

      // 显示压缩信息（如果开启了）
      if (showCompressInfo && files.length > 0) {
        const originalFile = files[0];
        const compressedBlob = await compressImage(originalFile, {
          maxWidth: type === "hotel" ? 1200 : 800,
          quality: type === "hotel" ? 0.8 : 0.6,
        });

        const preview = await previewCompression(originalFile, compressedBlob);
        setCompressPreview(preview);
      }
    } catch (error: any) {
      message.error("上传失败: " + (error.message || "未知错误"));
      console.error("上传失败:", error);
    } finally {
      setUploading(false);
      setUploadProgress(0);

      // 清空 input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = (file: UploadFile) => {
    const newUrls = value.filter((url) => url !== file.url);
    onChange?.(newUrls);
    return true; // 返回 true 允许删除
  };

  // 转换现有 URL 为 UploadFile 格式
  const fileList: UploadFile[] = value.map((url, index) => ({
    uid: `existing-${index}`,
    name: `image-${index}.jpg`,
    status: "done",
    url: url,
  }));

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        {/* 隐藏的 file input */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept="image/*"
          multiple
          onChange={handleFileSelect}
        />

        {/* 自定义上传按钮 */}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          loading={uploading}
          onClick={() => fileInputRef.current?.click()}
          disabled={value.length >= maxCount}
        >
          {uploading ? "上传中..." : "选择图片上传"}
        </Button>

        {showCompressInfo && (
          <Button
            type="link"
            icon={<CompressOutlined />}
            onClick={() => setCompressPreview(null)}
            style={{ marginLeft: 8 }}
          >
            压缩说明
          </Button>
        )}

        <Typography.Text
          type="secondary"
          style={{ display: "block", marginTop: 8 }}
        >
          {type === "hotel"
            ? "酒店图片：支持 JPG/PNG，自动压缩至2MB以内"
            : "房型图片：支持 JPG/PNG，自动压缩至500KB以内"}
        </Typography.Text>
      </div>

      {/* 图片预览列表 */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        {fileList.map((file) => (
          <div
            key={file.uid}
            style={{
              position: "relative",
              width: 100,
              height: 100,
              borderRadius: 8,
              overflow: "hidden",
              border: "1px solid #d9d9d9",
            }}
          >
            <img
              src={file.url}
              alt={file.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                cursor: "pointer",
              }}
              onClick={() => {
                if (file.url) {
                  setPreviewImage(file.url); // 修复类型问题
                  setPreviewOpen(true);
                }
              }}
            />
            <Button
              size="small"
              type="text"
              danger
              style={{
                position: "absolute",
                top: 4,
                right: 4,
                background: "rgba(0,0,0,0.5)",
                color: "white",
                border: "none",
                minWidth: 24,
                height: 24,
                padding: 0,
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(file);
              }}
            >
              ×
            </Button>
          </div>
        ))}

        {value.length < maxCount && (
          <div
            style={{
              width: 100,
              height: 100,
              border: "2px dashed #d9d9d9",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              background: "#fafafa",
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <PlusOutlined style={{ fontSize: 24, color: "#999" }} />
          </div>
        )}
      </div>

      {/* 上传进度 */}
      {uploading && (
        <div style={{ marginTop: 16 }}>
          <Progress percent={uploadProgress} size="small" />
          <Typography.Text type="secondary">
            正在压缩并上传图片...
          </Typography.Text>
        </div>
      )}

      {/* 压缩效果预览 Modal */}
      <Modal
        open={!!compressPreview}
        title="压缩效果对比"
        onCancel={() => setCompressPreview(null)}
        footer={null}
        width={800}
      >
        {compressPreview && (
          <div style={{ display: "flex", gap: 20, marginTop: 16 }}>
            <div style={{ flex: 1 }}>
              <Typography.Title level={5} style={{ textAlign: "center" }}>
                原始图片
              </Typography.Title>
              <img
                src={compressPreview.original}
                alt="原始"
                style={{ width: "100%", border: "2px solid #f5222d" }}
              />
              <Typography.Text
                type="secondary"
                style={{ display: "block", textAlign: "center" }}
              >
                文件较大，加载较慢
              </Typography.Text>
            </div>
            <div style={{ flex: 1 }}>
              <Typography.Title level={5} style={{ textAlign: "center" }}>
                压缩后图片
              </Typography.Title>
              <img
                src={compressPreview.compressed}
                alt="压缩后"
                style={{ width: "100%", border: "2px solid #52c41a" }}
              />
              <Typography.Text
                type="success"
                style={{ display: "block", textAlign: "center" }}
              >
                压缩优化，快速加载
              </Typography.Text>
            </div>
          </div>
        )}
      </Modal>

      {/* 图片预览 Modal */}
      <Modal
        open={previewOpen}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
        title="图片预览"
      >
        <img
          alt="预览"
          style={{ width: "100%", maxHeight: "80vh", objectFit: "contain" }}
          src={previewImage}
        />
      </Modal>
    </>
  );
};

export default PhotoUploader;
