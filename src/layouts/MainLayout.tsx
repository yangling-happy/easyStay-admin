import { Layout, Menu, theme } from "antd";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { PlusCircleOutlined, DatabaseOutlined } from "@ant-design/icons";

const { Header, Content, Sider } = Layout;

export const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    token: { colorBgContainer, borderRadiusLG, colorBgLayout },
  } = theme.useToken();

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
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: colorBgLayout }}>
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

      <Layout style={{ background: colorBgLayout }}>
        {/* 完全清空 Header 内容 */}
        <Header
          style={{
            background: colorBgContainer,
            padding: 0, // 移除内边距
            height: 0, // 设置高度为 0
            lineHeight: 0, // 移除行高
            boxShadow: "none", // 移除阴影
          }}
        />

        <Content style={{ padding: "24px", minHeight: 280 }}>
          <div
            style={{
              padding: 24,
              background: colorBgContainer,
              minHeight: "calc(100vh - 112px)", // 动态计算高度
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
