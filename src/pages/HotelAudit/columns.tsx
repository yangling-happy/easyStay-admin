// src/pages/HotelAudit/columns.tsx
import type { ColumnsType } from 'antd/es/table'
import { Tag, Button, Space, Tooltip } from 'antd'
import { EyeOutlined } from '@ant-design/icons'
import type { Hotel } from '@/types/hotel'

const statusMap: Record<Hotel['status'], { text: string; color: string }> = {
  pending: { text: '待审核', color: 'orange' },
  approved: { text: '已通过', color: 'green' },
  rejected: { text: '已拒绝', color: 'red' }
}

export const getColumns = (
  onApprove: (id: string) => void,
  onReject: (hotel: Hotel) => void,
  onOffline: (id: string) => void,
  onRestore: (id: string) => void,
  onViewDetail: (hotel: Hotel) => void
): ColumnsType<Hotel> => [
  {
    title: '酒店名称',
    dataIndex: 'name',
    width: 200,
    ellipsis: true
  },
  {
    title: '地址',
    dataIndex: 'address',
    width: 250,
    ellipsis: true
  },
  {
    title: '星级',
    dataIndex: 'star',
    width: 80,
    render: (star) => {
      // 处理 undefined 或 null 的情况
      if (star === undefined || star === null) {
        return <span style={{ color: '#999' }}>未设置</span>
      }
      return `${star}星`
    }
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 150,
    render: (status, record) => (
      <Space direction="vertical" size={4}>
        <Tag color={statusMap[status as keyof typeof statusMap]?.color || 'default'}>
  {statusMap[status as keyof typeof statusMap]?.text || status}
</Tag>
        {record.isDeleted && (
          <Tag color="gray">已下线</Tag>
        )}
        {status === 'rejected' && record.rejectReason && (
          <Tooltip title={record.rejectReason}>
            <div style={{ color: '#ff4d4f', fontSize: 12, cursor: 'help' }}>
              拒绝原因
            </div>
          </Tooltip>
        )}
      </Space>
    )
  },
  {
    title: '提交时间',
    dataIndex: 'createTime',
    width: 180,
    sorter: (a, b) => new Date(a.createTime).getTime() - new Date(b.createTime).getTime()
  },
  {
    title: '操作',
    width: 250,
    fixed: 'right',
    render: (_, record) => (
      <Space>
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => onViewDetail(record)}
        >
          详情
        </Button>

        {record.status === 'pending' && (
          <>
            <Button
              type="link"
              size="small"
              onClick={() => onApprove(record.id)}
            >
              通过
            </Button>
            <Button
              type="link"
              danger
              size="small"
              onClick={() => onReject(record)}
            >
              拒绝
            </Button>
          </>
        )}

        {record.status === 'approved' && !record.isDeleted && (
          <Button
            type="link"
            danger
            size="small"
            onClick={() => onOffline(record.id)}
          >
            下线
          </Button>
        )}

        {record.isDeleted && (
          <Button
            type="link"
            size="small"
            onClick={() => onRestore(record.id)}
          >
            恢复
          </Button>
        )}
      </Space>
    )
  }
]