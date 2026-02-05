import React from "react";
import { Space } from "antd";
import { useNavigate } from "react-router-dom";
import { MessageOutlined } from "@ant-design/icons";
import Feedback from "./Feedback";
import Notice from "./Notice";
import UserProfile from "./UserProfile";

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user?.role === "admin";

  return (
    <Space size="middle" style={{ cursor: "pointer" }}>
      {isAdmin ? (
        <div className="navbar-item" onClick={() => navigate("/admin/feedback")}>
          <MessageOutlined style={{ fontSize: 18 }} />
          <span style={{ marginLeft: 8 }}>反馈管理</span>
        </div>
      ) : (
        <Feedback />
      )}

      <Notice />
      <UserProfile />
    </Space>
  );
};

export default Navbar;