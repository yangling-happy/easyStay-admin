import { Table } from 'antd'
import { useState } from 'react'
import { getColumns } from './columns'
import RejectModal from './components/RejectModal'
import type { HotelItem } from './columns'

const mockData: HotelItem[] = [
  {
    hotelId: 'hotel_001',
    name: '上海外滩国际酒店',
    status: 'pending'
  },
  {
    hotelId: 'hotel_002',
    name: '北京国贸大酒店',
    status: 'published'
  },
  {
    hotelId: 'hotel_003',
    name: '广州天河商务酒店',
    status: 'rejected',
    rejectReason: '图片不符合规范'
  }
]

const HotelAudit = () => {
  const [loading] = useState(false)

  const [dataSource, setDataSource] = useState<HotelItem[]>(mockData)

  const [rejectOpen, setRejectOpen] = useState(false)
  const [currentId, setCurrentId] = useState<string | null>(null)
  
  const handleApprove = (id: string) => {
    setDataSource(list =>
      list.map(item =>
        item.hotelId === id
          ? { ...item, status: 'published' }
          : item
      )
    )
  }
  const handleOffline = (id: string) => {
    setDataSource(list =>
      list.map(item =>
        item.hotelId === id
          ? { ...item, status: 'offline' }
          : item
      )
    )
  }
  const handleRestore = (id: string) => {
    setDataSource(list =>
      list.map(item =>
        item.hotelId === id
          ? { ...item, status: 'published' }
          : item
      )
    )
  }
  const handleReject = (record: HotelItem) => {
    setCurrentId(record.hotelId)
    setRejectOpen(true)
  }
  
  const submitReject = (reason: string) => {
    setDataSource(list =>
      list.map(item =>
        item.hotelId === currentId
          ? {
              ...item,
              status: 'rejected',
              rejectReason: reason
            }
          : item
      )
    )
  
    setRejectOpen(false)
  }
  
        
  return (
    <div>
      <h2>酒店审核管理</h2>

      <Table
        rowKey="hotelId"
        columns={getColumns(
          handleApprove,
          handleReject,
          handleOffline,
          handleRestore
        )}
        
        dataSource={dataSource}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      <RejectModal
  open={rejectOpen}
  onCancel={
() => setRejectOpen(false
)}
  onSubmit={submitReject}
/>
    </div>
  )
}

export default HotelAudit
