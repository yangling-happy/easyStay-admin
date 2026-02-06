// src/pages/AuditRecords/index.tsx
import React from 'react';
import { Table, Tag, Card, Typography } from 'antd';
import { useAuditData } from './hooks/useAuditData';

const { Title } = Typography;

const AuditRecords: React.FC = () => {
  const { data, loading } = useAuditData();

  // 定义表格列
  const columns = [
    {
      title: '酒店名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '酒店地址',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true, // 超出长度自动省略
    },
    {
      title: '申请时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: '审核状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'orange';
        let text = '审核中';

        if (status === 'approved') {
          color = 'green';
          text = '已通过';
        } else if (status === 'rejected') {
          color = 'red';
          text = '已拒绝';
        }

        return <Tag color={color}>{text}</Tag>;
      },
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={4} style={{ marginBottom: '20px' }}>酒店上线申请记录</Title>
        <Table 
          columns={columns} 
          dataSource={data} 
          loading={loading} 
          rowKey="_id" // MongoDB 默认是 _id
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default AuditRecords;