// src/layouts/MainLayout.tsx
import { Layout, theme } from "antd";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";

const { Header, Content } = Layout;

export const MainLayout = () => {
  const {
    token: { colorBgContainer, borderRadiusLG, colorBgLayout },
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: "100vh", background: colorBgLayout }}>
      {/* 使用提取后的 Sidebar 组件 */}
      <Sidebar />

      <Layout style={{ background: colorBgLayout }}>
        {/* Header 逻辑，后续你可以把 Navbar 放在这里 */}
        <Header
          style={{
            background: colorBgContainer,
            padding: 0,
            height: 64, // 建议恢复高度，因为后面你要放 Navbar
            display: "flex",
            alignItems: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
           {/* 这里未来放置 <Navbar /> */}
        </Header>

        <Content style={{ padding: "24px", minHeight: 280 }}>
          <div
            style={{
              padding: 24,
              background: colorBgContainer,
              minHeight: "calc(100vh - 150px)", 
              borderRadius: borderRadiusLG,
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};