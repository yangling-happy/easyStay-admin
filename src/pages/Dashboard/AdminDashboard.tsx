
import { Row, Col } from 'antd';

const AdminDashboard = () => {
  return (
    <div className="admin-zen-container">
      <div className="system-header">
        <div className="pulse-dot"></div>
        <span>SYSTEM KERNEL OPERATING</span>
      </div>

      <Row gutter={[24, 24]}>
        <Col span={24}>
          <div className="grid-structure">
            <div className="scan-line"></div>
            <div className="grid-label">CORE INFRASTRUCTURE</div>
          </div>
        </Col>
        
        {[1, 2, 3, 4].map(i => (
          <Col span={6} key={i}>
            <div className="data-cell">
              <div className="cell-header">NODE_{i}</div>
              <div className="cell-body">
                <div className="bar-minimal"></div>
                <div className="bar-minimal delay"></div>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      <style>{`
        .admin-zen-container { padding: 40px; background: #050505; min-height: 100vh; color: #fff; }
        .system-header { display: flex; alignItems: center; gap: 12px; font-family: monospace; font-size: 12px; letter-spacing: 2px; color: #555; margin-bottom: 40px; }
        .pulse-dot { width: 8px; height: 8px; background: #52c41a; border-radius: 50%; box-shadow: 0 0 10px #52c41a; animation: pulse 2s infinite; }
        
        .grid-structure { 
          height: 300px; background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 4px;
          position: relative; overflow: hidden;
          background-image: linear-gradient(#111 1px, transparent 1px), linear-gradient(90deg, #111 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .scan-line {
          position: absolute; width: 100%; height: 2px; background: linear-gradient(90deg, transparent, #1890ff, transparent);
          top: 0; animation: scanMove 4s linear infinite;
        }
        .grid-label { position: absolute; top: 20px; left: 20px; font-size: 10px; color: #333; }

        .data-cell { background: #0a0a0a; border: 1px solid #1a1a1a; padding: 20px; border-radius: 4px; }
        .cell-header { font-size: 10px; color: #444; margin-bottom: 16px; border-bottom: 1px solid #1a1a1a; padding-bottom: 8px; }
        .bar-minimal { height: 2px; background: #222; margin-bottom: 8px; position: relative; overflow: hidden; }
        .bar-minimal::after { content: ''; position: absolute; left: 0; top: 0; height: 100%; width: 30%; background: #1890ff; animation: flow 3s infinite; }
        .bar-minimal.delay::after { animation-delay: 1.5s; width: 50%; background: #722ed1; }

        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
        @keyframes scanMove { from { top: 0%; } to { top: 100%; } }
        @keyframes flow { from { left: -100%; } to { left: 100%; } }
      `}</style>
    </div>
  );
};

export default AdminDashboard;