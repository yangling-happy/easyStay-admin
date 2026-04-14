import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Result, Button, Spin, message } from "antd";
import { hotelService } from "../../api/services/hotelService";
import type { Hotel } from "../../types/hotel";
import { getAuditResultConfig } from "../../store/hotelAuditFsm";
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
        navigate("/hotels");
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

  const statusConfig = getAuditResultConfig(hotel);

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
            {/* 状态信息 */}
            <div>
              {hotel?.isIncomplete ? (
                <div>
                  <div>{statusConfig.message}</div>
                  <div style={{ marginTop: 8, color: "#faad14" }}>
                    请完善酒店信息后重新提交审核。
                  </div>
                </div>
              ) : hotel?.status === "pending" ? (
                <>
                  <div>{statusConfig.message}</div>
                  <div style={{ color: "#666", marginTop: 8 }}>
                    审核结果将在24小时内通知您。
                  </div>
                </>
              ) : hotel?.status === "rejected" ? (
                <div>
                  <div>{statusConfig.message}</div>
                  {hotel.rejectReason && (
                    <div style={{ marginTop: 8, color: "#faad14" }}>
                      原因：{hotel.rejectReason}
                    </div>
                  )}
                </div>
              ) : (
                <div>{statusConfig.message}</div>
              )}
            </div>
          </div>
        }
        extra={[
          <Button type="primary" key="list" onClick={() => navigate("/hotels")}>
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
