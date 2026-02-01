import React from "react";
import { BellOutlined } from "@ant-design/icons";
import { Popover, Badge, List, Typography } from "antd";

const { Text } = Typography;

const Notice: React.FC = () => {
  // 模拟一些通知数据（实际开发中这里可能来自 API 或全局 Store）
  const data = [
    { title: "酒店审核通过", time: "10分钟前", status: "success" },
    { title: "收到新的订房申请", time: "1小时前", status: "processing" },
    { title: "系统维护通知", time: "昨天", status: "warning" },
  ];

  // 渲染在气泡框里的内容
  const content = (
    <List
      style={{ width: 300 }}
      dataSource={data}
      renderItem={(item) => (
        <List.Item>
          <List.Item.Meta
            title={<Text strong>{item.title}</Text>}
            description={item.time}
          />
        </List.Item>
      )}
      footer={<div style={{ textAlign: 'center', cursor: 'pointer', color: '#1677ff' }}>查看全部</div>}
    />
  );

  return (
    <Popover 
      content={content} 
      title="消息通知" 
      trigger="hover" // 设置触发方式为悬停
      placement="bottomRight" // 设置弹出的位置
    >
      <div className="navbar-item">
        {/* Badge 让通知看起来更真实，dot 表示只显示一个小红点 */}
        <Badge dot offset={[-2, 4]}>
          <BellOutlined style={{ fontSize: "18px" }} />
        </Badge>
        <span style={{ marginLeft: "8px" }}>消息通知</span>
      </div>
    </Popover>
  );
};

export default Notice;