import React from "react";
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Dropdown, Avatar, Space, message } from "antd";
import type { MenuProps } from "antd";
import { useNavigate } from "react-router-dom";

const UserProfile: React.FC = () => {
  const navigate = useNavigate();

  // 获取当前用户信息（从 localStorage）
  const getUserInfo = () => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("获取用户信息失败:", error);
      return null;
    }
  };

  const userInfo = getUserInfo();
  const username = userInfo?.username || "用户";
  const role = userInfo?.role || "";
  const roleText =
    role === "merchant" ? "商户" : role === "admin" ? "管理员" : "";

  const handleLogout = () => {
    message.loading({ content: "正在退出登录...", key: "logout", duration: 0 });

    // 1. 清除本地存储
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // 2. 如果有 authApi 的 logout 方法，可以调用（可选）
    // authApi.logout();

    // 3. 清除消息，显示成功提示
    message.success({ content: "退出登录成功", key: "logout" });

    // 4. 跳转到登录页
    navigate("/login", { replace: true });

    // 5. 可选：刷新页面清除所有状态
    // window.location.reload();
  };

  const items: MenuProps["items"] = [
    {
      key: "user-info",
      label: (
        <div style={{ padding: "4px 0" }}>
          <div style={{ fontWeight: 500 }}>{username}</div>
          {roleText && (
            <div style={{ fontSize: "12px", color: "#666" }}>{roleText}</div>
          )}
        </div>
      ),
      disabled: true,
    },
    {
      type: "divider",
    },
    {
      key: "profile",
      label: "个人资料",
      icon: <UserOutlined />,
      onClick: () => {
        const role = userInfo?.role;
        if (role === "merchant") {
          navigate("/merchant/profile");
        } else if (role === "admin") {
          navigate("/admin/profile");
        }
      },
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: "退出登录",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  // 头像颜色根据用户名生成
  const getAvatarColor = (name: string) => {
    const colors = ["#68b6d0", "#f56a00", "#7265e6", "#ffbf00", "#00a2ae"];
    const hash = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <Dropdown
      menu={{ items }}
      placement="bottomRight"
      arrow
      trigger={["click"]}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          padding: "8px 12px",
          borderRadius: "6px",
          transition: "all 0.3s",
        }}
      >
        <Space>
          <Avatar
            size="small"
            icon={<UserOutlined />}
            style={{
              backgroundColor: getAvatarColor(username),
              color: "#fff",
            }}
          />
        </Space>
      </div>
    </Dropdown>
  );
};
export default UserProfile;
