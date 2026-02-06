import React from "react";
import { Typography, Row, Col } from "antd";
import { HomeOutlined, ShopOutlined, TeamOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const LeftPanel: React.FC = () => {
  return (
    <div className="left-panel-container">
      <div className="panel-content">
        <div className="icon-wrapper">
          <HomeOutlined className="main-icon" />
        </div>
        <Title level={2} className="main-title">
          易宿酒店管理平台
        </Title>
        <Text className="subtitle">
          专业的酒店管理系统
          <br />
          为酒店商户和管理员提供全方位的业务支持
        </Text>

        <div className="features-section">
          <Row gutter={[0, 20]}>
            <Col span={24}>
              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <ShopOutlined className="feature-icon" />
                </div>
                <div className="feature-text">
                  <Text strong className="feature-title">
                    商户功能
                  </Text>
                  <Text className="feature-description">
                    酒店管理、房型发布、订单处理
                  </Text>
                </div>
              </div>
            </Col>

            <Col span={24}>
              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <TeamOutlined className="feature-icon" />
                </div>
                <div className="feature-text">
                  <Text strong className="feature-title">
                    管理员功能
                  </Text>
                  <Text className="feature-description">
                    商户审核、平台监控、数据统计
                  </Text>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* 装饰元素 */}
      <div className="decoration-elements">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
        <div className="circle circle-3"></div>
      </div>

      <style>{`
        .left-panel-container {
          flex: 0 0 40%;
          background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: #0050b3;
          position: relative;
          overflow: hidden;
          animation: fadeInLeft 0.8s ease-out;
        }

        .panel-content {
          text-align: center;
          max-width: 500px;
          position: relative;
          z-index: 1;
          animation: contentAppear 0.6s ease-out 0.3s both;
        }

        .icon-wrapper {
          margin-bottom: 24px;
        }

        .main-icon {
          font-size: 64px;
          color: #1890ff;
          animation: float 4s ease-in-out infinite;
        }

        .main-title {
          color: #0050b3 !important;
          margin-bottom: 16px !important;
          font-weight: 600 !important;
          font-size: 32px !important;
        }

        .subtitle {
          color: rgba(0, 80, 179, 0.9);
          font-size: 16px;
          display: block;
          margin-bottom: 32px;
          line-height: 1.6;
        }

        .features-section {
          margin-top: 40px;
          width: 100%;
        }

        .feature-item {
          display: flex;
          align-items: center;
          padding: 16px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;
          animation: slideInRight 0.5s ease-out both;
        }

        .feature-item:hover {
          transform: translateX(5px);
          border-color: #91d5ff;
          box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
        }

        .feature-item:nth-child(2) {
          animation-delay: 0.2s;
        }

        .feature-icon-wrapper {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(24, 144, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          flex-shrink: 0;
          border: 1px solid rgba(24, 144, 255, 0.2);
        }

        .feature-icon {
          font-size: 20px;
          color: #1890ff;
        }

        .feature-text {
          text-align: left;
        }

        .feature-title {
          font-size: 16px !important;
          color: #0050b3 !important;
          display: block;
          margin-bottom: 4px;
        }

        .feature-description {
          color: rgba(0, 80, 179, 0.7);
          font-size: 14px;
        }

        /* 装饰圆圈 */
        .decoration-elements {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          pointer-events: none;
        }

        .circle {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          animation: float 6s ease-in-out infinite;
        }

        .circle-1 {
          width: 120px;
          height: 120px;
          top: 10%;
          right: 10%;
          animation-delay: 0s;
        }

        .circle-2 {
          width: 80px;
          height: 80px;
          bottom: 20%;
          left: 10%;
          animation-delay: 2s;
        }

        .circle-3 {
          width: 60px;
          height: 60px;
          top: 50%;
          right: 20%;
          animation-delay: 4s;
        }

        /* 动画定义 */
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes contentAppear {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
};

export default LeftPanel;