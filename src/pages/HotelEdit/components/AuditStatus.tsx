import React, { useEffect, useState } from "react";
import { Result, Button, Typography, Spin, message } from "antd";
import { useNavigate } from "react-router-dom";
import { hotelService } from "../../../api/services/hotelService";
import type { Hotel } from "../../../types/hotel";

const { Text, Paragraph } = Typography;

const getStatusConfig = (status?: string) => {
  const configs = {
    pending: {
      status: "info" as const,
      title: "审核中",
      message: "您的申请已提交，正在等待审核",
    },
    approved: {
      status: "success" as const,
      title: "审核通过",
      message: "恭喜！您的申请已通过审核",
    },
    rejected: {
      status: "warning" as const,
      title: "审核未通过",
      message: "很抱歉，您的申请未通过审核",
    },
  };
  return configs[status as keyof typeof configs] || configs.pending;
};

interface AuditStatusProps {
  hotelId?: string;
  hotelData?: Hotel;
  onBack?: () => void;
  onViewRecords?: () => void;
  loading?: boolean;
}

const AuditStatus: React.FC<AuditStatusProps> = ({
  hotelId,
  hotelData: initialHotelData,
  onBack,
  onViewRecords,
  loading: externalLoading = false,
}) => {
  const navigate = useNavigate();

  const [hotel, setHotel] = useState<Hotel | undefined>(initialHotelData);
  const [internalLoading, setInternalLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const loading = externalLoading || internalLoading;

  useEffect(() => {
    if (hotel || !hotelId) return;

    const loadHotelData = async () => {
      try {
        setInternalLoading(true);
        const data = await hotelService.getHotelById(hotelId);
        data ? setHotel(data) : setError("未找到申请记录");
      } catch (err) {
        setError("加载申请信息失败");
      } finally {
        setInternalLoading(false);
      }
    };

    loadHotelData();
  }, [hotelId]);

  const statusConfig = getStatusConfig(hotel?.status);

  const handleBack = () => {
    if (onBack) return onBack();
    navigate("/hotels", { replace: true });
  };

  const handleViewRecords = () => {
    if (onViewRecords) return onViewRecords();
    navigate("/hotel/records");
  };

  const handleCopyId = () => {
    const idToCopy = hotel?.id || hotelId;
    if (idToCopy) {
      navigator.clipboard.writeText(idToCopy);
      message.success("申请编号已复制");
    }
  };

  if (loading) {
    return <Result icon={<Spin size="large" />} title="正在加载..." />;
  }

  if (error) {
    return (
      <Result
        status="error"
        title="加载失败"
        subTitle={error}
        extra={[
          <Button type="primary" key="back" onClick={handleBack}>
            返回列表
          </Button>,
          <Button key="retry" onClick={() => window.location.reload()}>
            重试
          </Button>,
        ]}
      />
    );
  }

  return (
    <Result
      status={statusConfig.status}
      title={
        <div>
          <div style={{ fontSize: 24, fontWeight: 500 }}>
            {statusConfig.title}
          </div>
          {hotel && (
            <div style={{ fontSize: 16, color: "#666" }}>{hotel.name}</div>
          )}
        </div>
      }
      subTitle={
        <div style={{ textAlign: "left", maxWidth: 600, margin: "0 auto" }}>
          <Paragraph>
            申请编号：<Text code>{hotel?.id || hotelId}</Text>
          </Paragraph>
          <Paragraph>{statusConfig.message}</Paragraph>
        </div>
      }
      extra={[
        <Button type="primary" key="back" onClick={handleBack}>
          返回列表
        </Button>,
        <Button key="records" onClick={handleViewRecords}>
          查看记录
        </Button>,
        <Button key="copy" onClick={handleCopyId}>
          复制编号
        </Button>,
      ]}
    />
  );
};

export default AuditStatus;
