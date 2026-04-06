// src/pages/HotelAudit/index.tsx
import { Table, Modal, message, Space, Select } from "antd";
import { useState, useEffect } from "react";
import { getColumns } from "./columns";
import RejectModal from "./components/RejectModal";
import HotelDetailDrawer from "./components/HotelDetailDrawer";
import { auditService } from "@/api/services/auditService";
import { useHotelStore } from "@/store/useHotelStore";
import type { Hotel, HotelStatus } from "@/types/hotel";
import HotelSearchInput from "@/components/HotelSearchInput";
import { filterHotelsByKeyword } from "@/utils/filterHotelsByKeyword.";
const HotelAudit = () => {
  const [loading, setLoading] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentHotel, setCurrentHotel] = useState<Hotel | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchText, setSearchText] = useState("");

  const { hotels, setHotels, updateHotel } = useHotelStore();

  // 初始化数据
  useEffect(() => {
    loadHotels();
  }, [statusFilter]);

  // 加载数据
  const loadHotels = async () => {
    setLoading(true);
    try {
      let data: Hotel[] = [];

      // 根据筛选条件调用不同的 API
      switch (statusFilter) {
        case "pending":
          data = await auditService.getPendingHotels();
          break;
        case "published":
          data = await auditService.getPublishedHotels();
          break;
        case "rejected":
          data = await auditService.getRejectedHotels();
          break;
        case "offline":
          data = await auditService.getOfflineHotels();
          break;
        case "all":
        default:
          // 获取全部数据，需要合并多个接口
          const [pending, published, rejected, offline] = await Promise.all([
            auditService.getPendingHotels(),
            auditService.getPublishedHotels(),
            auditService.getRejectedHotels(),
            auditService.getOfflineHotels(),
          ]);
          data = [...pending, ...published, ...rejected, ...offline];
          break;
      }

      // 将 _id 转换为 id
      const normalizedData = data.map((hotel: any) => ({
        ...hotel,
        id: hotel.id || hotel._id?.toString() || hotel._id,
      }));

      // 确保数据格式正确，过滤掉无效数据
      const validData = normalizedData.filter(
        (hotel) =>
          hotel && (hotel.id || hotel._id) && hotel.name && hotel.status,
      );
      setHotels(validData);
    } catch (error) {
      console.error("加载数据失败:", error);
      message.error("加载数据失败");
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  // 筛选后的数据
  const filteredData = hotels.filter((hotel) => {
    // 筛选状态
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && hotel.status === "pending") ||
      (statusFilter === "published" &&
        hotel.status === "approved" &&
        hotel.isActive &&
        !hotel.isDeleted) || //使用 isDeleted 判断酒店是否删除
      (statusFilter === "offline" &&
        hotel.status === "approved" &&
        !hotel.isActive) || //使用 isActive 判断酒店是否下线
      (statusFilter === "rejected" && hotel.status === "rejected");

    const matchSearch =
      !searchText || filterHotelsByKeyword([hotel], searchText).length > 0;

    return matchStatus && matchSearch;
  });
  // 审核通过
  const handleApprove = (id: string) => {
    Modal.confirm({
      title: "确认通过",
      content: "确定要通过该酒店的审核吗？",
      onOk: async () => {
        try {
          const result = await auditService.submitAudit(id, "approved");
          updateHotel(id, {
            status: "approved" as HotelStatus,
            isActive: true,
          });
          message.success(result.message || "审核通过成功");
          loadHotels(); // 重新加载数据
        } catch (error) {
          console.error("审核通过失败:", error);
          message.error("操作失败");
        }
      },
    });
  };

  // 拒绝审核
  const handleReject = (hotel: Hotel) => {
    setCurrentHotel(hotel); // 设置当前酒店
    setRejectOpen(true); // 设置拒绝模态框显示
  };
  // 提交拒绝
  const submitReject = async (reason: string) => {
    if (!currentHotel || !currentHotel.id) return;

    try {
      const result = await auditService.submitAudit(
        currentHotel.id,
        "rejected",
        reason,
      );
      updateHotel(currentHotel.id, {
        status: "rejected" as HotelStatus,
        rejectReason: reason,
      });
      message.success(result.message || "已拒绝该酒店");
      setRejectOpen(false);
      setCurrentHotel(null);
      loadHotels(); // 重新加载数据
    } catch (error) {
      console.error("拒绝酒店失败:", error);
      message.error("操作失败");
    }
  };

  // 下线酒店
  const handleOffline = (id: string) => {
    Modal.confirm({
      title: "确认下线",
      content: "确定要下线该酒店吗？下线后用户将无法看到该酒店。",
      onOk: async () => {
        try {
          const result = await auditService.toggleHotelStatus(id);
          updateHotel(id, { isActive: false });
          message.success(result.message || "酒店已下线");
          loadHotels(); // 重新加载数据
        } catch (error) {
          console.error("下线酒店失败:", error);
          message.error("操作失败");
        }
      },
    });
  };

  // 恢复酒店上线
  const handleRestore = (id: string) => {
    Modal.confirm({
      title: "确认恢复",
      content: "确定要恢复该酒店上线吗？",
      onOk: async () => {
        try {
          const result = await auditService.toggleHotelStatus(id);
          updateHotel(id, { isActive: true });
          message.success(result.message || "酒店已恢复上线");
          loadHotels(); // 重新加载数据
        } catch (error) {
          console.error("恢复酒店失败:", error);
          message.error("操作失败");
        }
      },
    });
  };

  // 查看详情
  const handleViewDetail = (hotel: Hotel) => {
    setCurrentHotel(hotel);
    setDetailOpen(true);
  };

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          gap: 16,
          alignItems: "center",
        }}
      >
        <h2 style={{ margin: 0 }}>酒店审核管理</h2>

        <Space>
          {/* 状态筛选 */}
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
            options={[
              { label: "全部", value: "all" },
              { label: "待审核", value: "pending" },
              { label: "已发布", value: "published" },
              { label: "已拒绝", value: "rejected" },
              { label: "已下线", value: "offline" },
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
      </div>

      {/* 表格 */}
      <Table
        rowKey="id"
        columns={getColumns(
          handleApprove,
          handleReject,
          handleOffline,
          handleRestore,
          handleViewDetail,
        )}
        dataSource={filteredData}
        loading={loading}
        pagination={{
          pageSize: 10,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
      />

      {/* 拒绝模态框 */}
      <RejectModal
        open={rejectOpen}
        onCancel={() => {
          setRejectOpen(false);
          setCurrentHotel(null);
        }}
        onSubmit={submitReject}
      />

      {/* 查看详情 */}
      <HotelDetailDrawer
        open={detailOpen}
        hotel={currentHotel}
        onClose={() => {
          setDetailOpen(false);
          setCurrentHotel(null);
        }}
      />
    </div>
  );
};

export default HotelAudit;
