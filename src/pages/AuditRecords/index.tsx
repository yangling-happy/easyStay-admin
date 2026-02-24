import React, { useState } from "react";
import {
  Table,
  Tag,
  Card,
  Typography,
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
import { getFullAddress } from "@/utils/addressData";
import HotelSearchInput from "@/components/HotelSearchInput";
import { filterHotelsByKeyword } from "@/utils/filterHotelsByKeyword.";
import BatchDelete from "@/components/BatchDelete";
import { hotelService } from "@/api/services/hotelService";

const { Title } = Typography;

const AuditRecords: React.FC = () => {
  const { data, loading } = useAuditData();
  const [searchText, setSearchText] = useState("");
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [batchDeleteLoading, setBatchDeleteLoading] = useState(false);

  // 查看详情处理逻辑
  const showDetail = (record: any) => {
    setSelectedHotel(record);
    setIsDetailVisible(true);
  };

  // 批量删除处理逻辑
  const handleBatchDelete = async (
    ids: string[],
  ): Promise<{
    success: boolean;
    successCount: number;
    failedCount: number;
    failedIds: string[];
  }> => {
    setBatchDeleteLoading(true);
    try {
      const result = await hotelService.batchDeleteHotels(ids);

      if (result.success) {
        message.success(
          `成功删除 ${result.successCount} 家酒店${result.failedCount > 0 ? `，失败 ${result.failedCount} 家` : ""}`,
        );
        // 清空选中状态
        setSelectedRowKeys([]);
        // 重新加载数据
        window.location.reload();
      } else {
        message.error("批量删除失败，请重试");
      }
      return result;
    } catch (error: any) {
      console.error("批量删除失败:", error);
      message.error(error.response?.data?.message || "批量删除失败，请重试");
      return {
        success: false,
        successCount: 0,
        failedCount: ids.length,
        failedIds: ids,
      };
    } finally {
      setBatchDeleteLoading(false);
    }
  };

  // 搜索过滤逻辑（支持酒店名称和编号搜索）
  const filteredData = filterHotelsByKeyword(data, searchText);

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
      width: 200,
      ellipsis: true,
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
          <Space>
            <BatchDelete
              selectedRowKeys={selectedRowKeys}
              dataSource={filteredData}
              onBatchDelete={handleBatchDelete}
              itemName="酒店"
              getDisplayName={(item) => item.name}
              getDisplayInfo={(item) => item.address || "无地址信息"}
              loading={batchDeleteLoading}
            />
            <HotelSearchInput
              placeholder="搜索酒店名称或编号"
              onSearch={(value) => setSearchText(value)}
              onChange={(value) => setSearchText(value)}
              style={{ width: 300 }}
            />
          </Space>
        </div>
        <Table
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
            selections: [
              Table.SELECTION_ALL,
              Table.SELECTION_INVERT,
              Table.SELECTION_NONE,
            ],
          }}
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
