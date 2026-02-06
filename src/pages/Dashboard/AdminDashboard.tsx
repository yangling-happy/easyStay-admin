import { Typography, ConfigProvider } from "antd";

const { Title, Text } = Typography;

const AdminDashboard = () => {
  return (
    <ConfigProvider
      theme={{
        token: { colorPrimary: "#1890ff" },
      }}
    >
      <div className="full-dashboard">
        {/* 顶部：平台欢迎区 */}
        <div className="admin-hero-banner">
          <div className="banner-content">
            <div className="admin-badge">EasyStay Platform</div>
            <Title level={1} className="admin-main-title">
              欢迎回来，管理员
            </Title>
            <Text className="admin-subtitle">
              每一次管理，都值得用心
            </Text>
          </div>
          <div className="banner-decoration">
            <div className="circle-1"></div>
            <div className="circle-2"></div>
          </div>
        </div>

        {/* 下部：管理理念卡片 */}
        <div className="admin-vision-card">
          <div className="vision-content">
            <Title level={3} style={{ fontWeight: 300, marginBottom: 32 }}>
              精准掌控 · 高效运营
            </Title>
            <div className="abstract-graphic">
              <div className="line line-1"></div>
              <div className="line line-2"></div>
              <div className="line line-3"></div>
            </div>
            <Text
              type="secondary"
              style={{ fontSize: "16px", lineHeight: 2, marginTop: 32 }}
            >
              致力于打造最可靠的平台管理体系。
              <br />
              让复杂的调度变得简单明了。
            </Text>
          </div>
        </div>

        <style>{`
          .full-dashboard {
            height: 100%;
            display: flex;
            flex-direction: column;
            gap: 24px;
          }

          /* 顶部横幅 */
          .admin-hero-banner {
            padding: 60px;
            background: #fff;
            border: 1px solid #f0f0f0;
            border-radius: 32px;
            position: relative;
            overflow: hidden;
            animation: fadeInUp 0.6s ease-out;
          }
          .admin-badge {
            background: #e6f7ff;
            color: #1890ff;
            padding: 4px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            display: inline-block;
            margin-bottom: 16px;
          }
          .admin-main-title {
            font-size: 42px !important;
            font-weight: 300 !important;
            margin: 0 0 12px 0 !important;
            letter-spacing: 1px;
          }
          .admin-subtitle {
            font-size: 18px;
            color: #8c8c8c;
            font-weight: 300;
          }

          /* 装饰圆圈 */
          .banner-decoration .circle-1 {
            position: absolute; right: -50px; top: -50px;
            width: 200px; height: 200px;
            background: rgba(24,144,255,0.03); border-radius: 50%;
          }
          .banner-decoration .circle-2 {
            position: absolute; right: 50px; bottom: -80px;
            width: 160px; height: 160px;
            background: rgba(24,144,255,0.05); border-radius: 50%;
          }

          /* 愿景卡片 */
          .admin-vision-card {
            flex: 1;
            background: #fff;
            border: 1px solid #f0f0f0;
            border-radius: 32px;
            padding: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeInUp 0.6s ease-out 0.2s both;
          }
          .vision-content {
            max-width: 800px;
            text-align: center;
          }
          
          /* 线条装饰 */
          .abstract-graphic {
            margin: 32px auto;
            display: flex;
            gap: 16px;
            justify-content: center;
            align-items: center;
          }
          .line { 
            height: 8px; 
            border-radius: 4px; 
            background: #f0f0f0; 
            position: relative;
            overflow: hidden;
          }
          .line-1 { 
            width: 80px; 
            background: #1890ff;
          }
          .line-2 { 
            width: 120px; 
          }
          .line-3 { 
            width: 60px; 
          }
          
          /* 动画效果 */
          .line::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(24,144,255,0.1), transparent);
            animation: shimmer 3s ease-in-out infinite;
          }
          
          .line-1::after {
            animation-delay: 0s;
          }
          .line-2::after {
            animation-delay: 0.5s;
          }
          .line-3::after {
            animation-delay: 1s;
          }

          /* 动画 */
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
        `}</style>
      </div>
    </ConfigProvider>
  );
};

export default AdminDashboard;