// components/ChangePassword.tsx
import React, { useState } from "react";
import { Card, Form, Input, Button, message } from "antd";
import { authApi } from "../../../api/auth";

const ChangePassword: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error("两次输入的密码不一致");
      return;
    }

    setLoading(true);
    try {
      await authApi.updatePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      message.success("密码修改成功");
      form.resetFields();
    } catch (error) {
      message.error("密码修改失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="修改密码" style={{ marginTop: 24 }}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="oldPassword"
          label="原密码"
          rules={[{ required: true, message: "请输入原密码" }]}
        >
          <Input.Password placeholder="请输入原密码" />
        </Form.Item>
        <Form.Item
          name="newPassword"
          label="新密码"
          rules={[
            { required: true, message: "请输入新密码" },
            { min: 6, message: "密码至少6个字符" },
          ]}
        >
          <Input.Password placeholder="请输入新密码" />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="确认新密码"
          rules={[{ required: true, message: "请确认新密码" }]}
        >
          <Input.Password placeholder="请再次输入新密码" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            修改密码
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ChangePassword;
