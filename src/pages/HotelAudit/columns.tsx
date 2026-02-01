import type { ColumnsType } from 'antd/es/table'
import  { Tag } from 'antd'
import { Button, Space } from 'antd'


export interface HotelItem {
  hotelId: string
  name: string
  status: 'pending' | 'published' | 'rejected' | 'offline'
  rejectReason?: string
}
const statusMap = {
  pending: '审核中',
  published: '已发布',
  rejected: '未通过',
  offline: '已下线'
}

export const getColumns = (
  onApprove: (id: string) => void,
  onReject: (record: HotelItem) => void,
  onOffline: (id: string) => void,
  onRestore: (id: string) => void
): ColumnsType<HotelItem> => [
  {
    title: '酒店ID',
    dataIndex: 'hotelId'
  },
  {
    title: '酒店名称',
    dataIndex: 'name'
  },
  {
    title: '状态',
    render: (_, record) => (
      <>
        <Tag
          color={
            record.status === 'pending'
              ? 'orange'
              : record.status === 'published'
              ? 'green'
              : record.status === 'offline'
              ? 'gray'
              : 'red'
          }
        >
         {statusMap[record.status]}

        </Tag>
  
        {record.status === 'rejected' && record.rejectReason && (
          <div style={{ color: '#ff4d4f', fontSize: 12 }}>
            原因：{record.rejectReason}
          </div>
        )}
      </>
    )
  },
  {
    title: '操作',
    render: (_, record) => (
      <Space>
        {record.status === 'pending' && (
          <>
            <Button
              type="primary"
              size="small"
              onClick={() => onApprove(record.hotelId)}
            >
              通过
            </Button>
  
            <Button
              danger
              size="small"
              onClick={() => onReject(record)}
            >
              拒绝
            </Button>
          </>
        )}
  
        {record.status === 'published' && (
          <Button
            size="small"
            onClick={() => onOffline(record.hotelId)}
          >
            下线
          </Button>
        )}
  
        {record.status === 'offline' && (
          <Button
            type="primary"
            size="small"
            onClick={() => onRestore(record.hotelId)}
          >
            恢复
          </Button>
        )}
      </Space>
    )
  }
  
  
]
