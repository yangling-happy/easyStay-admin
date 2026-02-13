import React from "react";
import { Card, Row, Col, Typography, Button } from "antd";
import { ShopOutlined, TeamOutlined } from "@ant-design/icons";
import type { RegisterStepProps } from "../types";

const { Title, Text } = Typography;

const RoleSelection: React.FC<RegisterStepProps & { onNext?: () => void }> = ({
  selectedRole,
  setSelectedRole,
  onNext,
}) => {
  const handleRoleSelect = (role: "merchant" | "admin") => {
    setSelectedRole(role);
  };

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <Title
          level={4}
          style={{ color: "#1890ff", marginBottom: 8, fontWeight: 600 }}
        >
          请选择您的身份
        </Title>
        <Text style={{ color: "#666", fontSize: 14 }}>
          选择您要注册的账号类型
        </Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 30 }}>
        <Col span={12}>
          <Card
            hoverable
            style={{
              border:
                selectedRole === "merchant"
                  ? "2px solid #1890ff"
                  : "1px solid #e8e8e8",
              background: selectedRole === "merchant" ? "#f0f9ff" : "#fff",
              borderRadius: 8,
              cursor: "pointer",
              height: 140,
              padding: 0,
            }}
            bodyStyle={{ padding: "20px" }}
            onClick={() => handleRoleSelect("merchant")}
          >
            <div
              style={{ display: "flex", alignItems: "center", height: "100%" }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  background:
                    selectedRole === "merchant" ? "#1890ff" : "#f5f5f5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 16,
                  flexShrink: 0,
                }}
              >
                <ShopOutlined
                  style={{
                    fontSize: 22,
                    color: selectedRole === "merchant" ? "#fff" : "#999",
                  }}
                />
              </div>
              <div>
                <Text
                  strong
                  style={{
                    fontSize: 16,
                    color: selectedRole === "merchant" ? "#1890ff" : "#333",
                  }}
                >
                  酒店商户
                </Text>
                <div style={{ marginTop: 4 }}>
                  <Text style={{ color: "#666", fontSize: 12 }}>
                    管理酒店信息与订单
                  </Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col span={12}>
          <Card
            hoverable
            style={{
              border:
                selectedRole === "admin"
                  ? "2px solid #1890ff"
                  : "1px solid #e8e8e8",
              background: selectedRole === "admin" ? "#f0f9ff" : "#fff",
              borderRadius: 8,
              cursor: "pointer",
              height: 140,
              padding: 0,
            }}
            bodyStyle={{ padding: "20px" }}
            onClick={() => handleRoleSelect("admin")}
          >
            <div
              style={{ display: "flex", alignItems: "center", height: "100%" }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  background: selectedRole === "admin" ? "#1890ff" : "#f5f5f5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 16,
                  flexShrink: 0,
                }}
              >
                <TeamOutlined
                  style={{
                    fontSize: 22,
                    color: selectedRole === "admin" ? "#fff" : "#999",
                  }}
                />
              </div>
              <div>
                <Text
                  strong
                  style={{
                    fontSize: 16,
                    color: selectedRole === "admin" ? "#1890ff" : "#333",
                  }}
                >
                  平台管理员
                </Text>
                <div style={{ marginTop: 4 }}>
                  <Text style={{ color: "#666", fontSize: 12 }}>
                    审核酒店管理平台
                  </Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <div style={{ textAlign: "center" }}>
        <Button
          type="primary"
          onClick={onNext}
          disabled={!selectedRole}
          style={{
            width: "100%",
            height: 40,
          }}
        >
          下一步
        </Button>
      </div>
    </div>
  );
};

export default RoleSelection;
