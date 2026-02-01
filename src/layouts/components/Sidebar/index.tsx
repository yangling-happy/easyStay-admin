import React from "react";
import { Layout, Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { PlusCircleOutlined, DatabaseOutlined, AuditOutlined } from "@ant-design/icons";

const { Sider } = Layout;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: "/hotels",
      icon: <DatabaseOutlined />,
      label: "酒店管理",
      onClick: () => navigate("/hotels"),
    },
    {
      key: "/hotels/new",
      icon: <PlusCircleOutlined />,
      label: "酒店录入",
      onClick: () => navigate("/hotels/new"),
    },
    {
      key: "/hotels/audit",
      icon: <AuditOutlined />,
      label: "酒店审核",
      onClick: () => navigate("/hotels/audit"),
    },
  ];

  return (
    <Sider
      theme="dark"
      breakpoint="lg"
      collapsedWidth="64"
      // 保持位置固定
      style={{ height: "100vh", position: "sticky", top: 0, left: 0 }}
    >
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: 16,
          fontWeight: "bold",
          background: "#001529",
        }}
      >
        易宿酒店管理后台
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        style={{ borderRight: 0 }}
      />
    </Sider>
  );
};

export default Sidebar;
