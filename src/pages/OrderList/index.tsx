import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Space,
  Button,
  Card,
  Select,
  message,
  Modal,
  Typography,
  Descriptions,
} from "antd";
import { ReloadOutlined, EyeOutlined } from "@ant-design/icons";
import { orderService } from "@/api/services/orderService";
import { useActiveHotels } from "@/pages/HotelList/hooks/useActiveHotels";
import type { Order, OrderStatus } from "@/types/order";
import type { Hotel } from "@/types/hotel";

const { Text } = Typography;
const { Option } = Select;

const statusMap: Record<OrderStatus, { color: string; text: string }> = {
  pending: { color: "blue", text: "待确认" },
  confirmed: { color: "cyan", text: "已确认" },
  checkin: { color: "green", text: "已入住" },
  checkout: { color: "purple", text: "已退房" },
  cancelled: { color: "red", text: "已取消" },
  refunded: { color: "orange", text: "已退款" },
};

const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">("");
  const [selectedHotelId, setSelectedHotelId] = useState<string>("");
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { activeHotels } = useActiveHotels();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getOrders(
        selectedStatus || undefined,
        selectedHotelId || undefined,
      );
      setOrders(data);
    } catch (error) {
      message.error("获取订单列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus, selectedHotelId]);

  const showDetail = (record: Order) => {
    setSelectedOrder(record);
    setIsDetailVisible(true);
  };

  const handleStatusChange = async (order: Order, newStatus: OrderStatus) => {
    try {
      await orderService.updateOrderStatus(order.id!, newStatus);
      message.success("订单状态已更新");
      fetchOrders();
    } catch (error) {
      message.error("更新订单状态失败");
    }
  };

  const columns = [
    {
      title: "订单号",
      dataIndex: "orderNumber",
      key: "orderNumber",
      render: (text: string) => (
        <Text strong style={{ color: "#1890ff" }}>
          {text}
        </Text>
      ),
    },
    {
      title: "酒店名称",
      dataIndex: "hotelName",
      key: "hotelName",
    },
    {
      title: "房型",
      dataIndex: "roomTypeName",
      key: "roomTypeName",
    },
    {
      title: "入住日期",
      dataIndex: "checkInDate",
      key: "checkInDate",
      render: (date: string | Date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "退房日期",
      dataIndex: "checkOutDate",
      key: "checkOutDate",
      render: (date: string | Date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "联系人",
      dataIndex: "contactName",
      key: "contactName",
    },
    {
      title: "总价",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: "状态",
      key: "status",
      width: 150,
      render: (_: unknown, record: Order) => (
        <Space>
          <Tag color={statusMap[record.status].color}>
            {statusMap[record.status].text}
          </Tag>
          <Select
            value={record.status}
            style={{ width: 120 }}
            onChange={(newStatus) => handleStatusChange(record, newStatus)}
            size="small"
          >
            {Object.entries(statusMap).map(([status, info]) => (
              <Option key={status} value={status}>
                {info.text}
              </Option>
            ))}
          </Select>
        </Space>
      ),
    },
    {
      title: "操作",
      key: "action",
      width: 120,
      render: (_: unknown, record: Order) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => showDetail(record)}
          >
            详情
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Card
        title={
          <Space size="middle">
            <span style={{ fontSize: "18px", fontWeight: 600 }}>订单管理</span>
            <Tag color="cyan" style={{ fontSize: "14px", padding: "0 8px" }}>
              共 {orders.length} 条
            </Tag>
          </Space>
        }
        extra={
          <Space>
            <Select
              placeholder="选择酒店"
              style={{ width: 200 }}
              allowClear
              value={selectedHotelId}
              onChange={setSelectedHotelId}
            >
              {(activeHotels as Hotel[]).map((hotel) => (
                <Option
                  key={hotel.id || (hotel as any)._id}
                  value={hotel.id || (hotel as any)._id}
                >
                  {hotel.name}
                </Option>
              ))}
            </Select>
            <Select
              placeholder="选择订单状态"
              style={{ width: 150 }}
              allowClear
              value={selectedStatus}
              onChange={setSelectedStatus}
            >
              {Object.entries(statusMap).map(([status, info]) => (
                <Option key={status} value={status}>
                  {info.text}
                </Option>
              ))}
            </Select>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={fetchOrders}
              loading={loading}
            >
              刷新
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={orders}
          rowKey={(record) => record.id || record.orderNumber}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="订单详情"
        open={isDetailVisible}
        onCancel={() => setIsDetailVisible(false)}
        footer={null}
        width={700}
      >
        {selectedOrder && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="订单号">
              {selectedOrder.orderNumber}
            </Descriptions.Item>
            <Descriptions.Item label="酒店名称">
              {selectedOrder.hotelName}
            </Descriptions.Item>
            <Descriptions.Item label="房型">
              {selectedOrder.roomTypeName}
            </Descriptions.Item>
            <Descriptions.Item label="入住日期">
              {new Date(selectedOrder.checkInDate).toLocaleDateString()}
            </Descriptions.Item>
            <Descriptions.Item label="退房日期">
              {new Date(selectedOrder.checkOutDate).toLocaleDateString()}
            </Descriptions.Item>
            <Descriptions.Item label="入住人数">
              {selectedOrder.guestCount}人
            </Descriptions.Item>
            <Descriptions.Item label="联系人姓名">
              {selectedOrder.contactName}
            </Descriptions.Item>
            <Descriptions.Item label="联系电话">
              {selectedOrder.contactPhone}
            </Descriptions.Item>
            <Descriptions.Item label="特殊要求">
              {selectedOrder.specialRequests || "无"}
            </Descriptions.Item>
            <Descriptions.Item label="订单总价">
              <Text strong style={{ color: "#1890ff" }}>
                ¥{selectedOrder.totalPrice.toFixed(2)}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="订单状态">
              <Tag color={statusMap[selectedOrder.status].color}>
                {statusMap[selectedOrder.status].text}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="支付状态">
              <Tag
                color={
                  selectedOrder.paymentStatus === "paid"
                    ? "green"
                    : selectedOrder.paymentStatus === "refunded"
                      ? "orange"
                      : "red"
                }
              >
                {selectedOrder.paymentStatus === "paid"
                  ? "已支付"
                  : selectedOrder.paymentStatus === "refunded"
                    ? "已退款"
                    : "未支付"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {new Date(selectedOrder.createTime || "").toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default OrderList;
