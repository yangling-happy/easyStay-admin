import React, { useState } from "react";
import { Form, message } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { authApi } from "../../api/auth";
import type { RegisterParams } from "../../api/auth/types";
import LeftPanel from "./components/LeftPanel";
import RightPanel from "./components/RightPanel";
import type { FormValues } from "./types";

const RegisterPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState<"merchant" | "admin">(
    "merchant",
  );

  // 从URL参数获取角色
  const searchParams = new URLSearchParams(location.search);
  const roleFromUrl = searchParams.get("role") as "merchant" | "admin" | null;

  // 初始化角色
  React.useEffect(() => {
    if (roleFromUrl && ["merchant", "admin"].includes(roleFromUrl)) {
      setSelectedRole(roleFromUrl);
      form.setFieldValue("role", roleFromUrl);
      setCurrentStep(1);
    }
  }, [roleFromUrl, form]);

  const nextStep = () => {
    if (currentStep === 0 && !selectedRole) {
      message.warning("请选择您的身份");
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const onFinish = async (values: FormValues) => {
    setLoading(true);

    try {
      const registerData: RegisterParams = {
        username: values.username,
        email: values.email,
        password: values.password,
        role: selectedRole,
      };

      if (selectedRole === "merchant") {
        if (!values.hotelName || !values.contactPhone) {
          message.error("请填写完整的商户信息");
          setLoading(false);
          return;
        }
        registerData.hotelName = values.hotelName;
        registerData.contactPhone = values.contactPhone;
      } else if (selectedRole === "admin") {
        if (!values.department) {
          message.error("请填写完整的管理员信息");
          setLoading(false);
          return;
        }
        registerData.department = values.department;
      }

      const response = await authApi.register(registerData);

      if (response.success) {
        message.success(response.message);
        setCurrentStep(2);

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        setTimeout(() => {
          const user = response.data.user;
          if (user.role === "merchant") {
            navigate("/merchant/dashboard");
          } else {
            navigate("/admin/dashboard");
          }
        }, 3000);
      }
    } catch (error: any) {
      message.error(error.message || "注册失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
        display: "flex",
      }}
    >
      <LeftPanel />

      <RightPanel
        currentStep={currentStep}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        form={form}
        onFinish={onFinish}
        loading={loading}
        onPrev={prevStep}
        onNext={nextStep}
        navigate={navigate}
      />
    </div>
  );
};

export default RegisterPage;
