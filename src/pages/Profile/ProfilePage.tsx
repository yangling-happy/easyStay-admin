// pages/profile/ProfilePage.tsx
import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  message,
  Avatar,
  Row,
  Col,
  Descriptions,
  Tag,
  Space,
  Divider,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EditOutlined,
  SaveOutlined,
  HomeOutlined,
  ApartmentOutlined,
} from "@ant-design/icons";
import { Form } from "antd";
import { authApi } from "../../api/auth";
import DynamicForm from "./components/DynamicForm";
import { getFormFieldsByRole, type UserInfo } from "./types";

const ProfilePage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // 获取当前用户信息（从 localStorage）
  const getLocalUserInfo = (): UserInfo | null => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("获取用户信息失败:", error);
      return null;
    }
  };

  // 获取当前用户的角色
  const userRole = userInfo?.role || getLocalUserInfo()?.role;

  // 根据角色获取表单字段
  const formFields = userRole ? getFormFieldsByRole(userRole) : [];

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      // 先从本地存储获取（快速显示）
      const localInfo = getLocalUserInfo();
      if (localInfo) {
        setUserInfo(localInfo);
        form.setFieldsValue(localInfo);
      }

      // 再从服务器获取最新数据
      const serverRes = await authApi.getCurrentUser();
      const serverInfo = serverRes.data.user;
      setUserInfo(serverInfo as UserInfo);
      form.setFieldsValue(serverInfo);
    } catch (error) {
      console.error("加载用户信息失败:", error);
      message.error("加载用户信息失败");
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const updatedUser = await authApi.updateProfile(values);

      // 更新本地存储
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUserInfo(updatedUser as UserInfo);

      message.success("个人资料更新成功");
      setIsEditing(false);
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error("更新失败");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // 重置表单为原始值
    form.setFieldsValue(userInfo || {});
    setIsEditing(false);
  };

  // 渲染只读信息
  const renderReadOnlyInfo = () => {
    if (!userInfo) return null;

    return (
      <Descriptions column={1}>
        {formFields.map((field) => {
          const value = userInfo[field.name];

          if (value === undefined || value === null || value === "")
            return null;

          let icon = null;
          let displayValue = value;

          switch (field.name) {
            case "username":
              icon = <UserOutlined />;
              break;
            case "email":
              icon = <MailOutlined />;
              break;
            case "phone":
              icon = <PhoneOutlined />;
              break;
            case "hotelName":
              icon = <HomeOutlined />;
              break;
            case "department":
              icon = <ApartmentOutlined />;
              break;
          }

          return (
            <Descriptions.Item key={field.name} label={field.label}>
              {icon && <span style={{ marginRight: 8 }}>{icon}</span>}
              {displayValue}
            </Descriptions.Item>
          );
        })}
      </Descriptions>
    );
  };

  if (!userInfo) {
    return <div>加载中...</div>;
  }

  return (
    <div className="profile-page" style={{ padding: 24 }}>
      <Row gutter={[24, 24]}>
        {/* 左侧：头像和基本信息 */}
        <Col xs={24} md={8}>
          <Card>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <Avatar
                size={100}
                icon={<UserOutlined />}
                style={{
                  backgroundColor: userRole === "admin" ? "#ff4d4f" : "#1890ff",
                  fontSize: 40,
                }}
              />
              <h3 style={{ marginTop: 16, marginBottom: 8 }}>
                {userInfo.username}
              </h3>
              <Tag color={userRole === "admin" ? "red" : "blue"}>
                {userRole === "admin" ? "管理员" : "商户"}
              </Tag>
            </div>

            <Divider />

            {/* 表单区域 */}
            {isEditing ? (
              <>
                <DynamicForm
                  fields={formFields}
                  form={form}
                  isEditing={isEditing}
                />
                <div style={{ marginTop: 24, textAlign: "center" }}>
                  <Space>
                    <Button onClick={handleCancel}>取消</Button>
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={handleSave}
                      loading={loading}
                    >
                      保存
                    </Button>
                  </Space>
                </div>
              </>
            ) : (
              <>
                {renderReadOnlyInfo()}
                <div style={{ marginTop: 24, textAlign: "center" }}>
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => setIsEditing(true)}
                  >
                    编辑资料
                  </Button>
                </div>
              </>
            )}
          </Card>
        </Col>

        {/* 右侧：账户信息和统计 */}
        <Col xs={24} md={16}>
          <Card title="账户信息" style={{ marginBottom: 24 }}>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="用户ID" span={2}>
                {userInfo.id || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="注册时间">
                {userInfo.createdAt
                  ? new Date(userInfo.createdAt).toLocaleDateString()
                  : "未知"}
              </Descriptions.Item>
              <Descriptions.Item label="账户状态">
                <Tag color="success">正常</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* 角色相关统计信息 */}
          {userRole === "merchant" && userInfo.hotelName && (
            <Card title="酒店信息">
              <Descriptions column={2}>
                <Descriptions.Item label="酒店名称">
                  {userInfo.hotelName}
                </Descriptions.Item>
                <Descriptions.Item label="联系电话">
                  {userInfo.contactPhone || "未设置"}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}

          {userRole === "admin" && userInfo.department && (
            <Card title="管理信息">
              <Descriptions column={2}>
                <Descriptions.Item label="所属部门">
                  {userInfo.department}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default ProfilePage;
