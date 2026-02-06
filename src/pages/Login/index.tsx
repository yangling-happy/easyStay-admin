import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../../api/auth";
import type { LoginParams } from "../../api/auth/types";
import "./LoginPage.css"; // 导入样式文件

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: LoginParams) => {
    setLoading(true);
    try {
      console.log("登录请求:", values);

      const response = await authApi.login(values);

      if (response.success) {
        message.success("登录成功");

        // 保存用户信息
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        // 根据角色跳转
        const user = response.data.user;
        if (user.role === "merchant") {
          navigate("/merchant/dashboard");
        } else if (user.role === "admin") {
          navigate("/admin/dashboard");
        }
      }
    } catch (error: any) {
      console.error("登录失败:", error);
      message.error(error.message || "登录失败");
    } finally {
      setLoading(false);
    }
  };

  const BubbleBackground = () => (
    <div className="bubbles-container">
      <div className="bubble bubble-1"></div>
      <div className="bubble bubble-2"></div>
      <div className="bubble bubble-3"></div>
      <div className="bubble bubble-4"></div>
      <div className="bubble bubble-5"></div>
    </div>
  );

  const LoginHeader = () => (
    <div className="login-header">
      <Title level={3} className="login-title">
        易宿酒店管理平台
      </Title>
      <Text type="secondary" className="login-subtitle">
        请登录您的账号
      </Text>
    </div>
  );

  const LoginFooter = () => (
    <div className="login-footer">
      <Text>还没有账号？</Text>
      <Link to="/register" className="register-link">
        立即注册
      </Link>
    </div>
  );

  return (
    <div className="login-page">
      <BubbleBackground />
      <Card className="login-card">
        <LoginHeader />
        
        <Form
          form={form}
          name="login"
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            username: "",
            password: "",
          }}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: "请输入用户名" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入用户名"
              size="large"
              className="login-input"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
              size="large"
              className="login-input"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              className="login-button"
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <LoginFooter />
      </Card>
    </div>
  );
};

export default LoginPage;