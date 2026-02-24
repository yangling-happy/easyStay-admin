import React, { useEffect, useState } from "react";
import { Table, Tag, Button, Modal, Input, message, Descriptions, Space, Card, Typography, Divider, Tooltip } from "antd";
import { EyeOutlined, MessageOutlined, ClockCircleOutlined, CopyOutlined } from "@ant-design/icons";
import axiosInstance from "../../../api/http/axiosConfig";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/zh-cn";

dayjs.extend(relativeTime);
dayjs.locale("zh-cn");

const { Text, Paragraph } = Typography;

interface FeedbackItem {
  id: string;
  hotelId: string;
  hotelName?: string;
  hotelNameEn?: string;
  ownerId: string;
  content: string;
  reply?: string;
  status: 'pending' | 'replied';
  createdAt: string;
  repliedAt?: string;
}

const FeedbackManager: React.FC = () => {
  const [list, setList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<FeedbackItem | null>(null);
  const [replyText, setReplyText] = useState("");

  // 从 content 中解析标题
  const extractTitle = (content: string): string => {
    const titleMatch = content.match(/【标题】(.+)/);
    if (titleMatch) {
      return titleMatch[1].trim();
    }
    // 如果没有标题，返回前50个字符
    return content.length > 50 ? content.substring(0, 50) + "..." : content;
  };

  // 从 content 中解析类型
  const extractType = (content: string): string => {
    const typeMatch = content.match(/【类型】(.+)/);
    if (typeMatch) {
      return typeMatch[1].trim();
    }
    return "其他";
  };

  // 从 content 中解析详细描述
  const extractDescription = (content: string): string => {
    const descMatch = content.match(/【详细描述】([\s\S]+)/);
    if (descMatch) {
      return descMatch[1].trim();
    }
    return "";
  };

  // 1. 加载所有反馈
  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/feedback/list");
      const data = res.data || res;
      setList(Array.isArray(data) ? data : []);
    } catch (err) {
      message.error("获取反馈列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  // 2. 提交回复
  const handleReplySubmit = async () => {
    if (!replyText.trim()) return message.warning("回复内容不能为空");
    if (!currentRecord) return;

    try {
      await axiosInstance.patch(`/feedback/${currentRecord.id}/reply`, {
        reply: replyText
      });
      message.success("回复成功！");
      setReplyModalOpen(false);
      setReplyText("");
      setCurrentRecord(null);
      fetchList(); // 刷新列表
    } catch (err) {
      message.error("回复失败");
    }
  };

  // 3. 查看详情
  const handleViewDetail = (record: FeedbackItem) => {
    setCurrentRecord(record);
    setDetailModalOpen(true);
  };

  const columns = [
    {
      title: "标题",
      dataIndex: "content",
      key: "title",
      width: 150,
      ellipsis: {
        showTitle: false,
      },
      render: (content: string) => (
        <Text strong style={{ color: "#1890ff" }}>
          {extractTitle(content)}
        </Text>
      ),
    },
    {
      title: "类型",
      dataIndex: "content",
      key: "type",
      width: 100,
      render: (content: string) => {
        const type = extractType(content);
        const colorMap: Record<string, string> = {
          "意见": "blue",
          "问题": "orange",
          "其他": "default",
        };
        return <Tag color={colorMap[type] || "default"}>{type}</Tag>;
      },
    },
    {
      title: "酒店编号",
      dataIndex: "hotelId",
      key: "hotelId",
      width: 120,
      render: (hotelId: string) => {
        const fullId = hotelId || "";
        const shortId = fullId ? fullId.slice(-6).toUpperCase() : "-";
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
                  message.success("编号已复制");
                }}
              />
            </Space>
          </Tooltip>
        );
      },
    },
    {
      title: "酒店名称",
      dataIndex: "hotelName",
      key: "hotelName",
      width: 200,
      ellipsis: true,
      render: (name: string, record: FeedbackItem) => (
        <div>
          <div>{name || "-"}</div>
          {record.hotelNameEn && (
            <div style={{ color: "#888", fontSize: "12px" }}>
              {record.hotelNameEn}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => (
        <Tag color={status === "pending" ? "orange" : "green"}>
          {status === "pending" ? "待处理" : "已回复"}
        </Tag>
      ),
    },
    {
      title: "提交时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (time: string) => (
        <Space>
          <ClockCircleOutlined />
          <span>{dayjs(time).format("YYYY-MM-DD HH:mm")}</span>
        </Space>
      ),
      sorter: (a: FeedbackItem, b: FeedbackItem) =>
        dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
    {
      title: "操作",
      key: "action",
      width: 200,
      fixed: "right" as const,
      render: (_: any, record: FeedbackItem) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            查看详情
          </Button>
          {record.status === "pending" && (
            <Button
              type="link"
              icon={<MessageOutlined />}
              onClick={() => {
                setCurrentRecord(record);
                setReplyModalOpen(true);
              }}
            >
              去回复
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: "#f0f2f5", minHeight: "100vh" }}>
      <Card
        title={
          <Space>
            <MessageOutlined />
            <span>反馈管理中心</span>
          </Space>
        }
        extra={
          <Button onClick={fetchList} loading={loading}>
            刷新
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={list}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条反馈`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 详情弹窗 */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            <span>反馈详情</span>
          </Space>
        }
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
          setCurrentRecord(null);
        }}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            关闭
          </Button>,
          currentRecord?.status === "pending" && (
            <Button
              key="reply"
              type="primary"
              icon={<MessageOutlined />}
              onClick={() => {
                setDetailModalOpen(false);
                setCurrentRecord(currentRecord);
                setReplyModalOpen(true);
              }}
            >
              去回复
            </Button>
          ),
        ].filter(Boolean)}
        width={700}
      >
        {currentRecord && (
          <div>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="反馈标题">
                <Text strong>{extractTitle(currentRecord.content)}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="反馈类型">
                <Tag color={extractType(currentRecord.content) === "意见" ? "blue" : "orange"}>
                  {extractType(currentRecord.content)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="关联酒店">
                <Space direction="vertical" size={0}>
                  {currentRecord.hotelName && (
                    <Text strong>{currentRecord.hotelName}</Text>
                  )}
                  {currentRecord.hotelNameEn && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {currentRecord.hotelNameEn}
                    </Text>
                  )}
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    ID: {currentRecord.hotelId}
                  </Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="反馈状态">
                <Tag color={currentRecord.status === "pending" ? "orange" : "green"}>
                  {currentRecord.status === "pending" ? "待处理" : "已回复"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="提交时间">
                {dayjs(currentRecord.createdAt).format("YYYY-MM-DD HH:mm:ss")}
              </Descriptions.Item>
              {currentRecord.repliedAt && (
                <Descriptions.Item label="回复时间">
                  {dayjs(currentRecord.repliedAt).format("YYYY-MM-DD HH:mm:ss")}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider>反馈内容</Divider>
            <Card size="small" style={{ backgroundColor: "#fafafa" }}>
              <Paragraph style={{ whiteSpace: "pre-wrap", margin: 0 }}>
                {currentRecord.content}
              </Paragraph>
            </Card>

            {extractDescription(currentRecord.content) && (
              <>
                <Divider>详细描述</Divider>
                <Card size="small" style={{ backgroundColor: "#fafafa" }}>
                  <Paragraph style={{ whiteSpace: "pre-wrap", margin: 0 }}>
                    {extractDescription(currentRecord.content)}
                  </Paragraph>
                </Card>
              </>
            )}

            {currentRecord.reply && (
              <>
                <Divider>管理员回复</Divider>
                <Card size="small" style={{ backgroundColor: "#e6f7ff", borderColor: "#1890ff" }}>
                  <Paragraph style={{ whiteSpace: "pre-wrap", margin: 0 }}>
                    {currentRecord.reply}
                  </Paragraph>
                </Card>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* 回复弹窗 */}
      <Modal
        title={
          <Space>
            <MessageOutlined />
            <span>回复商户反馈</span>
          </Space>
        }
        open={replyModalOpen}
        onOk={handleReplySubmit}
        onCancel={() => {
          setReplyModalOpen(false);
          setReplyText("");
          setCurrentRecord(null);
        }}
        okText="确认回复"
        cancelText="取消"
        width={600}
      >
        {currentRecord && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>反馈标题：</Text>
              <Text>{extractTitle(currentRecord.content)}</Text>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>反馈内容：</Text>
              <Card
                size="small"
                style={{
                  marginTop: 8,
                  backgroundColor: "#f5f5f5",
                  maxHeight: 150,
                  overflowY: "auto",
                }}
              >
                <Paragraph
                  style={{ whiteSpace: "pre-wrap", margin: 0, fontSize: "13px" }}
                >
                  {currentRecord.content}
                </Paragraph>
              </Card>
            </div>
            <div>
              <Text strong>回复内容：</Text>
              <Input.TextArea
                rows={6}
                placeholder="请输入回复内容..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                style={{ marginTop: 8 }}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FeedbackManager;