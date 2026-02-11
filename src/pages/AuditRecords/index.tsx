import React, { useState } from "react";
import {
  Table,
  Tag,
  Card,
  Typography,
  Input,
  Modal,
  Descriptions,
  Button,
  Space,
  Tooltip,
} from "antd";
import { EyeOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useAuditData } from "./hooks/useAuditData";
import { getFullAddress } from "../../utils/addressData";

const { Title } = Typography;
const { Search } = Input;

const AuditRecords: React.FC = () => {
  const { data, loading } = useAuditData();
  const [searchText, setSearchText] = useState("");
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);

  // 查看详情处理逻辑
  const showDetail = (record: any) => {
    setSelectedHotel(record);
    setIsDetailVisible(true);
  };

  // 搜索过滤逻辑（支持酒店名称和编号搜索）
  const filteredData = data.filter(
    (item: any) =>
      item.name?.includes(searchText) ||
      item._id?.includes(searchText) ||
      item.id?.includes(searchText),
  );

  const columns = [
    {
      title: "酒店编号",
      dataIndex: "id", // 如果后端转化了则是 id，否则写 _id
      key: "id",
      width: 120,
      render: (id: string, record: any) => {
        const displayId = id || record._id;
        return (
          <code style={{ color: "#1890ff" }}>
            {displayId?.slice(-6).toUpperCase()}
          </code>
        );
      },
    },
    {
      title: "酒店名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "申请时间",
      dataIndex: "createTime",
      key: "createTime",
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: "审核状态",
      dataIndex: "status",
      key: "status",
      render: (status: string, record: any) => {
        if (status === "approved") return <Tag color="green">已通过</Tag>;
        if (status === "rejected") {
          return (
            <Space>
              <Tag color="red">已拒绝</Tag>
              {record.rejectReason && (
                <Tooltip title={`拒绝原因: ${record.rejectReason}`}>
                  <InfoCircleOutlined
                    style={{ color: "#ff4d4f", cursor: "pointer" }}
                  />
                </Tooltip>
              )}
            </Space>
          );
        }
        return <Tag color="orange">审核中</Tag>;
      },
    },
    {
      title: "操作",
      key: "action",
      render: (_: any, record: any) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => showDetail(record)}
        >
          查看详情
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            酒店上线申请记录
          </Title>
          <Search
            placeholder="搜索酒店名称或编号"
            allowClear
            onSearch={(value) => setSearchText(value)}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* 详情展示弹窗 */}
      <Modal
        title="酒店申请详细信息"
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
              {selectedHotel._id || selectedHotel.id}
            </Descriptions.Item>
            <Descriptions.Item label="酒店名称">
              {selectedHotel.name}
            </Descriptions.Item>
            <Descriptions.Item label="英文名称">
              {selectedHotel.nameEn}
            </Descriptions.Item>

            <Descriptions.Item label="酒店地址">
              {getFullAddress(selectedHotel.location, selectedHotel.address)}
            </Descriptions.Item>
            
            <Descriptions.Item label="星级">
              {selectedHotel.star} 星
            </Descriptions.Item>
            <Descriptions.Item label="审核状态">
              <Tag
                color={
                  selectedHotel.status === "approved"
                    ? "green"
                    : selectedHotel.status === "rejected"
                      ? "red"
                      : "orange"
                }
              >
                {selectedHotel.status === "approved"
                  ? "已通过"
                  : selectedHotel.status === "rejected"
                    ? "已拒绝"
                    : "审核中"}
              </Tag>
            </Descriptions.Item>
            {selectedHotel.status === "rejected" && (
              <Descriptions.Item label="驳回原因">
                <span style={{ color: "#ff4d4f", fontWeight: "bold" }}>
                  {selectedHotel.rejectReason || "未填写"}
                </span>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="附近信息">
              {selectedHotel.nearbyInfo || "无"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default AuditRecords;
