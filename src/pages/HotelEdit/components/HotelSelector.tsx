import React, { useState, useEffect } from "react";
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
  const [rawHotels, setRawHotels] = useState<Hotel[]>([]);
  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const data = await hotelService.getOnlineHotels();
      setRawHotels(data);
      const validOptions = data
        .filter((h) => h.id !== undefined)
        .map((h) => ({
          label: h.nameEn ? `${h.name} (${h.nameEn})` : h.name,
          value: h.id!,
          data: h,
        }));

      setOptions(validOptions);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchInitialData();
  }, []); //空数组代表只在加载时运行一次

  const handleSearch = (value: string) => {
    const keyword = value.toLowerCase().trim();

    const filtered = rawHotels
      .filter((h) => {
        if (h.id === undefined) return false;

        if (!keyword) return true;

        const name = h.name || "";
        const nameEn = h.nameEn || "";

        return name.includes(keyword) || nameEn.toLowerCase().includes(keyword);
      })
      .map((h) => ({
        label: h.nameEn ? `${h.name} (${h.nameEn})` : h.name,
        value: h.id!,
        data: h,
      }));

    setOptions(filtered);
  };

  const onSelect = async (option: any) => {
    try {
      const hotelData = option.data;

      if (!form) {
        message.error("表单未初始化");
        return;
      }

      const formattedData = {
        ...hotelData,
        star: hotelData.star.toString(),
        openingDate: hotelData.openingDate
          ? dayjs(hotelData.openingDate)
          : null,
        roomTypes: hotelData.roomTypes || [],
      };

      form.setFieldsValue(formattedData);

      message.success("已选择酒店，请继续填写其他信息");

      onAction({ type: "select", data: formattedData });
    } catch (error) {
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
        onSelect={(_, option) => onSelect(option)}
        loading={loading}
        options={options}
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
