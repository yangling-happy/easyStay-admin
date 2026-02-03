// src/pages/HotelAudit/columns.tsx
import type { ColumnsType } from 'antd/es/table'
import { Tag, Button, Space, Tooltip } from 'antd'
import { EyeOutlined } from '@ant-design/icons'
import type { Hotel } from '@/types/hotel'

//将状态值映射为显示文本和颜色
const statusMap: Record<Hotel['status'], { text: string; color: string }> = {
  pending: { text: '待审核', color: 'orange' },
  approved: { text: '已通过', color: 'green' },
  rejected: { text: '已拒绝', color: 'red' }
}

// 获取表格列配置
export const getColumns = (
  onApprove: (id: string) => void,      // 通过审核的回调函数
  onReject: (hotel: Hotel) => void,     // 拒绝审核的回调函数
  onOffline: (id: string) => void,      // 下线酒店的回调函数
  onRestore: (id: string) => void,      // 恢复酒店的回调函数
  onViewDetail: (hotel: Hotel) => void  // 查看详情的回调函数
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
    render: (star) => {  //自定义渲染函数
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
    render: (status, record) => (    // status 是当前值，record 是整行数据
      <Space direction="vertical" size={4}>
         {/* 显示审核状态标签 */}
        <Tag color={statusMap[status as keyof typeof statusMap]?.color || 'default'}>
  {statusMap[status as keyof typeof statusMap]?.text || status}
</Tag>

        {/* 显示下线状态标签 */}
        {record.isDeleted && (
          <Tag color="gray">已下线</Tag>
        )}
        {/* 显示拒绝原因 */}
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
    sorter: (a, b) => {
      if (!a.createTime && !b.createTime) return 0
      if (!a.createTime) return 1  // 没有时间的排在后面
      if (!b.createTime) return -1
      return new Date(a.createTime).getTime() - new Date(b.createTime).getTime()
    }
  },
  {
    title: '操作',
    width: 250,
    fixed: 'right',    // 固定在右侧，横向滚动时不动
    render: (_, record) => (
      <Space>
        {/* 查看详情按钮 */}
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => onViewDetail(record)}
        >
          详情
        </Button>
        {/* 显示审核状态按钮 */}
        {record.status === 'pending' && (
          <>
            {/* 通过按钮 */}
            <Button
              type="link"
              size="small"
              onClick={() => onApprove(record.id!)}
           >
              通过
            </Button>
            {/* 拒绝按钮 */}
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

        {/* 显示下线状态按钮 */}
        {record.status === 'approved' && !record.isDeleted && (
          <Button
            type="link"
            danger
            size="small"
            onClick={() => onOffline(record.id!)}
          >
            下线
          </Button>
        )}

        {/* 显示恢复状态按钮 */}
        {record.isDeleted && (
          <Button
            type="link"
            size="small"
            onClick={() => onRestore(record.id!)}
          >
            恢复
          </Button>
        )}
      </Space>
    )
  }
]