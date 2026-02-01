import React, { useState } from "react";
import { Select, Divider, Button, Empty, Typography } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { hotelService } from "../../../api/services/hotelService";
import type { Hotel } from "../../../types/hotel";

interface Props {
  form: any;
  onAction: () => void; // 无论选择还是新增，执行后的回调（如跳到下一步）
}

const HotelSelector: React.FC<Props> = ({ form, onAction }) => {
  const [options, setOptions] = useState<
    { label: string; value: string; data: Hotel }[]
  >([]);

  // 搜索酒店逻辑
  const handleSearch = (value: string) => {
    if (value) {
      const hotels = hotelService.getHotels();
      // 模糊匹配名称
      const filtered = hotels
        .filter(
          (h) =>
            h.name.includes(value) ||
            h.nameEn.toLowerCase().includes(value.toLowerCase()),
        )
        .map((h) => ({
          label: `${h.name} (${h.nameEn})`,
          value: h.id,
          data: h,
        }));
      setOptions(filtered);
    } else {
      setOptions([]);
    }
  };

  // 选择酒店（认领）
  const onSelect = (option: any) => {
    const hotelData = option.data;
    // 关键点：将查到的数据回填到主表单中
    form.setFieldsValue({
      ...hotelData,
      // 注意：DatePicker 需要的是 dayjs 对象，如果存的是字符串需要转换
      // openingDate: dayjs(hotelData.openingDate)
    });
    onAction();
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
        defaultActiveFirstOption={false}
        suffixIcon={<SearchOutlined />}
        filterOption={false}
        onSearch={handleSearch}
        onSelect={onSelect}
        options={options}
        notFoundContent={
          <Empty description="未找到相关酒店">
            <Button
              type="primary"
              ghost
              icon={<PlusOutlined />}
              onClick={onAction}
            >
              立即注册新酒店
            </Button>
          </Empty>
        }
      />

      <Divider>或者</Divider>

      <Button type="link" icon={<PlusOutlined />} onClick={onAction}>
        没有搜到？直接开始创建新酒店
      </Button>
    </div>
  );
};

export default HotelSelector;
