import React from "react";
import { Space } from "antd";
import Feedback from "./Feedback";
import Notice from "./Notice";
import UserProfile from "./UserProfile";
const Navbar: React.FC = () => {
  return (
    <Space size="middle" style={{ cursor: "pointer" }}>
      <Feedback />
      <Notice />
      <UserProfile />
    </Space>
  );
};

export default Navbar;
