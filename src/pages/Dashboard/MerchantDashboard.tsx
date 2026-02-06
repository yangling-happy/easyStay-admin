import { Typography, ConfigProvider } from "antd";

const { Title, Text } = Typography;

const MerchantDashboard = () => {
  return (
    <ConfigProvider
      theme={{
        token: { colorPrimary: "#1890ff" },
      }}
    >
      <div className="full-dashboard">
        {/* 顶部：大字体欢迎区 */}
        <div className="hero-banner">
          <div className="banner-content">
            <div className="brand-badge">EasyStay Partner</div>
            <Title level={1} className="main-welcome-title">
              你好，易宿伙伴
            </Title>
            <Text className="banner-subtitle">让每一间客房，都充满温度。</Text>
          </div>
          <div className="banner-decoration">
            <div className="circle-1"></div>
            <div className="circle-2"></div>
          </div>
        </div>

        {/* 下部：一个完整的愿景卡片 */}
        <div className="vision-full-card">
          <div className="vision-content">
            <Title level={3} style={{ fontWeight: 300, marginBottom: 32 }}>
              智慧空间 · 极简交互
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
              致力于为您提供最流畅的管理体验。
              <br />
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
          .hero-banner {
            padding: 60px;
            background: #fff;
            border: 1px solid #f0f0f0;
            border-radius: 32px;
            position: relative;
            overflow: hidden;
            animation: fadeInUp 0.6s ease-out;
          }
          .brand-badge {
            background: #e6f7ff;
            color: #1890ff;
            padding: 4px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            display: inline-block;
            margin-bottom: 16px;
          }
          .main-welcome-title {
            font-size: 42px !important;
            font-weight: 200 !important;
            margin: 0 0 12px 0 !important;
            letter-spacing: 2px;
          }
          .banner-subtitle {
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

          /* 完整愿景卡片 */
          .vision-full-card {
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
          
          /* 简化后的线条动画 - 性能更优 */
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
          /* 静态宽度，避免布局重排 */
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
          
          /* 使用伪元素实现动画，性能更好 */
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

export default MerchantDashboard;
