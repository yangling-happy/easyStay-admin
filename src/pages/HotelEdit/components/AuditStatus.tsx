//src\pages\HotelEdit\components\AuditStatus.tsx
import React, { useEffect, useState } from "react";
import { Result, Button, Typography, Spin, message } from "antd";
import { hotelService } from "../../../api/services/hotelService";
import type { Hotel } from "../../../types/hotel";

const { Text, Paragraph } = Typography;

interface AuditStatusProps {
  // 方式1：直接传入hotelId
  hotelId?: string;
  // 方式2：传入完整的酒店数据
  hotelData?: Hotel;
  // 回调函数
  onBack: () => void;
  onViewRecords?: () => void;
  // 加载状态
  loading?: boolean;
}

const AuditStatus: React.FC<AuditStatusProps> = ({
  hotelId,
  hotelData: initialHotelData,
  onBack,
  onViewRecords,
  loading: externalLoading = false,
}) => {
  const [hotel, setHotel] = useState<Hotel | undefined>(initialHotelData);
  const [internalLoading, setInternalLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const loading = externalLoading || internalLoading;

  // 如果有hotelId但没有hotelData，则加载数据
  useEffect(() => {
    const loadHotelData = async () => {
      if (hotelId && !hotel) {
        try {
          setInternalLoading(true);
          const hotelData = await hotelService.getHotelById(hotelId);
          if (hotelData) {
            setHotel(hotelData);
          } else {
            setError("未找到申请记录");
          }
        } catch (err) {
          console.error("加载酒店数据失败:", err);
          setError("加载申请信息失败");
        } finally {
          setInternalLoading(false);
        }
      }
    };

    loadHotelData();
  }, [hotelId, hotel]);

  // 获取状态配置
  const getStatusConfig = (status: string) => {
    const configs = {
      pending: {
        status: "info" as const,
        title: "审核中",
        color: "#1890ff",
        message: "您的申请已提交，正在等待审核",
      },
      approved: {
        status: "success" as const,
        title: "审核通过",
        color: "#52c41a",
        message: "恭喜！您的申请已通过审核",
      },
      rejected: {
        status: "warning" as const,
        title: "审核未通过",
        color: "#faad14",
        message: "很抱歉，您的申请未通过审核",
      },
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const statusConfig = hotel
    ? getStatusConfig(hotel.status)
    : getStatusConfig("pending");

  // 处理查看记录
  const handleViewRecords = () => {
    if (onViewRecords) {
      onViewRecords();
    } else {
      // 默认行为
      window.location.href = "/hotel/records";
    }
  };

  // 复制申请编号
  const handleCopyId = () => {
    const idToCopy = hotel?.id || hotelId;
    if (idToCopy) {
      navigator.clipboard.writeText(idToCopy);
      message.success("申请编号已复制到剪贴板");
    }
  };

  // 加载状态
  if (loading) {
    return (
      <Result
        icon={<Spin size="large" />}
        title="正在加载申请信息..."
        subTitle="请稍候"
      />
    );
  }

  // 错误状态
  if (error) {
    return (
      <Result
        status="error"
        title="加载失败"
        subTitle={error}
        extra={[
          <Button type="primary" key="back" onClick={onBack}>
            返回酒店列表
          </Button>,
          <Button key="retry" onClick={() => window.location.reload()}>
            重新加载
          </Button>,
        ]}
      />
    );
  }

  // 成功状态 - 使用动态内容
  return (
    <Result
      status={statusConfig.status}
      title={
        <div>
          <div style={{ fontSize: 24, fontWeight: 500, marginBottom: 8 }}>
            {statusConfig.title}
          </div>
          {hotel && (
            <div style={{ fontSize: 16, color: "#666" }}>{hotel.name}</div>
          )}
        </div>
      }
      subTitle={
        <div style={{ textAlign: "left", maxWidth: 600, margin: "0 auto" }}>
          {/* 申请编号 */}
          {(hotel?.id || hotelId) && (
            <Paragraph style={{ marginBottom: 16 }}>
              <Text strong>申请编号：</Text>
              <Text
                code
                style={{
                  fontSize: 16,
                  padding: "4px 8px",
                  backgroundColor: "#f5f5f5",
                }}
              >
                {hotel?.id || hotelId}
              </Text>
            </Paragraph>
          )}

          {/* 状态信息 */}
          <Paragraph style={{ marginBottom: 16 }}>
            <Text>{statusConfig.message}</Text>
            {hotel?.status === "pending" && (
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">
                  审核结果将在 24 小时内发送至您的后台通知，请耐心等待。
                </Text>
              </div>
            )}
          </Paragraph>

          {/* 拒绝原因 */}
          {hotel?.status === "rejected" && hotel.rejectReason && (
            <Paragraph
              style={{
                backgroundColor: "#fff7e6",
                padding: 12,
                borderRadius: 6,
                marginBottom: 16,
              }}
            >
              <Text
                strong
                style={{ color: "#faad14", display: "block", marginBottom: 4 }}
              >
                审核意见：
              </Text>
              <Text>{hotel.rejectReason}</Text>
            </Paragraph>
          )}

          {/* 酒店基本信息 */}
          {hotel && (
            <div
              style={{
                border: "1px solid #f0f0f0",
                borderRadius: 8,
                padding: 16,
                marginTop: 16,
              }}
            >
              <div style={{ fontSize: 14, color: "#666", marginBottom: 12 }}>
                申请信息摘要
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <Text type="secondary">酒店名称：</Text>
                  <Text>{hotel.name}</Text>
                </div>
                <div>
                  <Text type="secondary">星级：</Text>
                  <Text>{hotel.star}星</Text>
                </div>
                <div>
                  <Text type="secondary">地址：</Text>
                  <Text>{hotel.address}</Text>
                </div>
                <div>
                  <Text type="secondary">开业日期：</Text>
                  <Text>{hotel.openingDate}</Text>
                </div>
              </div>
            </div>
          )}
        </div>
      }
      extra={[
        <Button type="primary" key="back" onClick={onBack}>
          返回酒店列表
        </Button>,
        <Button key="records" onClick={handleViewRecords}>
          查看申请记录
        </Button>,
        (hotel?.id || hotelId) && (
          <Button key="copy" onClick={handleCopyId}>
            复制申请编号
          </Button>
        ),
      ]}
    />
  );
};

export default AuditStatus;
