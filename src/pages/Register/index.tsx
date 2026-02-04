import React, { useState } from "react";
import { Form, message } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { authApi } from "../../api/auth";
// import type { RegisterParams } from "../../api/auth/types";
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
      const registerData: any = {
        username: values.username,
        email: values.email,
        role: selectedRole,
      };

      console.log("1. 准备发送的数据（不含密码）:", registerData);

      // 特别注意：检查密码字段
      if (values.password) {
        registerData.password = values.password;
        console.log("2. 添加密码字段后:", registerData);
      } else {
        console.error("密码字段为空！");
        message.error("密码不能为空");
        setLoading(false);
        return;
      }

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

      console.log("3. 最终发送的数据:", registerData);
      console.log("4. 数据JSON字符串:", JSON.stringify(registerData));

      const response = await authApi.register(registerData);

      console.log("5. 注册API响应:", response);

      if (response.success) {
        message.success(response.message);
        setCurrentStep(2);

        // 检查响应中是否有 token 和 user
        console.log("6. 注册响应数据:", {
          token: response.data?.token,
          user: response.data?.user,
          hasToken: !!response.data?.token,
          hasUser: !!response.data?.user,
        });

        if (response.data?.token) {
          localStorage.setItem("token", response.data.token);
          console.log("7. Token 已存储到 localStorage");
        } else {
          console.error("响应中没有 token 字段");
        }

        if (response.data?.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
          console.log("8. User 信息已存储");
        }

        setTimeout(() => {
          console.log("9. 准备跳转到仪表板");
          const user = response.data?.user;
          if (user?.role === "merchant") {
            navigate("/merchant/dashboard");
          } else {
            navigate("/admin/dashboard");
          }
        }, 3000);
      } else {
        console.error("注册API返回成功但 success 为 false:", response);
      }
    } catch (error: any) {
      console.error("10. 注册过程错误:", {
        name: error.name,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      if (error.response?.data?.message) {
        message.error(`注册失败: ${error.response.data.message}`);
      } else if (error.response?.data) {
        message.error(`注册失败: ${JSON.stringify(error.response.data)}`);
      } else {
        message.error(error.message || "注册失败，请重试");
      }
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
