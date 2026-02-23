import React, { useState } from "react";
import {
  Table,
  Tag,
  Card,
  Typography,
  Input,
  Modal,
  Button,
  Space,
  Tooltip,
} from "antd";
import {
  EyeOutlined,
  InfoCircleOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { useAuditData } from "./hooks/useAuditData";
import HotelDetailView from "@/components/HotelDetailView";
import { formatDateTime } from "@/utils/dateUtils";
import { message } from "antd";

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
      dataIndex: "id",
      key: "id",
      width: 120,
      render: (id: string, record: any) => {
        const displayId = id || record._id;
        const shortId = displayId?.slice(-6).toUpperCase();
        const fullId = displayId;

        return (
          <Tooltip title={`完整编号: ${fullId}`}>
            <Space>
              <code
                style={{
                  color: "#1890ff",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
                onClick={() => {
                  navigator.clipboard.writeText(fullId);
                  message.success("编号已复制");
                }}
              >
                {shortId}
              </code>
              <CopyOutlined
                style={{ color: "#1890ff", cursor: "pointer" }}
                onClick={() => {
                  navigator.clipboard.writeText(fullId);
                }}
              />
            </Space>
          </Tooltip>
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
      render: (time: string) => formatDateTime(time),
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
        title="申请记录详情"
        open={isDetailVisible}
        onCancel={() => setIsDetailVisible(false)}
        footer={null}
        width={800}
      >
        <HotelDetailView data={selectedHotel} type="audit" />
      </Modal>
    </div>
  );
};

export default AuditRecords;
