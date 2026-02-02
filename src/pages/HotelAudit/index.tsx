// src/pages/HotelAudit/index.tsx
import { Table, Modal, message, Space, Select, Input } from 'antd'
import { useState, useEffect } from 'react'
import { getColumns } from './columns'
import RejectModal from './components/RejectModal'
import HotelDetailDrawer from './components/HotelDetailDrawer'
import { hotelService } from '@/api/services/hotelService'
import { useHotelStore } from '@/store/useHotelStore'
import type { Hotel, HotelStatus } from '@/types/hotel'

const HotelAudit = () => {
  const [loading, setLoading] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [currentHotel, setCurrentHotel] = useState<Hotel | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchText, setSearchText] = useState('')
  
  const { hotels, setHotels, updateHotel } = useHotelStore()

  // 初始化数据
  useEffect(() => {
    loadHotels()
  }, [])

  const loadHotels = async () => {
    setLoading(true)
    try {
      const data = await hotelService.getMyHotels()
      // 确保数据格式正确，过滤掉无效数据
      const validData = data.filter(hotel => 
        hotel && 
        hotel.id && 
        hotel.name && 
        hotel.status
      )
      setHotels(validData)
    } catch (error) {
      console.error('加载数据失败:', error)
      message.error('加载数据失败')
      setHotels([])
    } finally {
      setLoading(false)
    }
  }

  // 筛选后的数据
  const filteredData = hotels.filter(hotel => {
    const matchStatus = statusFilter === 'all' || 
      (statusFilter === 'pending' && hotel.status === 'pending') ||
      (statusFilter === 'published' && hotel.status === 'approved' && !hotel.isDeleted) ||
      (statusFilter === 'offline' && hotel.isDeleted) ||
      (statusFilter === 'rejected' && hotel.status === 'rejected')
    
    const matchSearch = !searchText || 
      hotel.name.toLowerCase().includes(searchText.toLowerCase()) ||
      hotel.address.toLowerCase().includes(searchText.toLowerCase())
    
    return matchStatus && matchSearch
  })

  const handleApprove = (id: string) => {
    Modal.confirm({
      title: '确认通过',
      content: '确定要通过该酒店的审核吗？',
      onOk: async () => {
        try {
          // 注意：auditHotel方法在当前的hotelService中不存在，需要使用saveHotel方法
          const hotel = await hotelService.getHotelById(id)
          if (hotel) {
            const updatedHotel: Hotel = {
              ...hotel,
              status: 'approved' as HotelStatus
            };
            await hotelService.saveHotel(updatedHotel)
            updateHotel(id, { status: 'approved' as HotelStatus })
            message.success('审核通过成功')
          }
        } catch (error) {
          console.error('审核通过失败:', error)
          message.error('操作失败')
        }
      }
    })
  }

  const handleReject = (hotel: Hotel) => {
    setCurrentHotel(hotel)
    setRejectOpen(true)
  }

  const submitReject = async (reason: string) => {
    if (!currentHotel) return
    
    try {
      // 注意：auditHotel方法在当前的hotelService中不存在，需要使用saveHotel方法
      const updatedHotel: Hotel = {
        ...currentHotel,
        status: 'rejected' as HotelStatus,
        rejectReason: reason
      };
      await hotelService.saveHotel(updatedHotel)
      updateHotel(currentHotel.id, { 
        status: 'rejected' as HotelStatus, 
        rejectReason: reason 
      })
      message.success('已拒绝该酒店')
      setRejectOpen(false)
      setCurrentHotel(null)
    } catch (error) {
      console.error('拒绝酒店失败:', error)
      message.error('操作失败')
    }
  }

  const handleOffline = (id: string) => {
    Modal.confirm({
      title: '确认下线',
      content: '确定要下线该酒店吗？下线后用户将无法看到该酒店。',
      onOk: async () => {
        try {
          await hotelService.deleteHotel(id)
          updateHotel(id, { isDeleted: true })
          message.success('酒店已下线')
        } catch (error) {
          console.error('下线酒店失败:', error)
          message.error('操作失败')
        }
      }
    })
  }

  const handleRestore = (id: string) => {
    Modal.confirm({
      title: '确认恢复',
      content: '确定要恢复该酒店上线吗？',
      onOk: async () => {
        try {
            await hotelService.restoreHotel(id)
            updateHotel(id, { isDeleted: false })
            message.success('酒店已恢复上线')
        } catch (error) {
          console.error('恢复酒店失败:', error)
          message.error('操作失败')
        }
      }
    })
  }

  const handleViewDetail = (hotel: Hotel) => {
    setCurrentHotel(hotel)
    setDetailOpen(true)
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>酒店审核管理</h2>
        
        <Space>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
            options={[
              { label: '全部', value: 'all' },
              { label: '待审核', value: 'pending' },
              { label: '已发布', value: 'published' },
              { label: '已拒绝', value: 'rejected' },
              { label: '已下线', value: 'offline' }
            ]}
          />
          
          <Input.Search
            placeholder="搜索酒店名称或地址"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
        </Space>
      </div>

      <Table
        rowKey="id"
        columns={getColumns(
          handleApprove,
          handleReject,
          handleOffline,
          handleRestore,
          handleViewDetail
        )}
        dataSource={filteredData}
        loading={loading}
        pagination={{ 
          pageSize: 10,
          showTotal: (total) => `共 ${total} 条记录`
        }}
      />
      
      <RejectModal
        open={rejectOpen}
        onCancel={() => {
          setRejectOpen(false)
          setCurrentHotel(null)
        }}
        onSubmit={submitReject}
      />

      <HotelDetailDrawer
        open={detailOpen}
        hotel={currentHotel}
        onClose={() => {
          setDetailOpen(false)
          setCurrentHotel(null)
        }}
      />
    </div>
  )
}

export default HotelAudit