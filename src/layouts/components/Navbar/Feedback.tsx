import React, { useState } from "react";
import { QuestionCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Modal, Input, message, Select, Upload, Form } from "antd";

const Feedback: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form] = Form.useForm();

  const showModal = () => setIsModalOpen(true);

  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
  };

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        console.log("提交的数据:", values);
        message.success("提交成功！感谢您的反馈！");
        form.resetFields();
        setIsModalOpen(false);
      })
      .catch((info) => {
        console.log("校验失败:", info);
      });
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
        onOk={handleOk} // 点击确认触发校验提交
        onCancel={handleCancel}
        okText="提交"
        cancelText="取消"
        width={600}
      >
        <Form
          form={form} // 绑定遥控器
          layout="vertical" // 标签在输入框上方显示
        >
          {/* Form.Item 的 name 属性决定了数据提交时的键名 */}
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

          <Form.Item
            label="上传图片"
            name="files"
            valuePropName="fileList"
            getValueFromEvent={(e) => e?.fileList}
          >
            <Upload listType="picture-card" beforeUpload={() => false}>
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>上传</div>
              </div>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Feedback;
