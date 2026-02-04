// src/pages/Register/components/RegisterForm.tsx
import React from "react";
import { Form, Input, Button, Row, Col, Space } from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  PhoneOutlined,
  ShopOutlined,
  ApartmentOutlined,
} from "@ant-design/icons";
import { ArrowLeftOutlined } from "@ant-design/icons";
import type { RegisterStepProps } from "../types";

const RegisterForm: React.FC<RegisterStepProps> = ({
  selectedRole,
  form,
  onFinish,
  loading,
  onPrev,
}) => {
  return (
    <Form
      form={form}
      name="register"
      layout="vertical"
      onFinish={onFinish}
      initialValues={{ role: selectedRole }}
      size="middle"
    >
      <Row gutter={[16, 8]}>
        {/* 第1行：用户名和邮箱 */}
        <Col span={12}>
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: "请输入用户名" },
              { min: 3, message: "用户名至少3个字符" },
              { max: 20, message: "用户名不能超过20个字符" },
              {
                pattern: /^[a-zA-Z0-9_]+$/,
                message: "只能包含字母、数字和下划线",
              },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: "#1890ff" }} />}
              placeholder="请输入用户名"
              allowClear
              size="middle"
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: "请输入邮箱" },
              { type: "email", message: "请输入有效的邮箱地址" },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: "#1890ff" }} />}
              placeholder="请输入邮箱"
              allowClear
              size="middle"
            />
          </Form.Item>
        </Col>

        {/* 第2行：密码和确认密码 */}
        <Col span={12}>
          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: "请输入密码" },
              { min: 6, message: "密码至少6位" },
              { max: 20, message: "密码不能超过20位" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#1890ff" }} />}
              placeholder="请输入密码"
              allowClear
              size="middle"
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={["password"]}
            rules={[
              { required: true, message: "请确认密码" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("两次输入的密码不一致"));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#1890ff" }} />}
              placeholder="请再次输入密码"
              allowClear
              size="middle"
            />
          </Form.Item>
        </Col>

        {/* 第3行：根据角色显示特定字段 */}
        {selectedRole === "merchant" && (
          <>
            <Col span={12}>
              <Form.Item
                name="hotelName"
                label="酒店/公司名称"
                rules={[
                  { required: true, message: "请输入酒店或公司名称" },
                  { min: 2, message: "名称至少2个字符" },
                  { max: 50, message: "名称不能超过50个字符" },
                ]}
              >
                <Input
                  prefix={<ShopOutlined style={{ color: "#1890ff" }} />}
                  placeholder="请输入酒店或公司名称"
                  allowClear
                  size="middle"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="contactPhone"
                label="联系电话"
                rules={[
                  { required: true, message: "请输入联系电话" },
                  { pattern: /^1[3-9]\d{9}$/, message: "请输入有效的手机号码" },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined style={{ color: "#1890ff" }} />}
                  placeholder="请输入手机号码"
                  allowClear
                  size="middle"
                />
              </Form.Item>
            </Col>
          </>
        )}

        {selectedRole === "admin" && (
          <Col span={12}>
            <Form.Item
              name="department"
              label="所属部门"
              rules={[
                { required: true, message: "请输入所属部门" },
                { min: 2, message: "部门名称至少2个字符" },
                { max: 30, message: "部门名称不能超过30个字符" },
              ]}
            >
              <Input
                prefix={<ApartmentOutlined style={{ color: "#1890ff" }} />}
                placeholder="请输入所属部门"
                allowClear
                size="middle"
              />
            </Form.Item>
          </Col>
        )}

        {/* 为了保持布局对齐，当是管理员时添加一个空列占位 */}
        {selectedRole === "admin" && (
          <Col span={12}>
            {/* 空列，仅用于占位对齐 */}
          </Col>
        )}
      </Row>

      <Form.Item style={{ marginTop: 24 }}>
        <Space
          size="middle"
          style={{ width: "100%", justifyContent: "space-between" }}
        >
          <Button onClick={onPrev} icon={<ArrowLeftOutlined />} size="middle">
            上一步
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="middle"
          >
            注册
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default RegisterForm;