import React from "react";
import { UserOutlined, SettingOutlined, LogoutOutlined } from "@ant-design/icons";
import { Dropdown, Avatar, Space, message } from "antd";
import type { MenuProps } from "antd";

const UserProfile: React.FC = () => {
  const items: MenuProps['items'] = [
    {
      key: 'settings',
      label: '个人设置',
      icon: <SettingOutlined />,
    },
    {
      type: 'divider', 
    },
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      danger: true, 
      onClick: () => {
        message.info("正在退出登录...");
        // 这里未来写清除 Token、跳转登录页的逻辑
      }
    },
  ];

  return (
    // 2. 使用 Dropdown 包裹触发元素
    <Dropdown menu={{ items }} placement="bottomRight" arrow>
      <div className="navbar-item">
        <Space>

          <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#68b6d0' }} />
          <span>用户</span>
        </Space>
      </div>
    </Dropdown>
  );
};

export default UserProfile;