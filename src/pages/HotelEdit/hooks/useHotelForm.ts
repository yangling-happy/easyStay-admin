import { Form, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useEffect, useCallback } from "react";
import { hotelService } from "../../../api/services/hotelService";
import dayjs from "dayjs";

// 简单防抖函数
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const useHotelForm = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  //新增：保存表单数据到localStorage
  const saveFormData = useCallback(
    debounce((data: any) => {
      try {
        // 简单清理数据
        const cleanedData = Object.keys(data).reduce((acc, key) => {
          const value = data[key];
          // 只保存有值的字段
          if (value !== undefined && value !== null && value !== "") {
            if (Array.isArray(value)) {
              if (value.length > 0) acc[key] = value;
            } else {
              acc[key] = value;
            }
          }
          return acc;
        }, {} as any);

        localStorage.setItem(
          "hotel_edit_form_data",
          JSON.stringify(cleanedData),
        );
      } catch (error) {
        console.error("保存表单数据失败:", error);
      }
    }, 500), // 500ms防抖
    [],
  );

  // 组件加载时恢复数据
  useEffect(() => {
    const savedData = localStorage.getItem("hotel_edit_form_data");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.openingDate) {
          parsedData.openingDate = dayjs(parsedData.openingDate);
        }

        form.setFieldsValue(parsedData);
        console.log("✅ 已恢复表单数据");
      } catch (error) {
        console.error("恢复表单数据失败:", error);
      }
    }
  }, [form]);

  const handleSave = async () => {
    console.log("=== 开始保存 ===");

    try {
      // 1. 验证表单
      const values = await form.validateFields();

      // 2. 处理日期转换
      let openingDateStr = "";
      if (values.openingDate) {
        if (typeof values.openingDate.format === "function") {
          openingDateStr = values.openingDate.format("YYYY-MM-DD");
        } else if (typeof values.openingDate === "string") {
          openingDateStr = values.openingDate;
        }
      }

      // 3. 构建提交数据
      const payload = {
        ...values,
        name: values.name?.trim() || "",
        nameEn: values.nameEn?.trim() || "",
        address: values.address?.trim() || "",
        star:
          typeof values.star === "string"
            ? parseInt(values.star, 10)
            : values.star,
        id: values.id || Date.now().toString(),
        openingDate: openingDateStr,
        status: "pending" as const,
        ownerId: localStorage.getItem("userId") || "user_001",
        roomTypes: values.roomTypes || [],
        photos: values.photos || [],
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
        isActive: true,
        isDeleted: false,
      };

      console.log("提交数据:", payload);

      // 4. 提交到后端
      const savedHotel = await hotelService.saveHotel(payload);
      console.log("保存成功:", savedHotel);

      // 5. 获取真实酒店ID
      const hotelId = savedHotel?.id || payload.id;
      console.log("酒店ID:", hotelId);

      // 提交成功后清除本地数据
      localStorage.removeItem("hotel_edit_form_data");
      localStorage.removeItem("hotel_edit_current_step");

      // 6. 提示并跳转
      message.success(`提交成功！酒店编号: ${hotelId}`);

      // 等待1秒让用户看到消息，然后跳转
      setTimeout(() => {
        navigate(`/audit-status/${hotelId}`);
      }, 1000);

      return true;
    } catch (error: any) {
      console.error("保存失败:", error);

      if (error?.errorFields) {
        const firstError = error.errorFields[0];
        message.error(`请检查：${firstError.errors.join(", ")}`);
      } else {
        message.error("保存失败，请检查填写的信息");
      }

      return false;
    }
  };

  return {
    form,
    handleSave,
    saveFormData,
  };
};
