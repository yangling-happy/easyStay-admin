// src/pages/Register/components/RightPanel.tsx
import React from "react";
import { Steps, Typography, Divider } from "antd";
import { Link } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";
import RoleSelection from "./RoleSelection";
import RegisterForm from "./RegisterForm";
import SuccessStep from "./SuccessStep";
import type { RegisterStepProps } from "../types";

const { Title, Text } = Typography;

interface RightPanelProps extends RegisterStepProps {
  currentStep: number;
  navigate: any;
}

const steps = [
  { title: "身份选择", description: "" },
  { title: "信息填写", description: "" },
  { title: "完成", description: "" },
];

const RightPanel: React.FC<RightPanelProps> = ({
  currentStep,
  selectedRole,
  setSelectedRole,
  form,
  onFinish,
  loading,
  onPrev,
  onNext,
  navigate,
}) => {
  return (
    <div
      style={{
        flex: 1,
        width: "100%",
        minHeight: "100vh",
        fontFamily: "sans-serif",
        lineHeight: 1.15,
        WebkitTextSizeAdjust: "100%",
        WebkitTapHighlightColor: "rgba(0, 0, 0, 0)",
        boxSizing: "border-box",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 800,
          padding: "60px 40px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
        }}
      >
        <div style={{ 
          textAlign: "center", 
          marginBottom: 40,
          width: "100%"
        }}>
          <Title level={2} style={{ color: "#1890ff", marginBottom: 12 }}>
            注册账号
          </Title>
          <Text style={{ color: "#666", fontSize: 16 }}>
            选择身份并填写信息，快速完成注册
          </Text>
        </div>

        <div style={{ 
          width: "100%", 
          maxWidth: 600,
          marginBottom: 40 
        }}>
          <Steps
            current={currentStep}
            items={steps}
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ 
          width: "100%", 
          maxWidth: 600,
          display: "flex",
          flexDirection: "column",
          flex: 1,
          justifyContent: "center",
        }}>
          {currentStep === 0 && (
            <div style={{ 
              width: "100%",
              display: "flex", 
              flexDirection: "column",
            }}>
              <RoleSelection
                selectedRole={selectedRole}
                setSelectedRole={setSelectedRole}
                onNext={onNext}
              />
            </div>
          )}
          
          {currentStep === 1 && (
            <div style={{ 
              width: "100%",
              display: "flex", 
              flexDirection: "column",
            }}>
              <RegisterForm
                selectedRole={selectedRole}
                setSelectedRole={setSelectedRole} 
                form={form}
                onFinish={onFinish}
                loading={loading}
                onPrev={onPrev}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div style={{ 
              width: "100%",
              display: "flex", 
              flexDirection: "column",
              alignItems: "center",
            }}>
              <SuccessStep selectedRole={selectedRole} navigate={navigate} />
            </div>
          )}
        </div>

        {currentStep !== 2 && (
          <>
            <Divider style={{ 
              margin: "40px 0 30px", 
              width: "100%", 
              maxWidth: 600 
            }} />
            <div style={{ 
              textAlign: "center", 
              width: "100%",
              maxWidth: 600
            }}>
              <Text style={{ color: "#666", fontSize: 15 }}>已有账号？</Text>
              <Link 
                to="/login" 
                style={{ 
                  marginLeft: 8, 
                  color: "#1890ff",
                  fontSize: 15,
                  fontWeight: 500
                }}
              >
                立即登录
              </Link>
            </div>
          </>
        )}

        <div style={{ 
          textAlign: "center", 
          marginTop: 40,
          width: "100%",
          maxWidth: 600
        }}>
          <Link 
            to="/" 
            style={{ 
              color: "#666", 
              fontSize: 14,
              display: "inline-flex",
              alignItems: "center"
            }}
          >
            <ArrowLeftOutlined style={{ marginRight: 8 }} />
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RightPanel;