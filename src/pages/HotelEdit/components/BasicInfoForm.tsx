import React from "react";
import {
  Input,
  Select,
  DatePicker,
  Space,
  Divider,
  Form,
  Cascader,
} from "antd";
import { cityOptions } from "../../../utils/addressData";
import PhotoUploader from "./PhotoUploader";
const BasicInfoForm: React.FC = () => {
  return (
    <>
      <Divider orientation="left">基本信息</Divider>
      <Space size="large" style={{ display: "flex" }}>
        <Form.Item
          name="name"
          label="酒店中文名"
          rules={[{ required: true, message: "请输入酒店中文名" }]}
        >
          <Input placeholder="输入酒店名称" />
        </Form.Item>
        <Form.Item
          name="nameEn"
          label="酒店英文名"
          rules={[{ required: true, message: "请输入酒店英文名" }]}
        >
          <Input placeholder="Hotel English Name" />
        </Form.Item>
      </Space>

      <Space size="large" align="start">
        <Form.Item
          name="location"
          label="所在地区"
          rules={[{ required: true, message: "请选择省市区" }]}
          style={{ width: 300 }}
        >
          <Cascader
            options={cityOptions}
            placeholder="请选择省/市/区"
            showSearch // 允许用户搜索，提升体验
          />
        </Form.Item>

        <Form.Item
          name="address"
          label="详细地址"
          rules={[{ required: true, message: "请输入详细地址" }]}
          style={{ width: 400 }}
        >
          <Input.TextArea placeholder="请输入街道、门牌号" autoSize />
        </Form.Item>
      </Space>

      <Space size="large">
        <Form.Item
          name="star"
          label="酒店星级"
          rules={[{ required: true, message: "请选择酒店星级" }]}
          style={{ width: 200 }}
        >
          <Select
            placeholder="请选择星级"
            options={[
              { value: "1", label: "一星级/基础" },
              { value: "2", label: "二星级/普通" },
              { value: "3", label: "三星级/舒适" },
              { value: "4", label: "四星级/高档" },
              { value: "5", label: "五星级/豪华" },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="openingDate"
          label="开业时间"
          rules={[{ required: true, message: "请选择开业时间" }]}
        >
          <DatePicker style={{ width: 200 }} format="YYYY-MM-DD" />
        </Form.Item>
      </Space>
      <Form.Item
        name="photos"
        label="酒店整体照片"
        extra="建议上传 3-8 张大堂或外景图"
      >
        <PhotoUploader maxCount={8} />
      </Form.Item>
      <Divider orientation="left">扩展信息 (可选)</Divider>
      <Form.Item name="nearbyInfo" label="周边景点/交通">
        <Input.TextArea placeholder="如：距离外滩 500 米" />
      </Form.Item>
    </>
  );
};

export default BasicInfoForm;
