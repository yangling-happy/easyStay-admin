import { useState, useEffect } from "react";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectOptionsData {
  amenities: SelectOption[];
  bedTypes: SelectOption[];
  roomTags: SelectOption[];
  customOptions?: Record<string, SelectOption[]>;
}

const DEFAULT_OPTIONS: SelectOptionsData = {
  amenities: [
    { value: "WiFi", label: "WiFi" },
    { value: "Parking", label: "停车场" },
    { value: "Breakfast", label: "早餐" },
    { value: "Family", label: "亲子友好" },
    { value: "Gym", label: "健身房" },
    { value: "Pool", label: "泳池" },
    { value: "Pets", label: "可带宠物" },
    { value: "Airport", label: "机场接送" },
  ],
  bedTypes: [
    { value: "big", label: "1.8m 大床" },
    { value: "double", label: "1.2m 双床" },
    { value: "king", label: "2.0m 超大床" },
  ],
  roomTags: [
    { value: "breakfast", label: "含早餐" },
    { value: "cancel", label: "免费取消" },
    { value: "window", label: "有窗" },
    { value: "bathroom", label: "独立卫浴" },
    { value: "wifi", label: "免费WiFi" },
  ],
};

export const useSelectOptions = () => {
  const [options, setOptions] = useState<SelectOptionsData>(DEFAULT_OPTIONS);

  useEffect(() => {
    const savedOptions = localStorage.getItem("select_options_data");
    if (savedOptions) {
      try {
        const parsed = JSON.parse(savedOptions);
        setOptions(parsed);
      } catch (error) {
        console.error("加载选项数据失败:", error);
      }
    }
  }, []);

  const updateOptions = (newOptions: Partial<SelectOptionsData>) => {
    const updatedOptions = { ...options, ...newOptions };
    setOptions(updatedOptions);
    localStorage.setItem("select_options_data", JSON.stringify(updatedOptions));
  };

  const importFromExcel = (excelData: any[]) => {
    const newOptions: SelectOptionsData = { ...DEFAULT_OPTIONS };

    excelData.forEach((row) => {
      const { 选项类型, 选项值, 选项标签 } = row;

      if (!选项类型 || !选项值) return;

      const option: SelectOption = {
        value: String(选项值),
        label: 选项标签 || String(选项值),
      };

      switch (选项类型) {
        case "酒店设施":
          if (!newOptions.amenities.find((o) => o.value === option.value)) {
            newOptions.amenities.push(option);
          }
          break;
        case "床型":
          if (!newOptions.bedTypes.find((o) => o.value === option.value)) {
            newOptions.bedTypes.push(option);
          }
          break;
        case "配套权益":
          if (!newOptions.roomTags.find((o) => o.value === option.value)) {
            newOptions.roomTags.push(option);
          }
          break;
        default:
          if (!newOptions.customOptions) {
            newOptions.customOptions = {};
          }
          if (!newOptions.customOptions[选项类型]) {
            newOptions.customOptions[选项类型] = [];
          }
          if (
            !newOptions.customOptions[选项类型].find(
              (o: SelectOption) => o.value === option.value,
            )
          ) {
            newOptions.customOptions[选项类型].push(option);
          }
          break;
      }
    });

    updateOptions(newOptions);
    return newOptions;
  };

  const resetToDefault = () => {
    setOptions(DEFAULT_OPTIONS);
    localStorage.removeItem("select_options_data");
  };

  const getOptions = (type: keyof SelectOptionsData): SelectOption[] => {
    const option = options[type];
    return Array.isArray(option) ? option : [];
  };

  return {
    options,
    updateOptions,
    importFromExcel,
    resetToDefault,
    getOptions,
  };
};
