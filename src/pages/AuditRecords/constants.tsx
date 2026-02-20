import { Tag, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { formatDateTime } from '@/utils/dateUtils';

export const getAuditColumns = () => [
  {
    title: '申请酒店',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '申请时间',
    dataIndex: 'createTime',
    render: (time: string) => formatDateTime(time),
  },
  {
    title: '审核状态',
    dataIndex: 'status',
    render: (status: string, record: any) => {
      if (status === 'pending') return <Tag color="orange">审核中</Tag>;
      if (status === 'approved') return <Tag color="green">已通过</Tag>;
      if (status === 'rejected') {
        return (
          <Tooltip title={`驳回原因: ${record.rejectReason || '未填写'}`}>
            <Tag color="red" icon={<InfoCircleOutlined />}>已驳回 (悬停查看)</Tag>
          </Tooltip>
        );
      }
      return <Tag>{status}</Tag>;
    },
  },
];