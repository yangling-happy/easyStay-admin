import React, { useState } from 'react';
import { Upload, Modal} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';

// 将文件转换为 Base64 字符串的工具函数
const getBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const PhotoUploader: React.FC<{ value?: string[]; onChange?: (urls: string[]) => void }> = ({ value, onChange }) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  
  // 将传入的 string[] 转换为 Upload 组件需要的 fileList 格式
  const fileList: UploadFile[] = (value || []).map((url, index) => ({
    uid: `${index}`,
    name: `image-${index}.png`,
    status: 'done',
    url: url,
  }));

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as File);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const handleChange: UploadProps['onChange'] = async ({ fileList: newFileList }) => {
    // 提取所有的图片数据（Base64 或 URL）
    const urls = await Promise.all(
      newFileList.map(async (file) => {
        if (file.url) return file.url;
        return await getBase64(file.originFileObj as File);
      })
    );
    // 触发 Form 的自动收集机制
    onChange?.(urls);
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>上传酒店照片</div>
    </div>
  );

  return (
    <>
      <Upload
        listType="picture-card"
        fileList={fileList}
        onPreview={handlePreview}
        onChange={handleChange}
        beforeUpload={() => false} // 阻止默认上传行为，我们手动处理
        multiple
      >
        {fileList.length >= 8 ? null : uploadButton}
      </Upload>
      <Modal open={previewOpen} footer={null} onCancel={() => setPreviewOpen(false)}>
        <img alt="预览" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </>
  );
};

export default PhotoUploader;