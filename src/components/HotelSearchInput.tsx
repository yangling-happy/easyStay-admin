// src/components/HotelSearchInput.tsx
import React from "react";
import { Input } from "antd";

const { Search } = Input;

interface HotelSearchInputProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  onChange: (value: string) => void;
  style?: React.CSSProperties;
}

const HotelSearchInput: React.FC<HotelSearchInputProps> = ({
  placeholder = "搜索酒店名称或编号",
  onSearch,
  onChange,
  style,
}) => {
  return (
    <Search
      placeholder={placeholder}
      allowClear
      onSearch={onSearch}
      onChange={(e) => onChange(e.target.value)}
      style={style}
    />
  );
};

export default HotelSearchInput;