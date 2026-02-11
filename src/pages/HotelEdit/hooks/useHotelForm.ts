import { Form, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useEffect, useCallback } from "react";
import { hotelService } from "../../../api/services/hotelService";
import dayjs from "dayjs";

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

  const saveFormData = useCallback(
    debounce((data: any) => {
      try {
        const cleanedData = Object.keys(data).reduce((acc, key) => {
          const value = data[key];
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
    }, 500),
    [],
  );

  useEffect(() => {
    const savedData = localStorage.getItem("hotel_edit_form_data");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.openingDate) {
          parsedData.openingDate = dayjs(parsedData.openingDate);
        }
        form.setFieldsValue(parsedData);
      } catch (error) {
        console.error("恢复表单数据失败:", error);
      }
    }
  }, [form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      let openingDateStr = "";
      if (values.openingDate) {
        openingDateStr =
          typeof values.openingDate.format === "function"
            ? values.openingDate.format("YYYY-MM-DD")
            : values.openingDate;
      }

      const payload = {
        ...values,
        name: values.name?.trim() || "",
        nameEn: values.nameEn?.trim() || "",
        address: values.address?.trim() || "",
        star:
          typeof values.star === "string"
            ? parseInt(values.star, 10)
            : values.star,
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

      const res = await hotelService.saveHotel(payload);

      const hotelId = (res as any)?.data?.id;

      if (!hotelId) {
        throw new Error("后端未返回有效的酒店 ID");
      }

      localStorage.removeItem("hotel_edit_form_data");
      localStorage.removeItem("hotel_edit_current_step");

      message.success(`提交成功！酒店编号: ${hotelId}`);

      setTimeout(() => {
        navigate(`/audit-status/${hotelId}`);
      }, 1000);

      return true;
    } catch (error: any) {
      console.error("保存失败:", error);
      if (error?.errorFields) {
        message.error(`请检查：${error.errorFields[0].errors.join(", ")}`);
      } else {
        message.error(error.message || "保存失败，请检查填写的信息");
      }
      return false;
    }
  };

  return { form, handleSave, saveFormData };
};
