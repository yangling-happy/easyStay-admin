// src/pages/HotelAudit/components/HotelDetailDrawer.tsx
import { Drawer, Descriptions, Tag, Space, Divider } from 'antd'
import type { Hotel } from '@/types/hotel'

interface Props {
  open: boolean
  hotel: Hotel | null
  onClose: () => void
}

const HotelDetailDrawer = ({ open, hotel, onClose }: Props) => {
  if (!hotel) return null

  return (
    <Drawer
      title="酒店详情"
      width={600}
      open={open}
      onClose={onClose}
    >
      <Descriptions column={1} bordered>
        <Descriptions.Item label="酒店名称">{hotel.name}</Descriptions.Item>
        <Descriptions.Item label="英文名称">{hotel.nameEn}</Descriptions.Item>
        <Descriptions.Item label="地址">{hotel.address}</Descriptions.Item>
        <Descriptions.Item label="星级">
          <Tag>{hotel.star}星</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="状态">
          <Space>
            <Tag color={hotel.status === 'approved' ? 'green' : 'orange'}>
              {hotel.status === 'pending' ? '待审核' :
                hotel.status === 'approved' ? '已通过' : '已拒绝'}
            </Tag>
            {hotel.isDeleted && <Tag color="gray">已下线</Tag>}
          </Space>
        </Descriptions.Item>
        {hotel.status === 'rejected' && hotel.rejectReason && (
          <Descriptions.Item label="拒绝原因">
            <div style={{ color: '#ff4d4f' }}>{hotel.rejectReason}</div>
          </Descriptions.Item>
        )}
        <Descriptions.Item label="创建时间">
          {hotel.createTime
            ? new Date(hotel.createTime).toLocaleString('zh-CN')
            : '未设置'}
        </Descriptions.Item>
      </Descriptions>

      <Divider>房型信息</Divider>

      {hotel.roomTypes && hotel.roomTypes.length > 0 ? (
        <Space direction="vertical" style={{ width: '100%' }}>
          {hotel.roomTypes.map((room) => (
            <div key={room.id} style={{
              padding: 12,
              background: '#f5f5f5',
              borderRadius: 4
            }}>
              <div><strong>{room.name}</strong></div>
              <div>价格: ¥{room.price}/晚</div>
              <div>库存: {room.stock}间</div>
            </div>
          ))}
        </Space>
      ) : (
        <div>暂无房型信息</div>
      )}
    </Drawer>
  )
}

export default HotelDetailDrawer