// src/pages/HotelAudit/columns.tsx
import type { ColumnsType } from "antd/es/table";
import { Tag, Button, Space, Tooltip, message } from "antd";
import {
  EyeOutlined,
  CopyOutlined,
  VerticalAlignBottomOutlined,
  VerticalAlignTopOutlined,
} from "@ant-design/icons";

import type { Hotel } from "@/types/hotel";
import dayjs from "dayjs";
import { getFullAddress } from "@/utils/addressData";

// 将状态值映射为显示文本和颜色
const statusMap: Record<Hotel["status"], { text: string; color: string }> = {
  pending: { text: "待审核", color: "orange" },
  approved: { text: "已通过", color: "green" },
  rejected: { text: "已拒绝", color: "red" },
};

// 获取表格列配置
export const getColumns = (
  onApprove: (id: string) => void,
  onReject: (hotel: Hotel) => void,
  onOffline: (id: string) => void,
  onRestore: (id: string) => void,
  onViewDetail: (hotel: Hotel) => void,
): ColumnsType<Hotel> => [
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
    render: (name: string, record: Hotel) => (
      <div>
        <div>{name}</div>
        {record.nameEn && (
          <div style={{ color: "#888", fontSize: "12px" }}>{record.nameEn}</div>
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
    title: "详细地址",
    dataIndex: "address",
    width: 180,
    ellipsis: true,
  },
  {
    title: "星级",
    dataIndex: "star",
    width: 100,
    render: (star) => {
      if (star === undefined || star === null) {
        return <span style={{ color: "#999" }}>未设置</span>;
      }
      const starNum = Number(star);
      if (isNaN(starNum) || starNum < 1 || starNum > 5) {
        return <span style={{ color: "#999" }}>无效</span>;
      }
      return <span style={{ fontSize: "9px" }}>{"⭐".repeat(starNum)}</span>;
    },
  },
  {
    title: "状态",
    dataIndex: "status",
    width: 150,
    render: (status, record) => (
      <Space direction="vertical" size={4}>
        <Tag
          color={
            statusMap[status as keyof typeof statusMap]?.color || "default"
          }
        >
          {statusMap[status as keyof typeof statusMap]?.text || status}
        </Tag>
        {status === "approved" && (
          <Tag color={record.isActive ? "blue" : "gray"}>
            {record.isActive ? "已上线" : "已下线"}
          </Tag>
        )}
        {status === "rejected" && record.rejectReason && (
          <Tooltip title={record.rejectReason}>
            <div style={{ color: "#ff4d4f", fontSize: 12, cursor: "help" }}>
              拒绝原因
            </div>
          </Tooltip>
        )}
      </Space>
    ),
  },
  {
    title: "提交时间",
    dataIndex: "createTime",
    width: 180,
    render: (time) => (time ? dayjs(time).format("YYYY-MM-DD HH:mm:ss") : "-"),
    sorter: (a, b) => {
      return (
        new Date(a.createTime!).getTime() - new Date(b.createTime!).getTime()
      );
    },
  },
  {
    title: "操作",
    width: 200,
    fixed: "right",
    render: (_, record) => (
      <Space direction="vertical" size="middle">
        {/* 查看详情按钮 - 所有状态都显示 */}
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => onViewDetail(record)}
        >
          详情
        </Button>

        {/* 待审核状态：垂直排列通过和拒绝按钮 */}
        {record.status === "pending" && record.id && (
          <Space direction="horizontal" size="small">
            <Button
              type="link"
              size="small"
              onClick={() => onApprove(record.id!)}
            >
              通过
            </Button>
            <Button
              type="link"
              danger
              size="small"
              onClick={() => onReject(record)}
            >
              拒绝
            </Button>
          </Space>
        )}

        {/* 审核通过且已上线：显示下线按钮 */}
        {record.status === "approved" && record.isActive && record.id && (
          <Button
            type="link"
            danger
            size="small"
            icon={<VerticalAlignBottomOutlined />}
            onClick={() => onOffline(record.id!)}
          >
            下线
          </Button>
        )}

        {/* 审核通过但已下线：显示上线按钮 */}
        {record.status === "approved" && !record.isActive && record.id && (
          <Button
            type="link"
            size="small"
            icon={<VerticalAlignTopOutlined />}
            onClick={() => onRestore(record.id!)}
          >
            上线
          </Button>
        )}

        {/* 已拒绝状态：不显示任何操作按钮 */}
      </Space>
    ),
  },
];
