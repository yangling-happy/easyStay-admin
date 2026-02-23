import React, { useState, useMemo } from "react";
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
  Select,
} from "antd";
import { useNavigate } from "react-router-dom";
import {
  EditOutlined,
  EyeOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { hotelService } from "@/api/services/hotelService";
import { useActiveHotels } from "./hooks/useActiveHotels";
import HotelDetailView from "@/components/HotelDetailView";
import { getFullAddress } from "@/utils/addressData";
import { formatDateTime } from "@/utils/dateUtils";
import HotelSearchInput from "@/components/HotelSearchInput";
import { filterHotelsByKeyword } from "@/utils/filterHotelsByKeyword.";
const { Text } = Typography;

const HotelList: React.FC = () => {
  const navigate = useNavigate();

  // 直接从 Hook 获取数据和刷新方法
  const { activeHotels, loading, refresh } = useActiveHotels();

  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const showDetail = (record: any) => {
    setSelectedHotel(record);
    setIsDetailVisible(true);
  };

  const filteredHotels = useMemo(() => {
    let result: any[] = [...activeHotels];

    // 关键词搜索
    result = filterHotelsByKeyword(result, searchText);

    // 状态筛选
    if (statusFilter !== "all") {
      result = result.filter((hotel) =>
        statusFilter === "active" ? hotel.isActive : !hotel.isActive,
      );
    }

    return result;
  }, [activeHotels, searchText, statusFilter]);
  // --- 处理上下线逻辑 ---
  const handleToggle = (record: any) => {
    const hotelId = record._id || record.id;

    if (record.isActive) {
      Modal.confirm({
        title: "确定要下线该酒店吗？",
        content: "下线后旅客将无法预订。",
        okText: "确认下线",
        okButtonProps: { danger: true },
        onOk: async () => {
          try {
            await hotelService.offlineHotel(hotelId);
            message.success("酒店已下线");
            refresh(); // 刷新数据
          } catch (error: any) {
            message.error("下线失败");
          }
        },
      });
    } else {
      if (record.status === "approved") {
        Modal.confirm({
          title: "恢复上线",
          content: "确认恢复上线吗？恢复后酒店将立即开放预订。",
          okText: "确认上线",
          onOk: async () => {
            try {
              await hotelService.onlineHotel(hotelId);
              message.success("酒店已恢复上线");
              refresh();
            } catch (error: any) {
              message.error(error.response?.data?.message || "上线失败");
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
              await fetch(`/api/hotels/${hotelId}/re-apply`, {
                method: "POST",
              });
              message.success("申请已提交，请关注审核记录");
              refresh();
            } catch (error: any) {
              message.error("提交失败");
            }
          },
        });
      }
    }
  };

  const handleEdit = (record: any) => {
    Modal.confirm({
      title: "修改确认",
      icon: <ExclamationCircleOutlined />,
      content:
        "修改酒店关键信息后，系统将撤回当前在线状态并重新发起审核。确定要修改吗？",
      okText: "去修改",
      onOk: () => {
        navigate(`/hotels/edit/${record._id || record.id}`);
      },
    });
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
      title: "地区",
      key: "location",
      width: 200,
      render: (_: unknown, record: any) => {
        return getFullAddress(record.location) || "未设置";
      },
    },
    {
      title: "当前状态",
      key: "isActive",
      width: 180,
      render: (_: unknown, record: any) => (
        <Space>
          <Tooltip
            title={record.isActive ? "点击下线该酒店" : "点击申请恢复上线"}
          >
            <Switch
              checked={record.isActive}
              onChange={() => handleToggle(record)}
              size="small"
            />
          </Tooltip>
          <Tag color={record.isActive ? "green" : "orange"}>
            {record.isActive ? "销售中" : "已下线/待重审"}
          </Tag>
        </Space>
      ),
    },
    {
      title: "最后核准日期",
      key: "updateTime",
      width: 160,
      render: (_: unknown, record: any) => {
        const date = record.updateTime || record.updatedAt;
        return formatDateTime(date);
      },
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
            onClick={() => showDetail(record)}
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
            <span style={{ fontSize: "18px", fontWeight: 600 }}>
              酒店列表管理
            </span>
            <Tag color="cyan" style={{ fontSize: "14px", padding: "0 8px" }}>
              共 {filteredHotels.length} 家
            </Tag>
          </Space>
        }
        extra={
          <Space>
            {/* 状态筛选 */}
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 120 }}
              options={[
                { value: "all", label: "全部" },
                { value: "active", label: "已上线" },
                { value: "inactive", label: "已下线" },
              ]}
            />
            {/* 搜索组件 */}
            <HotelSearchInput
              placeholder="搜索酒店名称或编号"
              onSearch={(value) => setSearchText(value)}
              onChange={(value) => setSearchText(value)}
              style={{ width: 300 }}
            />
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={refresh}
              loading={loading}
            >
              同步数据
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredHotels} // 使用过滤后的数据
          rowKey={(record) => record._id || record.id}
          loading={loading}
          pagination={{ pageSize: 8 }}
          footer={() => (
            <div style={{ padding: "8px 0" }}>
              <Text
                strong
                type="secondary"
                style={{ fontSize: "14px", color: "#555" }}
              >
                *
                注：所有涉及“修改”或“恢复上线”的操作均需经过平台管理方二次人工审核。
              </Text>
            </div>
          )}
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

export default HotelList;
