// src/pages/HotelAudit/components/HotelDetailDrawer.tsx
import { Drawer, Descriptions, Tag, Space, Divider, Carousel, Image, Empty } from 'antd'
import type { Hotel } from '@/types/hotel'

interface Props {
  open: boolean
  hotel: Hotel | null
  onClose: () => void
}

const HotelDetailDrawer = ({ open, hotel, onClose }: Props) => {
  if (!hotel) return null

  // 处理图片 URL，确保相对路径转换为完整 URL
  const getImageUrl = (url: string): string => {
    if (!url) return ''
    // 如果已经是完整 URL，直接返回
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    // 如果是相对路径（以 /uploads/ 开头），加上 baseURL
    if (url.startsWith('/uploads/')) {
      return `http://localhost:3000${url}`
    }
    // 其他情况，直接返回
    return url
  }
  // 处理图片数组，过滤空值并转换为完整 URL
  const processImages = (images: string[] | undefined): string[] => {
    if (!images || images.length === 0) return []
    return images
      .filter(img => img && img.trim())
      .map(img => getImageUrl(img))
  }

  const hotelPhotos = processImages(hotel.photos)
  const hasHotelPhotos = hotelPhotos.length > 0

  return (
    <Drawer
      title="酒店详情"
      width={700}
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
            <Tag color={hotel.status === 'approved' ? 'green' : hotel.status === 'rejected' ? 'red' : 'orange'}>
              {hotel.status === 'pending' ? '待审核' :
                hotel.status === 'approved' ? '已通过' : '已拒绝'}
            </Tag>
            {!hotel.isActive && <Tag color="gray">已下线</Tag>}
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

      {/* 酒店整体照片 */}
      <Divider>酒店图片</Divider>
      {hasHotelPhotos ? (
        <div style={{ marginBottom: 24 }}>
          <Image.PreviewGroup>
            <Carousel
              autoplay={true}
              autoplaySpeed={2000}
              dots={true}
              style={{
                background: '#f5f5f5',
                borderRadius: 8,
                padding: 16,
                marginBottom: 16
              }}
            >
              {hotelPhotos.map((photo, index) => (
                <div
                  key={`hotel-photo-${index}-${photo}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 400,
                    width: '100%'
                  }}
                >
                  <Image
                    src={photo}
                    alt={`酒店图片 ${index + 1}`}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      borderRadius: 4
                    }}
                    fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+5Zu+54mH5pyq5Yqg6L29PC90ZXh0Pjwvc3ZnPg=="
                    preview={{
                      mask: '点击查看大图'
                    }}
                  />
                </div>
              ))}
            </Carousel>
          </Image.PreviewGroup>
          <div style={{ textAlign: 'center', color: '#999', fontSize: 12 }}>
            共 {hotelPhotos.length} 张图片，点击图片可放大查看
          </div>
        </div>
      ) : (
        <Empty
          description="暂无酒店图片"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ marginBottom: 24 }}
        />
      )}

      {/* 房型信息 */}
      <Divider>房型信息</Divider>
      {hotel.roomTypes && hotel.roomTypes.length > 0 ? (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {hotel.roomTypes.map((room, roomIndex) => {
            const roomPhotos = processImages(room.photos)
            const hasRoomPhotos = roomPhotos.length > 0

            return (
              <div
                key={room.id || `room-${roomIndex}-${room.name}`}
                style={{
                  padding: 16,
                  background: '#fafafa',
                  borderRadius: 8,
                  border: '1px solid #e8e8e8'
                }}
              >
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
                    {room.name}
                  </div>
                  <Space>
                    <span>价格: <strong style={{ color: '#ff4d4f' }}>¥{room.price}</strong>/晚</span>
                    <span>库存: <strong>{room.stock}</strong>间</span>
                  </Space>
                </div>

                {/* 房型图片 */}
                {hasRoomPhotos ? (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ marginBottom: 8, fontSize: 14, color: '#666' }}>
                      房型图片 ({roomPhotos.length} 张)
                    </div>
                    <Image.PreviewGroup>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {roomPhotos.map((photo, photoIndex) => (
                          <Image
                            key={`room-${roomIndex}-photo-${photoIndex}-${photo}`}
                            src={photo}
                            alt={`${room.name} 图片 ${photoIndex + 1}`}
                            width={120}
                            height={120}
                            style={{
                              objectFit: 'cover',
                              borderRadius: 4,
                              cursor: 'pointer',
                              border: '1px solid #e8e8e8'
                            }}
                            fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+5Zu+54mH5pyq5Yqg6L29PC90ZXh0Pjwvc3ZnPg=="
                          />
                        ))}
                      </div>
                    </Image.PreviewGroup>
                  </div>
                ) : (
                  <div style={{ marginTop: 12, color: '#999', fontSize: 12 }}>
                    该房型暂无图片
                  </div>
                )}
              </div>
            )
          })}
        </Space>
      ) : (
        <Empty
          description="暂无房型信息"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
    </Drawer>
  )
}

export default HotelDetailDrawer