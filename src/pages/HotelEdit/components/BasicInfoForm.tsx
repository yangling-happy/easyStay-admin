import React from "react";
import { Form, Input, Select, DatePicker, Space, Divider } from "antd";

const BasicInfoForm: React.FC<{ form: any }> = ({ form }) => {
  return (
    <Form form={form} layout="vertical">
      <Divider orientation="left">基本信息</Divider>
      <Space size="large" style={{ display: "flex" }}>
        <Form.Item name="name" label="酒店中文名" rules={[{ required: true }]}>
          <Input placeholder="输入酒店名称" />
        </Form.Item>
        <Form.Item
          name="nameEn"
          label="酒店英文名"
          rules={[{ required: true }]}
        >
          <Input placeholder="Hotel English Name" />
        </Form.Item>
      </Space>

      <Form.Item name="address" label="酒店地址" rules={[{ required: true }]}>
        <Input.TextArea placeholder="请输入详细地址" />
      </Form.Item>

      <Space size="large">
        <Form.Item
          name="star"
          label="酒店星级"
          rules={[{ required: true }]}
          style={{ width: 200 }}
        >
          <Select
            options={[
              { value: 5, label: "五星级/豪华" },
              { value: 4, label: "四星级/高档" },
              { value: 3, label: "三星级/舒适" },
            ]}
          />
        </Form.Item>
        <Form.Item
          name="openingDate"
          label="开业时间"
          rules={[{ required: true }]}
        >
          <DatePicker style={{ width: 200 }} />
        </Form.Item>
      </Space>

      <Divider orientation="left">扩展信息 (可选)</Divider>
      <Form.Item name="nearbyInfo" label="周边景点/交通">
        <Input.TextArea placeholder="如：距离外滩 500 米" />
      </Form.Item>
    </Form>
  );
};

export default BasicInfoForm;
