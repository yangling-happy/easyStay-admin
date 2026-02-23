import React, { useEffect, useState } from "react";
import { BellOutlined } from "@ant-design/icons";
import {
  Popover,
  Badge,
  List,
  Typography,
  Empty,
  Modal,
  Descriptions,
  Tag,
  Divider,
  Spin,
  Alert,
} from "antd";
import {
  notificationService,
  type Notification,
} from "../../../api/services/notificationService";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/zh-cn";

dayjs.extend(relativeTime);
dayjs.locale("zh-cn");

const { Text } = Typography;

const Notice: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [feedbackDetail, setFeedbackDetail] = useState<{
    id: string;
    content: string;
    reply?: string;
    status: string;
    createdAt: string;
    repliedAt?: string;
  } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [markAllLoading, setMarkAllLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications({
        page: 1,
        pageSize: 100,
      });
      if (res.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (error) {
      console.error("获取通知失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    setMarkAllLoading(true);
    try {
      const res = await notificationService.markAllAsRead();
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, status: "read" as const })),
        );
        setUnreadCount(0);
        // 重新获取通知以确保数据一致
        fetchNotifications();
      }
    } catch (error) {
      console.error("全部标记已读失败:", error);
    } finally {
      setMarkAllLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // 每30秒刷新一次通知
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      // 更新本地状态
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, status: "read" as const } : n,
        ),
      );
      // 重新获取通知以确保未读计数准确
      fetchNotifications();
    } catch (error) {
      console.error("标记已读失败:", error);
    }
  };

  // ✅ 新增：处理点击通知查看详情
  const handleNotificationClick = async (item: Notification) => {
    // 如果是未读，先标记为已读
    if (item.status === "unread") {
      handleMarkAsRead(item.id);
    }
    // 打开详情弹窗
    setSelectedNotification(item);
    setDetailModalVisible(true);
    setFeedbackDetail(null); // 重置反馈详情

    // ✅ 如果是反馈回复类型，获取关联的反馈详情
    if (item.type === "feedback_reply" && item.relatedId) {
      setDetailLoading(true);
      try {
        const res = await notificationService.getNotificationDetail(item.id);
        if (res.success && res.data.relatedFeedback) {
          setFeedbackDetail(res.data.relatedFeedback);
        }
      } catch (error) {
        console.error("获取反馈详情失败:", error);
      } finally {
        setDetailLoading(false);
      }
    }
  };

  // ✅ 获取通知类型标签
  const getTypeTag = (type: string) => {
    const typeMap: Record<string, { color: string; text: string }> = {
      audit_result: { color: "blue", text: "审核结果" },
      feedback_reply: { color: "green", text: "反馈回复" },
      system: { color: "orange", text: "系统通知" },
    };
    const typeInfo = typeMap[type] || { color: "default", text: type };
    return <Tag color={typeInfo.color}>{typeInfo.text}</Tag>;
  };

  const content = (
    <div style={{ width: 300 }}>
      <div
        style={{
          padding: "8px 12px",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontWeight: 500 }}>全部通知</span>
        {unreadCount > 0 && (
          <span
            style={{
              color: "#1677ff",
              cursor: "pointer",
              fontSize: "12px",
            }}
            onClick={handleMarkAllAsRead}
          >
            {markAllLoading ? "处理中..." : "全部已读"}
          </span>
        )}
      </div>
      <List
        style={{ maxHeight: 360, overflowY: "auto" }}
        loading={loading}
        dataSource={notifications}
        locale={{ emptyText: <Empty description="暂无通知" /> }}
        renderItem={(item) => (
          <List.Item
            style={{
              cursor: "pointer",
              backgroundColor:
                item.status === "unread" ? "#f0f7ff" : "transparent",
            }}
            onClick={() => handleNotificationClick(item)}
          >
            <List.Item.Meta
              title={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Text strong={item.status === "unread"}>{item.message}</Text>
                  {item.status === "unread" && <Badge dot color="red" />}
                </div>
              }
              description={dayjs(item.createdAt).fromNow()}
            />
          </List.Item>
        )}
        footer={
          <div
            style={{ textAlign: "center", cursor: "pointer", color: "#1677ff" }}
          >
            —— 没有更多通知了 ——
          </div>
        }
      />
    </div>
  );

  return (
    <>
      <Popover
        content={content}
        title="消息通知"
        trigger="click"
        placement="bottomRight"
        onOpenChange={(open) => {
          if (open) {
            fetchNotifications();
          }
        }}
      >
        <div className="navbar-item">
          <Badge count={unreadCount} offset={[-2, 4]}>
            <BellOutlined style={{ fontSize: "18px" }} />
          </Badge>
          <span style={{ marginLeft: "8px" }}>消息通知</span>
        </div>
      </Popover>

      {/* 通知详情弹窗 */}
      <Modal
        title="通知详情"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedNotification(null);
        }}
        footer={null}
        width={600}
      >
        {selectedNotification && (
          <div>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="通知类型">
                {getTypeTag(selectedNotification.type)}
              </Descriptions.Item>
              {selectedNotification.hotelName && (
                <Descriptions.Item label="关联酒店">
                  {selectedNotification.hotelName}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="通知内容">
                <Text>{selectedNotification.message}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="通知状态">
                <Tag
                  color={
                    selectedNotification.status === "unread" ? "red" : "green"
                  }
                >
                  {selectedNotification.status === "unread" ? "未读" : "已读"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {dayjs(selectedNotification.createdAt).format(
                  "YYYY-MM-DD HH:mm:ss",
                )}
              </Descriptions.Item>
              <Descriptions.Item label="更新时间">
                {dayjs(selectedNotification.updatedAt).format(
                  "YYYY-MM-DD HH:mm:ss",
                )}
              </Descriptions.Item>
            </Descriptions>

            {/* 如果是反馈回复类型，显示完整的反馈信息 */}
            {selectedNotification.type === "feedback_reply" &&
              selectedNotification.relatedId && (
                <>
                  <Divider>反馈回复详情</Divider>
                  {detailLoading ? (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                      <Spin />
                    </div>
                  ) : feedbackDetail ? (
                    <Descriptions column={1} bordered size="small">
                      <Descriptions.Item label="回复内容">
                        <div
                          style={{
                            padding: "12px",
                            backgroundColor: "#f5f5f5",
                            borderRadius: "4px",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                        >
                          <Text>{feedbackDetail.reply}</Text>
                        </div>
                      </Descriptions.Item>

                      {feedbackDetail.repliedAt && (
                        <Descriptions.Item label="回复时间">
                          {dayjs(feedbackDetail.repliedAt).format(
                            "YYYY-MM-DD HH:mm:ss",
                          )}
                        </Descriptions.Item>
                      )}
                      <Descriptions.Item label="反馈时间">
                        {dayjs(feedbackDetail.createdAt).format(
                          "YYYY-MM-DD HH:mm:ss",
                        )}
                      </Descriptions.Item>
                    </Descriptions>
                  ) : (
                    <Alert
                      message="无法获取反馈详情"
                      description="反馈信息可能已被删除"
                      type="warning"
                      showIcon
                    />
                  )}
                </>
              )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default Notice;
