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
                    酒店管理、房型发布
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
                    商户审核
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
          background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: #262626;
          position: relative;
          overflow: hidden;
          animation: fadeInLeft 0.8s ease-out;
        }

        .background-text {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          pointer-events: none;
          z-index: 1;
        }

        .text-left, .text-right {
          position: absolute;
          font-size: 160px;
          font-weight: 300;
          color: rgba(0, 0, 0, 0.02);
          letter-spacing: 15px;
          opacity: 0.8;
          user-select: none;
        }

        .text-left {
          top: 50%;
          left: 10%;
          transform: translateY(-50%) rotate(-10deg);
        }

        .text-right {
          top: 50%;
          right: 10%;
          transform: translateY(-50%) rotate(10deg);
        }

        .panel-content {
          text-align: center;
          max-width: 500px;
          position: relative;
          z-index: 2;
          animation: contentAppear 0.6s ease-out 0.3s both;
        }

        .icon-wrapper {
          margin-bottom: 24px;
        }

        .main-icon {
          font-size: 64px;
          color: #1890ff;
        }

        .main-title {
          color: #262626 !important;
          margin-bottom: 16px !important;
          font-weight: 300 !important;
          font-size: 32px !important;
          letter-spacing: -0.5px;
        }

        .subtitle {
          color: #8c8c8c;
          font-size: 16px;
          display: block;
          margin-bottom: 32px;
          line-height: 1.6;
          font-weight: 400;
          letter-spacing: 0.5px;
        }

        .features-section {
          margin-top: 40px;
          width: 100%;
        }

        .feature-item {
          display: flex;
          align-items: center;
          padding: 20px;
          border-radius: 16px;
          background: #ffffff;
          border: 1px solid #f0f0f0;
          transition: all 0.2s ease;
          animation: slideInRight 0.5s ease-out both;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
        }

        .feature-item:hover {
          border-color: #40a9ff;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(24, 144, 255, 0.1);
        }

        .feature-item:nth-child(2) {
          animation-delay: 0.2s;
        }

        .feature-icon-wrapper {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #e6f7ff;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          flex-shrink: 0;
          border: 1px solid #bae7ff;
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
          color: #262626 !important;
          display: block;
          margin-bottom: 4px;
          font-weight: 500;
        }

        .feature-description {
          color: #8c8c8c;
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
          z-index: 1;
        }

        .circle {
          position: absolute;
          border-radius: 50%;
          background: rgba(24, 144, 255, 0.03);
          animation: float 12s ease-in-out infinite;
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
          animation-delay: 4s;
        }

        .circle-3 {
          width: 60px;
          height: 60px;
          top: 50%;
          right: 20%;
          animation-delay: 8s;
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
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-40px) scale(1.05);
          }
        }

        /* 响应式调整 */
        @media (max-width: 768px) {
          .text-left, .text-right {
            font-size: 100px;
            letter-spacing: 10px;
          }
        }

        @media (max-width: 480px) {
          .left-panel-container {
            padding: 32px 24px;
          }
          
          .main-title {
            font-size: 24px !important;
          }
          
          .text-left, .text-right {
            font-size: 70px;
            letter-spacing: 5px;
            opacity: 0.03;
          }
        }
      `}</style>
    </div>
  );
};

export default LeftPanel;
