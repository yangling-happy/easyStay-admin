import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Card,
  Space,
  message,
  Modal,
  Tag,
  Select,
  Empty,
  Tooltip,
} from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  CopyOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { hotelService } from "@/api/services/hotelService";
import { getFullAddress } from "@/utils/addressData";
import { formatDateTime } from "@/utils/dateUtils";
import HotelDetailView from "@/components/HotelDetailView";
import HotelSearchInput from "@/components/HotelSearchInput";
import BatchDelete from "@/components/BatchDelete";

const IncompleteHotels: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get("status") || "all";

  const [incompleteHotels, setIncompleteHotels] = useState<any[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [searchText, setSearchText] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [batchDeleteLoading, setBatchDeleteLoading] = useState(false);

  const loadIncompleteHotels = async () => {
    setLoading(true);
    try {
      // 直接调用获取所有酒店的接口，然后在前端过滤
      const hotels = await hotelService.getMyHotels();
      const filteredHotels = hotels.filter(
        (h) => h.isIncomplete === true && h.isDeleted === false,
      );

      // 进一步按状态过滤
      const finalHotels =
        statusFilter === "all"
          ? filteredHotels
          : filteredHotels.filter((h) => h.completionStatus === statusFilter);

      setIncompleteHotels(finalHotels);

      // 应用搜索过滤
      filterHotelsBySearch(finalHotels);

      // 添加日志以便调试
      console.log("加载待完善酒店:", {
        totalHotels: hotels.length,
        incompleteHotels: filteredHotels.length,
        filteredHotels: finalHotels.length,
        statusFilter,
      });
    } catch (error) {
      console.error("获取待完善酒店失败:", error);
      message.error("获取待完善酒店失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncompleteHotels();
  }, [statusFilter]);

  useEffect(() => {
    filterHotelsBySearch(incompleteHotels);
  }, [searchText, incompleteHotels]);

  const handleCompleteInfo = (record: any) => {
    const hotelId = record._id || record.id;
    const formData = {
      id: hotelId,
      version: record.version,
      name: record.name,
      nameEn: record.nameEn,
      location: record.location,
      address: record.address,
      phone: record.phone,
      openingDate: record.openingDate,
      star: record.star?.toString?.() ?? record.star,
      photos: record.photos,
      amenities: record.amenities,
      roomTypes: record.roomTypes,
      isActive: record.isActive,
    };

    try {
      localStorage.setItem("hotel_edit_form_data", JSON.stringify(formData));
      localStorage.setItem("hotel_edit_current_step", "1");
    } catch (error) {
      console.error("预填酒店信息失败:", error);
    }

    navigate(`/hotels/edit/${hotelId}`);
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
        loadIncompleteHotels();
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

  const showDetail = (record: any) => {
    setSelectedHotel(record);
    setIsDetailVisible(true);
  };

  const filterHotelsBySearch = (hotels: any[]) => {
    if (!searchText.trim()) {
      setFilteredHotels(hotels);
      return;
    }

    const filtered = hotels.filter((hotel) => {
      const searchLower = searchText.toLowerCase();
      return (
        hotel.name.toLowerCase().includes(searchLower) ||
        hotel.nameEn?.toLowerCase().includes(searchLower) ||
        hotel.address?.toLowerCase().includes(searchLower) ||
        (hotel._id || hotel.id)?.toString().toLowerCase().includes(searchLower)
      );
    });

    setFilteredHotels(filtered);
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
      width: 250,
      render: (_: unknown, record: any) => (
        <Space size="middle">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleCompleteInfo(record)}
          >
            完善信息
          </Button>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => showDetail(record)}
          >
            查看详情
          </Button>
          <Button
            danger
            type="link"
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
              共 {filteredHotels.length} 家
            </Tag>
          </Space>
        }
        extra={
          <Space>
            {/* 批量删除按钮 */}
            <BatchDelete
              selectedRowKeys={selectedRowKeys}
              dataSource={filteredHotels}
              onBatchDelete={handleBatchDelete}
              itemName="酒店"
              getDisplayName={(item) => item.name}
              getDisplayInfo={(item) => item.address || "无地址信息"}
              loading={batchDeleteLoading}
            />
            {/* 状态筛选 */}
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
            {/* 搜索组件 */}
            <HotelSearchInput
              placeholder="搜索酒店名称或编号"
              onSearch={(value) => setSearchText(value)}
              onChange={(value) => setSearchText(value)}
              style={{ width: 300 }}
            />
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredHotels}
          rowKey={(record) => record._id || record.id}
          loading={loading}
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
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div>
                    <div>暂无待完善酒店</div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#999",
                        marginTop: "8px",
                      }}
                    >
                      您可以通过"房型发布"菜单中的"批量创建酒店"功能导入酒店
                    </div>
                  </div>
                }
              />
            ),
          }}
        />
      </Card>

      {/* --- 详情展示弹窗 --- */}
      <Modal
        title="酒店详细资产信息"
        open={isDetailVisible}
        onCancel={() => setIsDetailVisible(false)}
        footer={null}
        width={800}
      >
        <HotelDetailView data={selectedHotel} type="list" />
      </Modal>
    </div>
  );
};

export default IncompleteHotels;
