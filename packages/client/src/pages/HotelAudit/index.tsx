// src/pages/HotelAudit/index.tsx
import { Table, Modal, message, Space, Select } from "antd";
import { useEffect, useMemo } from "react";
import { getColumns } from "./columns";
import RejectModal from "./components/RejectModal";
import HotelDetailDrawer from "./components/HotelDetailDrawer";
import type { Hotel } from "../../types/hotel";
import HotelSearchInput from "../../components/HotelSearchInput";
import { filterHotelsByKeyword } from "../../utils/filterHotelsByKeyword.";
import {
  approveHotel,
  closeDetailDrawer,
  closeRejectModal,
  fetchAuditHotels,
  openDetailDrawer,
  openRejectModal,
  rejectHotel,
  setSearchText,
  setStatusFilter,
  toggleHotelOnlineStatus,
} from "../../store/hotelAuditSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getAuditFlowNode } from "../../store/hotelAuditFsm";
const HotelAudit = () => {
  const dispatch = useAppDispatch();
  const {
    hotels,
    loading,
    statusFilter,
    searchText,
    rejectOpen,
    detailOpen,
    currentHotelId,
    error,
  } = useAppSelector((state) => state.hotelAudit);

  const currentHotel = useMemo(
    () => hotels.find((hotel) => hotel.id === currentHotelId) || null,
    [hotels, currentHotelId],
  );

  // 初始化数据
  useEffect(() => {
    dispatch(fetchAuditHotels(statusFilter));
  }, [dispatch, statusFilter]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  // 筛选后的数据
  const filteredData = hotels.filter((hotel) => {
    const flowNode = getAuditFlowNode(hotel);

    // 筛选状态
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && flowNode === "pending_review") ||
      (statusFilter === "published" && flowNode === "approved_online") ||
      (statusFilter === "offline" && flowNode === "approved_offline") ||
      (statusFilter === "rejected" && flowNode === "rejected");

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
          const result = await dispatch(approveHotel(id)).unwrap();
          message.success(result.result.message || "审核通过成功");
        } catch (error) {
          console.error("审核通过失败:", error);
          message.error("操作失败");
        }
      },
    });
  };

  // 拒绝审核
  const handleReject = (hotel: Hotel) => {
    if (!hotel.id) return;
    dispatch(openRejectModal(hotel.id));
  };
  // 提交拒绝
  const submitReject = async (reason: string) => {
    if (!currentHotelId) return;

    try {
      const result = await dispatch(
        rejectHotel({ id: currentHotelId, reason }),
      ).unwrap();
      message.success(result.result.message || "已拒绝该酒店");
      dispatch(closeRejectModal());
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
          const result = await dispatch(
            toggleHotelOnlineStatus({ id, toActive: false }),
          ).unwrap();
          message.success(result.result.message || "酒店已下线");
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
          const result = await dispatch(
            toggleHotelOnlineStatus({ id, toActive: true }),
          ).unwrap();
          message.success(result.result.message || "酒店已恢复上线");
        } catch (error) {
          console.error("恢复酒店失败:", error);
          message.error("操作失败");
        }
      },
    });
  };

  // 查看详情
  const handleViewDetail = (hotel: Hotel) => {
    if (!hotel.id) return;
    dispatch(openDetailDrawer(hotel.id));
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
            onChange={(value) => dispatch(setStatusFilter(value))}
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
            onSearch={(value) => dispatch(setSearchText(value))}
            onChange={(value) => dispatch(setSearchText(value))}
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
          dispatch(closeRejectModal());
        }}
        onSubmit={submitReject}
      />

      {/* 查看详情 */}
      <HotelDetailDrawer
        open={detailOpen}
        hotel={currentHotel}
        onClose={() => {
          dispatch(closeDetailDrawer());
        }}
      />
    </div>
  );
};

export default HotelAudit;
