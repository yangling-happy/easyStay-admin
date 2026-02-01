import React from 'react';
import { Result, Button } from 'antd';

const AuditStatus: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <Result
    status="success"
    title="酒店信息已提交审核"
    subTitle="您的申请编号为：772834。审核结果将在 24 小时内发送至您的后台通知，请耐心等待。"
    extra={[
      <Button type="primary" key="list" onClick={onBack}>
        返回酒店列表
      </Button>,
      <Button key="buy">查看申请记录</Button>,
    ]}
  />
);

export default AuditStatus;