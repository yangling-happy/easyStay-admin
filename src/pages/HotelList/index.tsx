import React, { useState } from "react";
import {
  Table,
  Tag,
  Space,
  Button,
  Card,
  Switch,
  message,
  Tooltip,
  Modal,
  Typography,
  Descriptions, // 💡 新增
} from "antd";
import { useNavigate } from "react-router-dom";
import {
  EditOutlined,
  EyeOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useAuditData } from "../AuditRecords/hooks/useAuditData";
import { patch, post } from "@/api/http/request";

const { Text } = Typography;

const HotelList: React.FC = () => {
  const navigate = useNavigate();
  const { data, loading, refresh } = useAuditData();

  // --- 💡 详情弹窗相关状态 ---
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);

  // 严格过滤：只显示已通过审核的正式资产
  const activeHotels =
    data?.filter((item: any) => item.status === "approved") || [];

  // --- 💡 处理详情展示 ---
  const showDetail = (record: any) => {
    setSelectedHotel(record);
    setIsDetailVisible(true);
  };

  // 处理上下架逻辑
  const handleToggle = (record: any) => {
    const hotelId = record._id || record.id;

    if (record.isActive) {
      Modal.confirm({
        title: "确定要下线该酒店吗？",
        content: "下线后旅客将无法预订，重新上线需管理员再次审核。",
        okText: "确认下线",
        okButtonProps: { danger: true },
        onOk: async () => {
          try {
            await patch(`/hotels/${hotelId}/offline`);
            message.success("酒店已下线");
            refresh();
          } catch (error: any) {
            console.error("下线操作详情错误:", error);
            message.error("下线失败");
          }
        },
      });
    } else {
      Modal.confirm({
        title: "申请恢复上线",
        content: "提交后将进入待审核列表，审核通过后方可重新销售。",
        okText: "提交申请",
        onOk: async () => {
          try {
            await post(`/hotels/${hotelId}/re-apply`);
            message.success("申请已提交，请关注审核记录");
            refresh();
          } catch (error: any) {
            message.error("提交失败");
          }
        },
      });
    }
  };

  // 处理编辑跳转
  const handleEdit = (record: any) => {
    Modal.confirm({
      title: "修改确认",
      icon: <ExclamationCircleOutlined />,
      content:
        "修改酒店关键信息后，系统将撤回当前在线状态并重新发起审核。确定要修改吗？",
      okText: "去修改",
      onOk: () => {
        navigate(`/hotels/edit/${record._id}`);
      },
    });
  };

  const columns = [
    {
      title: "酒店名称",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <Text strong style={{ color: '#1890ff' }}>
          {text}
        </Text>
      ),
    },
    {
      title: "地区",
      dataIndex: "city",
      key: "city",
      width: 120,
    },
    {
      title: "当前状态",
      key: "isActive",
      width: 180,
      render: (_: unknown, record: any) => (
        <Space>
          <Switch
            checked={record.isActive}
            onChange={() => handleToggle(record)}
            size="small"
          />
          <Tag color={record.isActive ? "green" : "orange"}>
            {record.isActive ? "销售中" : "已下线/待重审"}
          </Tag>
        </Space>
      ),
    },
    {
      title: "最后核准日期",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString() : "-",
    },
    {
      title: "资产操作",
      key: "action",
      width: 220,
      render: (_: unknown, record: any) => (
        <Space size="middle">
          <Tooltip title="编辑信息将导致重新审核">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              修改申请
            </Button>
          </Tooltip>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => showDetail(record)} // 💡 改为触发弹窗
          >
            查看详情
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
            {/* 这里的文字可以稍微加粗放大 */}
            <span style={{ fontSize: '18px', fontWeight: 600 }}>酒店列表管理 (已上线)</span>
            <Tag color="cyan" style={{ fontSize: '14px', padding: '0 8px' }}>
              共 {activeHotels.length} 家
            </Tag>
          </Space>
        }
        extra={
          <Button 
            type="primary" // 改为蓝底色更醒目
            icon={<ReloadOutlined />} 
            onClick={refresh} 
            loading={loading}
            style={{ borderRadius: '4px' }}
          >
            同步数据
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={activeHotels}
          rowKey={(record) => record._id || record.id}
          loading={loading}
          pagination={{ pageSize: 8 }}
          // --- 优化 Footer 字体 ---
          footer={() => (
            <div style={{ padding: '8px 0' }}>
              <Text 
                strong // 加粗
                type="secondary" 
                style={{ fontSize: '15px', color: '#555' }}
              >
                * 注：所有涉及“修改”或“恢复上线”的操作均需经过平台管理方二次人工审核。
              </Text>
            </div>
          )}
        />
      </Card>

      {/* --- 💡 详情展示弹窗 --- */}
      <Modal
        title="酒店详细资产信息"
        open={isDetailVisible}
        onCancel={() => setIsDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailVisible(false)}>
            关闭
          </Button>,
        ]}
        width={700}
      >
        {selectedHotel && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="系统编号">
              <code style={{ color: "#1890ff" }}>
                {selectedHotel._id || selectedHotel.id}
              </code>
            </Descriptions.Item>
            <Descriptions.Item label="酒店名称">
              {selectedHotel.name}
            </Descriptions.Item>
            <Descriptions.Item label="英文名称">
              {selectedHotel.nameEn || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="酒店地址">
              {selectedHotel.address}
            </Descriptions.Item>
            <Descriptions.Item label="星级">
              {selectedHotel.star} 星
            </Descriptions.Item>
            <Descriptions.Item label="当前销售状态">
              <Tag color={selectedHotel.isActive ? "green" : "orange"}>
                {selectedHotel.isActive ? "销售中" : "已下线"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="附近信息">
              {selectedHotel.nearbyInfo || "无"}
            </Descriptions.Item>
            <Descriptions.Item label="核准日期">
              {new Date(selectedHotel.updatedAt).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default HotelList;