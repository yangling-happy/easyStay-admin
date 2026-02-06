import { Layout, theme } from "antd";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

const { Header, Content } = Layout;

export const MainLayout = () => {
  const {
    token: { colorBgContainer, borderRadiusLG, colorBgLayout },
  } = theme.useToken();

  

  return (
    <Layout style={{ minHeight: "100vh", background: colorBgLayout }}>
      <Sidebar />

      <Layout style={{ background: colorBgLayout }}>
        <Header
          style={{
            background: colorBgContainer,
            padding: "0 24px",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <Navbar />
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
