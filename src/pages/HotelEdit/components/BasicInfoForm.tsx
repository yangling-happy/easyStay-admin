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
export const BASIC_INFO_FIELDS = [
  "name",
  "nameEn",
  "location",
  "address",
  "phone",
  "openingDate",
  "star",
  "photos",
  "amenities",
];
interface Props {
  form?: any;
}
const BasicInfoForm: React.FC<Props> = () => {
  return (
    <>
      {/* 隐藏字段：保存 id 和 version */}
      <Form.Item name="id" noStyle>
        <Input type="hidden" />
      </Form.Item>
      <Form.Item name="version" noStyle>
        <Input type="hidden" />
      </Form.Item>

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
        >
          <Cascader
            options={cityOptions}
            placeholder="请选择省/市/区"
            showSearch
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
          name="phone"
          label="联系电话"
          rules={[
            { required: true, message: "请输入联系电话" },
            { pattern: /^[0-9+-\s()]+$/, message: "请输入有效的电话号码" },
          ]}
        >
          <Input
            placeholder="如：021-12345678 或 138..."
            style={{ width: 200 }}
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
        rules={[{ required: true, message: "请至少上传一张照片" }]}
      >
        <PhotoUploader maxCount={8} />
      </Form.Item>
      <Form.Item name="amenities" label="酒店设施">
        <Select
          mode="tags"
          style={{ width: "100%" }}
          placeholder="请选择或输入酒店设施"
          options={[
            { value: "WiFi", label: "WiFi" },
            { value: "Parking", label: "停车场" },
            { value: "Breakfast", label: "早餐" },
            { value: "Family", label: "亲子友好" },
            { value: "Gym", label: "健身房" },
            { value: "Pool", label: "泳池" },
            { value: "Pets", label: "可带宠物" },
            { value: "Airport", label: "机场接送" },
          ]}
        />
      </Form.Item>
    </>
  );
};

export default BasicInfoForm;
