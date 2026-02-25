import React from "react";
import { Layout, Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
  PlusCircleOutlined,
  DatabaseOutlined,
  AuditOutlined,
  EditOutlined,
} from "@ant-design/icons";

const { Sider } = Layout;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getUserRole = (): "merchant" | "admin" | "" => {
    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      return user?.role || "";
    } catch (error) {
      console.error("获取用户角色失败:", error);
      return "";
    }
  };

  const role = getUserRole();

  const merchantMenuItems = [
    {
      key: "/hotels",
      icon: <DatabaseOutlined />,
      label: "酒店列表",
      onClick: () => navigate("/hotels"),
    },
    {
      key: "/hotels/incomplete",
      icon: <EditOutlined />,
      label: "待完善酒店",
      onClick: () => navigate("/hotels/incomplete?status=all"),
    },
    {
      key: "/merchant/records",
      icon: <AuditOutlined />,
      label: "申请记录",
      onClick: () => navigate("/merchant/records"),
    },
    {
      key: "/hotels/new",
      icon: <PlusCircleOutlined />,
      label: "房型发布",
      onClick: () => navigate("/hotels/new"),
    },
  ];

  const adminMenuItems = [
    {
      key: "/hotels/audit",
      icon: <AuditOutlined />,
      label: "酒店审核",
      onClick: () => navigate("/hotels/audit"),
    },
    {
      key: "/users",
      icon: <DatabaseOutlined />,
      label: "平台监控",
      onClick: () => navigate("/users"),
    },
    {
      key: "/users/audit",
      icon: <AuditOutlined />,
      label: "数据统计",
      onClick: () => navigate("/users/audit"),
    },
  ];

  const menuItems = role === "admin" ? adminMenuItems : merchantMenuItems;

  return (
    <Sider
      theme="dark"
      breakpoint="lg"
      collapsedWidth="64"
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
        易宿酒店管理平台
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
