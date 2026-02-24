/**
 * 批量导入后照片上传组件
 * 功能：为批量导入的酒店和房型上传照片
 */

import React, { useState } from "react";
import {
  Modal,
  Steps,
  Card,
  Upload,
  Button,
  message,
  Progress,
  Space,
  Typography,
  Tag,
} from "antd";
import {
  UploadOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd";
import type { Hotel } from "../../../types/hotel";

const { Title, Paragraph, Text } = Typography;

interface PhotoUploadModalProps {
  visible: boolean;
  hotels: Hotel[];
  onClose: () => void;
  onComplete: () => void;
}

const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  visible,
  hotels,
  onClose,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [hotelPhotos, setHotelPhotos] = useState<Map<string, UploadFile[]>>(
    new Map(),
  );
  const [roomTypePhotos, setRoomTypePhotos] = useState<
    Map<string, UploadFile[]>
  >(new Map());

  const handleHotelPhotoChange = (hotelId: string) => (info: any) => {
    setHotelPhotos((prev) => {
      const newMap = new Map(prev);
      newMap.set(hotelId, info.fileList);
      return newMap;
    });
  };

  const handleRoomTypePhotoChange = (roomKey: string) => (info: any) => {
    setRoomTypePhotos((prev) => {
      const newMap = new Map(prev);
      newMap.set(roomKey, info.fileList);
      return newMap;
    });
  };

  const handleUpload = async () => {
    setUploading(true);
    setUploadProgress(0);

    try {
      // 模拟上传过程
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        setUploadProgress(i);
      }

      message.success("照片上传成功！");
      onComplete();
    } catch (error) {
      message.error("照片上传失败");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const getHotelPhotoCount = (hotelId: string): number => {
    return hotelPhotos.get(hotelId)?.length || 0;
  };

  const getRoomTypePhotoCount = (
    hotelId: string,
    roomIndex: number,
  ): number => {
    const roomKey = `${hotelId}_${roomIndex}`;
    return roomTypePhotos.get(roomKey)?.length || 0;
  };

  const isStepComplete = (step: number): boolean => {
    if (step === 0) {
      return hotels.every((hotel) => getHotelPhotoCount(hotel.id || "") >= 3);
    }
    if (step === 1) {
      return hotels.every((hotel) =>
        hotel.roomTypes.every(
          (_, index) => getRoomTypePhotoCount(hotel.id || "", index) >= 3,
        ),
      );
    }
    return false;
  };

  const uploadButton = <Button icon={<UploadOutlined />}>点击上传照片</Button>;

  return (
    <Modal
      title="批量上传酒店照片"
      open={visible}
      onCancel={onClose}
      width={1000}
      footer={[
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        currentStep > 0 && (
          <Button key="prev" onClick={() => setCurrentStep(currentStep - 1)}>
            上一步
          </Button>
        ),
        currentStep < 1 ? (
          <Button
            key="next"
            type="primary"
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!isStepComplete(currentStep)}
          >
            下一步 <ArrowRightOutlined />
          </Button>
        ) : (
          <Button
            key="upload"
            type="primary"
            onClick={handleUpload}
            loading={uploading}
            disabled={!isStepComplete(currentStep)}
          >
            完成上传
          </Button>
        ),
      ]}
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Card>
          <Title level={4}>照片上传说明</Title>
          <Paragraph>
            批量导入成功后，请为每个酒店和房型上传照片。照片是展示酒店特色的重要元素，建议上传高质量的照片。
          </Paragraph>
          <Space>
            <Tag color="blue">酒店照片：3-8张</Tag>
            <Tag color="green">房型照片：3-5张</Tag>
          </Space>
        </Card>

        <Steps current={currentStep}>
          <Steps.Step
            title="上传酒店照片"
            description="为每个酒店上传整体照片"
            status={isStepComplete(0) ? "finish" : "process"}
            icon={isStepComplete(0) ? <CheckCircleOutlined /> : undefined}
          />
          <Steps.Step
            title="上传房型照片"
            description="为每个房型上传细节照片"
            status={isStepComplete(1) ? "finish" : "process"}
            icon={isStepComplete(1) ? <CheckCircleOutlined /> : undefined}
          />
        </Steps>

        {uploading && (
          <Card>
            <Progress percent={uploadProgress} status="active" />
            <Paragraph type="secondary">正在上传照片，请稍候...</Paragraph>
          </Card>
        )}

        {currentStep === 0 && (
          <div>
            <Title level={5}>酒店照片上传</Title>
            <Paragraph type="secondary">
              请为每个酒店上传3-8张大堂或外景照片
            </Paragraph>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              {hotels.map((hotel) => (
                <Card
                  key={hotel.id}
                  size="small"
                  title={
                    <Space>
                      <Text strong>{hotel.name}</Text>
                      <Text type="secondary">({hotel.nameEn})</Text>
                      <Tag
                        color={
                          getHotelPhotoCount(hotel.id || "") >= 3
                            ? "success"
                            : "warning"
                        }
                      >
                        {getHotelPhotoCount(hotel.id || "")}/3 张
                      </Tag>
                    </Space>
                  }
                >
                  <Upload
                    listType="picture-card"
                    fileList={hotelPhotos.get(hotel.id || "") || []}
                    onChange={handleHotelPhotoChange(hotel.id || "")}
                    beforeUpload={() => false}
                    maxCount={8}
                  >
                    {(hotelPhotos.get(hotel.id || "") || []).length >= 8
                      ? null
                      : uploadButton}
                  </Upload>
                </Card>
              ))}
            </Space>
          </div>
        )}

        {currentStep === 1 && (
          <div>
            <Title level={5}>房型照片上传</Title>
            <Paragraph type="secondary">
              请为每个房型上传3-5张客房细节、卫浴等照片
            </Paragraph>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              {hotels.map((hotel) => (
                <div key={hotel.id}>
                  <Title level={5} style={{ marginTop: 24 }}>
                    {hotel.name} ({hotel.nameEn})
                  </Title>
                  {hotel.roomTypes.map((roomType, roomIndex) => {
                    const roomKey = `${hotel.id}_${roomIndex}`;
                    const photoCount = getRoomTypePhotoCount(
                      hotel.id || "",
                      roomIndex,
                    );
                    return (
                      <Card
                        key={roomKey}
                        size="small"
                        title={
                          <Space>
                            <Text strong>{roomType.name}</Text>
                            <Text type="secondary">¥{roomType.price}/晚</Text>
                            <Tag
                              color={photoCount >= 3 ? "success" : "warning"}
                            >
                              {photoCount}/3 张
                            </Tag>
                          </Space>
                        }
                      >
                        <Upload
                          listType="picture-card"
                          fileList={roomTypePhotos.get(roomKey) || []}
                          onChange={handleRoomTypePhotoChange(roomKey)}
                          beforeUpload={() => false}
                          maxCount={5}
                        >
                          {photoCount >= 5 ? null : uploadButton}
                        </Upload>
                      </Card>
                    );
                  })}
                </div>
              ))}
            </Space>
          </div>
        )}
      </Space>
    </Modal>
  );
};

export default PhotoUploadModal;
