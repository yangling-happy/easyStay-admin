import React, { useState, useEffect } from "react";
import { QuestionCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Modal, Input, message, Select, Upload, Form, Image } from "antd";
import axiosInstance from "../../../api/http/axiosConfig"; // 引入统一封装的 axios

const Feedback: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [hotels, setHotels] = useState<{ id: string; name: string }[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const fetchMyHotels = async () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return;

    try {
      const user = JSON.parse(userStr);
      const res: any = await axiosInstance.get(`/hotels/owner/${user.id}`);

      if (res.success) {
        setHotels(res.data);
      }
    } catch (err) {
      console.error("加载酒店失败", err);
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      fetchMyHotels();
    }
  }, [isModalOpen]);

  const showModal = () => setIsModalOpen(true);
  const handlePreview = (file: any) => {
    const src = file.url ?? file.thumbUrl ??
      (file.originFileObj ? URL.createObjectURL(file.originFileObj) : "");
    setPreviewImage(src);
    setPreviewOpen(true);
  };
  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
  };

  const handleOk = async () => {
    try {
      // 1. 校验表单
      const values = await form.validateFields();

      // 2. 获取当前登录用户（商户）
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        message.error("请先登录后再提交反馈");
        return;
      }

      let user: { id: string } | null = null;
      try {
        user = JSON.parse(userStr);
      } catch (e) {
        console.error("解析本地用户信息失败:", e);
        message.error("用户信息异常，请重新登录");
        return;
      }

      if (!user?.id) {
        message.error("用户信息缺失，请重新登录");
        return;
      }

      const ownerId = user.id as string;

      // 3. 组装 content 文本（后端只需要一个 content 字段）
      const { type, title, description, hotelId } = values;

      const contentLines: string[] = [];
      contentLines.push(`【类型】${type === "bug" ? "意见" : type === "ui" ? "问题" : "其他"}`);
      contentLines.push(`【标题】${title}`);
      if (description) {
        contentLines.push(`【详细描述】${description}`);
      }
      const content = contentLines.join("\n");

      if (!hotelId) {
        message.error("请填写或选择关联酒店 ID（后端当前要求必填）");
        return;
      }

      setSubmitting(true);
      const res = (await axiosInstance.post("/feedback", {
        hotelId,
        ownerId,
        content,
        // notificationId: 可选字段，这里不需要就先不传
      })) as {
        success: boolean;
        message?: string;
        data?: any;
      };
      // 4. 调用后端反馈接口
      if (res.success) {
        message.success("提交成功！感谢您的反馈！");
        form.resetFields();
        setIsModalOpen(false);
      } else {
        message.error(res.message || "提交失败，请稍后重试");
      }
    } catch (err: any) {
      if (err?.errorFields) {
        // 表单校验错误，不提示接口错误
        return;
      }
      console.error("提交反馈出错:", err);
      message.error(err?.message || "提交失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="navbar-item" onClick={showModal}>
        <QuestionCircleOutlined style={{ fontSize: "18px" }} />
        <span style={{ marginLeft: "8px" }}>意见/问题反馈</span>
      </div>

      <Modal
        title="意见/问题反馈"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="提交"
        cancelText="取消"
        width={600}
        confirmLoading={submitting}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="选择关联酒店"
            name="hotelId"
            rules={[{ required: true, message: "请选择需要反馈的酒店" }]}
          >
            <Select
              placeholder="请选择您的酒店"
              showSearch
              optionFilterProp="label"
              options={hotels.map(h => ({
                value: h.id,
                label: h.name
              }))}
            />
          </Form.Item>
          <Form.Item
            label="反馈类型"
            name="type"
            rules={[{ required: true, message: "请选择反馈类型！" }]}
          >
            <Select
              placeholder="请选择反馈类型"
              options={[
                { value: "bug", label: "意见" },
                { value: "ui", label: "问题" },
                { value: "other", label: "其他" },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="反馈标题"
            name="title"
            rules={[{ required: true, message: "请输入标题！" }]}
          >
            <Input placeholder="请简要描述问题" />
          </Form.Item>

          <Form.Item label="详细描述" name="description">
            <Input.TextArea rows={4} placeholder="请详细描述您遇到的问题..." />
          </Form.Item>

          {/* 目前后端 Feedback 表还不支持图片，这里只是本地上传预览，不会发到后端 */}
          <Form.Item
            label="上传图片（可选，仅本地预览）"
            name="files"
            valuePropName="fileList"
            getValueFromEvent={(e) => e?.fileList}
          >
            <Upload
              listType="picture-card"
              beforeUpload={() => false}
              onPreview={handlePreview}
              maxCount={5}
              accept="image/jpeg,image/png,image/webp"
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>上传</div>
              </div>
            </Upload>
          </Form.Item>
        </Form>
        <Image
          wrapperStyle={{ display: "none" }}
          src={previewImage}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            src: previewImage,
          }}
        />
      </Modal>
    </>
  );
};

export default Feedback;