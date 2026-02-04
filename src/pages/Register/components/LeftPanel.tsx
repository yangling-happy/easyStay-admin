import React from "react";
import { Typography, Row, Col } from "antd";
import { HomeOutlined, ShopOutlined, TeamOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const LeftPanel: React.FC = () => {
  return (
    <div
      style={{
        flex: " 0  0 40%",
        background: "#1890ff",
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "#fff",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 500 }}>
        <HomeOutlined
          style={{ fontSize: 64, marginBottom: 24, color: "#fff" }}
        />
        <Title
          level={2}
          style={{ color: "#fff", marginBottom: 16, fontWeight: 600 }}
        >
          易宿酒店管理平台
        </Title>
        <Text
          style={{
            color: "rgba(255, 255, 255, 0.9)",
            fontSize: 16,
            display: "block",
            marginBottom: 32,
            lineHeight: 1.6,
          }}
        >
          专业的酒店管理系统，为酒店商户和管理员提供全方位的业务支持
        </Text>

        <Row gutter={[0, 20]} style={{ marginTop: 40 }}>
          <Col span={24}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 16,
                  flexShrink: 0,
                }}
              >
                <ShopOutlined style={{ color: "#fff" }} />
              </div>
              <div>
                <Text strong style={{ fontSize: 16, color: "#fff" }}>
                  商户功能   
                </Text>
                <Text
                  style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: 14 }}
                >
                  酒店管理、房型发布、订单处理
                </Text>
              </div>
            </div>
          </Col>

          <Col span={24}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 16,
                  flexShrink: 0,
                }}
              >
                <TeamOutlined style={{ color: "#fff" }} />
              </div>
              <div>
                <Text strong style={{ fontSize: 16, color: "#fff" }}>
                  管理员功能
                </Text>
                <Text
                  style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: 14 }}
                >
                  商户审核、平台监控、数据统计
                </Text>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default LeftPanel;
