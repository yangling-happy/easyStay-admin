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

      console.log("📝 表单值 (values):", values);
      console.log("🔍 检查 ID:", values.id);
      console.log("🔍 检查 version:", values.version);

      let openingDateStr = "";
      if (values.openingDate) {
        openingDateStr =
          typeof values.openingDate.format === "function"
            ? values.openingDate.format("YYYY-MM-DD")
            : values.openingDate;
      }

      const isUpdate =
        values.id !== undefined && values.id !== null && values.id !== "";

      console.log("🔄 操作类型:", isUpdate ? "UPDATE (更新)" : "CREATE (创建)");

      const payload: any = {
        ...values,
        name: values.name?.trim() || "",
        nameEn: values.nameEn?.trim() || "",
        address: values.address?.trim() || "",
        phone: values.phone?.trim() || "",
        location: values.location || [],
        amenities: values.amenities || [],
        star:
          typeof values.star === "string"
            ? parseInt(values.star, 10)
            : values.star,
        openingDate: openingDateStr,
        status: "pending" as const,
        ownerId: localStorage.getItem("userId") || "user_001",
        roomTypes: (values.roomTypes || []).map((room: any) => ({
          name: room.name?.trim() || "",
          price: room.price || 0,
          stock: room.stock || 0,
          capacity: room.capacity !== undefined ? room.capacity : null,
          bedType: room.bedType || "",
          tags: room.tags || [],
          photos: room.photos || [],
        })),
        photos: values.photos || [],
        updateTime: new Date().toISOString(),
        isActive: true,
        isDeleted: false,
      };

      if (!isUpdate) {
        payload.createTime = new Date().toISOString();
      } else if (values.version) {
        payload.version = values.version;
      }

      console.log("📤 请求数据 (payload):", payload);

      let res;
      let hotelId;

      if (isUpdate) {
        console.log("📡 调用 updateHotel API, ID:", values.id);
        res = await hotelService.updateHotel(values.id, payload);
        hotelId = values.id;
      } else {
        console.log("📡 调用 saveHotel API (创建新酒店)");
        res = await hotelService.saveHotel(payload);
        hotelId = (res as any)?.data?.id;
      }

      console.log("✅ 后端返回响应:", res);

      if (!hotelId) {
        throw new Error("后端未返回有效的酒店 ID");
      }

      localStorage.removeItem("hotel_edit_form_data");
      localStorage.removeItem("hotel_edit_current_step");

      message.success(
        isUpdate
          ? "更新成功！酒店信息已提交审核"
          : `提交成功！酒店编号: ${hotelId}`,
      );

      setTimeout(() => {
        navigate(`/audit-status/${hotelId}`);
      }, 1000);

      return true;
    } catch (error: any) {
      console.error("保存失败:", error);
      if (error?.response?.status === 409) {
        message.error("数据已被其他用户修改，请刷新页面后重试");
      } else if (error?.errorFields) {
        message.error(`请检查：${error.errorFields[0].errors.join(", ")}`);
      } else {
        message.error(error.message || "保存失败，请检查填写的信息");
      }
      return false;
    }
  };

  return { form, handleSave, saveFormData };
};
