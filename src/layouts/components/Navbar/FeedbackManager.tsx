import React, { useEffect, useState } from "react";
import { Table, Tag, Button, Modal, Input, message } from "antd";
import axiosInstance from "../../../api/http/axiosConfig";
import { feedbackService } from "../../../api/services/feedbackService";
const FeedbackManager: React.FC = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<any>(null);
  const [replyText, setReplyText] = useState("");

  // 1. 加载所有反馈
  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/feedback/list");
      // 注意：根据你的拦截器配置，这里可能直接是 res.data
      setList(res.data || res);
    } catch (err) {
      message.error("获取反馈列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); }, []);

  // 2. 提交回复
  const handleReplySubmit = async () => {
    if (!replyText.trim()) return message.warning("回复内容不能为空");

    try {
      await axiosInstance.patch(`/feedback/${currentRecord.id}/reply`, {
        reply: replyText
      });
      message.success("回复成功！");
      setReplyModalOpen(false);
      setReplyText("");
      fetchList(); // 刷新列表
    } catch (err) {
      message.error("回复失败");
    }
  };

  const columns = [
    { title: "酒店ID", dataIndex: "hotelId", key: "hotelId" },
    { title: "反馈内容", dataIndex: "content", key: "content", ellipsis: true },
    {
      title: "状态",
      dataIndex: "status",
      render: (status: string) => (
        <Tag color={status === "pending" ? "orange" : "green"}>
          {status === "pending" ? "待处理" : "已回复"}
        </Tag>
      )
    },
    {
      title: "操作",
      render: (record: any) => (
        <Button
          type="link"
          disabled={record.status === "replied"}
          onClick={() => {
            setCurrentRecord(record);
            setReplyModalOpen(true);
          }}
        >
          {record.status === "replied" ? "已完成" : "去回复"}
        </Button>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>反馈管理中心</h2>
      <Table columns={columns} dataSource={list} rowKey="id" loading={loading} />

      <Modal
        title="回复商户反馈"
        open={replyModalOpen}
        onOk={handleReplySubmit}
        onCancel={() => setReplyModalOpen(false)}
      >
        <div style={{ marginBottom: 16 }}>
          <strong>商户描述：</strong>
          <pre style={{ background: "#f5f5f5", padding: 8 }}>{currentRecord?.content}</pre>
        </div>
        <Input.TextArea
          rows={4}
          placeholder="请输入回复内容..."
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default FeedbackManager;