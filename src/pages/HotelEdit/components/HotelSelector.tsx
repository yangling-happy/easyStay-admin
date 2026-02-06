import React, { useState } from "react";
import { Select, Divider, Button, Empty, Typography, message } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { hotelService } from "../../../api/services/hotelService";
import type { Hotel } from "../../../types/hotel";
import dayjs from "dayjs";

interface Props {
  form: any;
  onAction: (hotelData?: any) => void;
}

const HotelSelector: React.FC<Props> = ({ form, onAction }) => {
  const [options, setOptions] = useState<
    { label: string; value: string; data: Hotel }[]
  >([]);
  const [loading, setLoading] = useState(false);

  // 搜索酒店逻辑
  const handleSearch = async (value: string) => {
    if (!value.trim()) {
      setOptions([]);
      return;
    }

    setLoading(true);
    try {
      // 1. 只获取已经审核通过并上线的酒店
      const onlineHotels = await hotelService.getOnlineHotels();

      // 2. 在这些酒店里进行名称匹配
      const filtered = onlineHotels
        .filter(
          (h) =>
            h.name.includes(value) ||
            h.nameEn?.toLowerCase().includes(value.toLowerCase()),
        )
        .map((h) => ({
          label: `${h.name} (${h.nameEn})`,
          value: h.id ?? "",
          data: h, // 挂载原始数据供 onSelect 使用
        }));

      setOptions(filtered);
    } catch (error) {
      message.error("搜索已上线酒店失败");
    } finally {
      setLoading(false);
    }
  };
  // 选择酒店（认领）
  const onSelect = async (option: any) => {
    try {
      const hotelData = option.data;

      if (!form) {
        message.error("表单未初始化");
        return;
      }

      // 转换数据格式
      const formattedData = {
        ...hotelData,
        // 关键：star 转为字符串
        star: hotelData.star.toString(),
        openingDate: hotelData.openingDate
          ? dayjs(hotelData.openingDate)
          : null,
        // 确保 roomTypes 存在
        roomTypes: hotelData.roomTypes || [],
      };

      console.log("设置表单数据:", formattedData);

      // 设置表单值
      form.setFieldsValue(formattedData);

      // 立即验证
      const currentValues = form.getFieldsValue();
      console.log("设置后的表单值:", currentValues);

      message.success("已选择酒店，请继续填写其他信息");

      // 传递给父组件
      onAction({ type: "select", data: formattedData });
    } catch (error) {
      console.error("选择酒店失败:", error);
      message.error("选择失败");
    }
  };

  // 创建新酒店
  const handleCreateNew = () => {
    // 重置表单
    form.resetFields();
    // 设置默认值
    form.setFieldsValue({
      star: "3", // 默认三星级
      roomTypes: [],
    });
    onAction({ type: "create" });
    message.info("开始创建新酒店");
  };

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "0 auto",
        textAlign: "center",
        padding: "40px 0",
      }}
    >
      <Typography.Title level={4}>首先，寻找您的酒店</Typography.Title>
      <Typography.Paragraph type="secondary">
        搜索系统内已有的酒店进行认领，或点击下方按钮注册新酒店
      </Typography.Paragraph>

      <Select
        showSearch
        size="large"
        placeholder="输入酒店名称搜索..."
        style={{ width: "100%" }}
        suffixIcon={<SearchOutlined />}
        filterOption={false}
        onSearch={handleSearch}
        // 关键修改：antd 的 onSelect 第二个参数才是我们存了 data 的那个对象
        onSelect={(_, option) => onSelect(option)}
        loading={loading}
        options={options}
        // 建议加上这个，选中后清空搜索文字，干净利落
        searchValue={undefined}
        notFoundContent={
          <Empty description={loading ? "搜索中..." : "未找到相关酒店"}>
            <Button
              type="primary"
              ghost
              icon={<PlusOutlined />}
              onClick={handleCreateNew}
              loading={loading}
            >
              立即注册新酒店
            </Button>
          </Empty>
        }
      />

      <Divider>或者</Divider>

      <Button type="link" icon={<PlusOutlined />} onClick={handleCreateNew}>
        没有搜到？直接开始创建新酒店
      </Button>
    </div>
  );
};

export default HotelSelector;
