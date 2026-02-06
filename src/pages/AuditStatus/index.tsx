// src/pages/AuditStatus/index.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Result, Button, Typography, Spin, message } from "antd";
import { hotelService } from "../../api/services/hotelService";
import type { Hotel } from "../../types/hotel";

const { Text } = Typography;

const AuditStatusPage: React.FC = () => {
  const { hotelId } = useParams<{ hotelId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hotel, setHotel] = useState<Hotel | null>(null);

  // 加载酒店数据
  useEffect(() => {
    const loadHotelData = async () => {
      if (!hotelId) {
        message.error("未找到申请信息");
        navigate("/hotel/list");
        return;
      }

      try {
        setLoading(true);
        const hotelData = await hotelService.getHotelById(hotelId);
        setHotel(hotelData ?? null);
      } catch (error) {
        console.error("加载酒店数据失败:", error);
        message.error("加载失败");
      } finally {
        setLoading(false);
      }
    };

    loadHotelData();
  }, [hotelId, navigate]);

  // 复制酒店ID
  const handleCopyId = () => {
    if (hotelId) {
      navigator.clipboard.writeText(hotelId);
      message.success("酒店编号已复制");
    }
  };

  // 获取状态配置
  const getStatusConfig = () => {
    if (!hotel) return { status: "info" as const, title: "审核中" };

    switch (hotel.status) {
      case "pending":
        return { status: "info" as const, title: "审核中" };
      case "approved":
        return { status: "success" as const, title: "审核通过" };
      case "rejected":
        return { status: "warning" as const, title: "审核未通过" };
      default:
        return { status: "info" as const, title: "审核中" };
    }
  };

  const statusConfig = getStatusConfig();

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 100 }}>
        <Spin size="large" />
        <div style={{ marginTop: 20 }}>正在加载申请信息...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: 20 }}>
      <Result
        status={statusConfig.status}
        title={statusConfig.title}
        subTitle={
          <div>
            {/* 酒店编号 */}
            {hotelId && (
              <div style={{ marginBottom: 16 }}>
                <Text strong>酒店编号：</Text>
                <Text code copyable={{ text: hotelId }}>
                  {hotelId}
                </Text>
              </div>
            )}

            {/* 酒店名称 */}
            {hotel && (
              <div style={{ marginBottom: 16 }}>
                <Text strong>酒店名称：</Text>
                <Text>{hotel.name}</Text>
              </div>
            )}

            {/* 状态信息 */}
            <div>
              {hotel?.status === "pending" && (
                <>
                  <div>您的酒店信息已提交审核。</div>
                  <div style={{ color: "#666", marginTop: 8 }}>
                    审核结果将在24小时内通知您。
                  </div>
                </>
              )}

              {hotel?.status === "approved" && (
                <div>恭喜！您的酒店已通过审核。</div>
              )}

              {hotel?.status === "rejected" && (
                <div>
                  <div>很抱歉，您的酒店未通过审核。</div>
                  {hotel.rejectReason && (
                    <div style={{ marginTop: 8, color: "#faad14" }}>
                      原因：{hotel.rejectReason}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        }
        extra={[
          <Button
            type="primary"
            key="list"
            onClick={() => navigate("/hotel/list")}
          >
            返回酒店列表
          </Button>,
          <Button key="records" onClick={() => navigate("/merchant/records")}>
            查看申请记录
          </Button>,
          hotelId && (
            <Button key="copy" onClick={handleCopyId}>
              复制酒店编号
            </Button>
          ),
        ]}
      />
    </div>
  );
};

export default AuditStatusPage;
