import React, { useState, useEffect, useMemo } from "react";
import { Table, Button, Card, Space, message, Modal, Tag, Select, Empty } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { hotelService } from "@/api/services/hotelService";
import { getFullAddress } from "@/utils/addressData";
import { formatDateTime } from "@/utils/dateUtils";

const IncompleteHotels: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get("status") || "all";

  const [incompleteHotels, setIncompleteHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadIncompleteHotels = async () => {
    setLoading(true);
    try {
      const hotels = await hotelService.getIncompleteHotelsByStatus(statusFilter);
      setIncompleteHotels(hotels);
    } catch (error) {
      console.error("获取待完善酒店失败:", error);
      message.error("获取待完善酒店失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncompleteHotels();
  }, [statusFilter]);

  const handleCompleteInfo = (record: any) => {
    navigate(`/hotels/edit/${record._id || record.id}`);
  };

  const handleDelete = (record: any) => {
    Modal.confirm({
      title: "确认删除",
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除酒店"${record.name}"吗？删除后将无法恢复。`,
      okText: "确认删除",
      okButtonProps: { danger: true },
      cancelText: "取消",
      onOk: async () => {
        try {
          const hotelId = record._id || record.id;
          await hotelService.deleteHotel(hotelId);
          message.success("酒店已删除");
          loadIncompleteHotels();
        } catch (error: any) {
          message.error(error.response?.data?.message || "删除失败");
        }
      },
    });
  };

  const getCompletionStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      draft: { color: "default", text: "草稿" },
      incomplete: { color: "warning", text: "信息不全" },
      rejected: { color: "error", text: "被驳回" },
    };
    const config = statusMap[status] || { color: "default", text: "未知" };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: "酒店名称",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (name: string, record: any) => (
        <div>
          <div>{name}</div>
          {record.nameEn && (
            <div style={{ color: "#888", fontSize: "12px" }}>
              {record.nameEn}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "酒店地址",
      dataIndex: "address",
      key: "address",
      width: 250,
      render: (address: string, record: any) => (
        <div>
          <div>{address || "-"}</div>
          {record.location && record.location.length > 0 && (
            <div style={{ color: "#888", fontSize: "12px" }}>
              {getFullAddress(record.location)}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "完善状态",
      dataIndex: "completionStatus",
      key: "completionStatus",
      width: 120,
      render: (status: string) => getCompletionStatusTag(status),
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      key: "createTime",
      width: 160,
      render: (date: string) => formatDateTime(date),
    },
    {
      title: "操作",
      key: "action",
      width: 200,
      render: (_: unknown, record: any) => (
        <Space size="middle">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleCompleteInfo(record)}
          >
            完善信息
          </Button>
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
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
            <span style={{ fontSize: "18px", fontWeight: 600 }}>
              待完善酒店
            </span>
            <Tag color="cyan" style={{ fontSize: "14px", padding: "0 8px" }}>
              共 {incompleteHotels.length} 家
            </Tag>
          </Space>
        }
        extra={
          <Select
            value={statusFilter}
            onChange={(value) => {
              navigate(`/hotels/incomplete?status=${value}`);
            }}
            style={{ width: 120 }}
            options={[
              { value: "all", label: "全部" },
              { value: "draft", label: "草稿" },
              { value: "incomplete", label: "信息不全" },
              { value: "rejected", label: "被驳回" },
            ]}
          />
        }
      >
        <Table
          columns={columns}
          dataSource={incompleteHotels}
          rowKey={(record) => record._id || record.id}
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div>
                    <div>暂无待完善酒店</div>
                    <div style={{ fontSize: "12px", color: "#999", marginTop: "8px" }}>
                      您可以通过"房型发布"菜单中的"批量创建酒店"功能导入酒店
                    </div>
                  </div>
                }
              />
            ),
          }}
        />
      </Card>
    </div>
  );
};

export default IncompleteHotels;