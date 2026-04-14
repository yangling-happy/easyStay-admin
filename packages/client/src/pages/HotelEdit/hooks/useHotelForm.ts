import { Form, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useEffect, useCallback, useState } from "react";
import { hotelService } from "../../../api/services/hotelService";
import dayjs from "dayjs";
import { getAuditFieldsByEvent } from "../../../store/hotelAuditFsm";

type UseHotelFormOptions = {
  routeHotelId?: string;
};

const buildDraftKey = (id?: string | number | null) =>
  `hotel_edit_form_data_${id ?? "new"}`;
const buildStepKey = (id?: string | number | null) =>
  `hotel_edit_current_step_${id ?? "new"}`;

const debounce = (func: Function, wait: number) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const useHotelForm = (options?: UseHotelFormOptions) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const routeHotelId = options?.routeHotelId;

  const resolveDraftKey = (data?: any) => {
    const dataId = data?.id ?? routeHotelId;
    return buildDraftKey(
      dataId !== undefined && dataId !== null && dataId !== "" ? dataId : "new",
    );
  };

  const clearDraftKeys = (data?: any) => {
    try {
      const dataId = data?.id ?? routeHotelId;
      localStorage.removeItem("hotel_edit_form_data");
      localStorage.removeItem("hotel_edit_current_step");
      localStorage.removeItem(resolveDraftKey(data));
      localStorage.removeItem(buildStepKey(dataId ?? "new"));
    } catch (error) {
      console.error("清理草稿缓存失败:", error);
    }
  };
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
          resolveDraftKey(cleanedData),
          JSON.stringify(cleanedData),
        );
      } catch (error) {
        console.error("保存表单数据失败:", error);
      }
    }, 500),
    [routeHotelId],
  );

  useEffect(() => {
    const loadSavedData = () => {
      const preferredKey = buildDraftKey(
        routeHotelId !== undefined &&
          routeHotelId !== null &&
          routeHotelId !== ""
          ? routeHotelId
          : "new",
      );
      const scopedData = localStorage.getItem(preferredKey);
      if (scopedData) {
        return scopedData;
      }

      const legacyData = localStorage.getItem("hotel_edit_form_data");
      if (!legacyData) return null;

      try {
        const parsedLegacy = JSON.parse(legacyData);
        if (routeHotelId) {
          if (parsedLegacy?.id?.toString?.() !== routeHotelId) {
            return null;
          }
        }
        return legacyData;
      } catch (error) {
        console.error("解析旧草稿数据失败:", error);
        return null;
      }
    };

    const savedData = loadSavedData();
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
  }, [form, routeHotelId]);

  /**
   * 验证数据完整性
   */
  const validateCompleteness = (values: any) => {
    const missingFields: string[] = [];

    // 基础信息验证
    if (!values.name?.trim()) missingFields.push("酒店中文名");
    if (!values.nameEn?.trim()) missingFields.push("酒店英文名");
    if (!values.address?.trim()) missingFields.push("详细地址");
    if (!values.phone?.trim()) missingFields.push("联系电话");
    if (!values.openingDate) missingFields.push("开业时间");
    if (!values.star) missingFields.push("酒店星级");
    if (!values.location || values.location.length < 2) {
      missingFields.push("所在地区");
    }

    // 照片验证
    if (!values.photos || values.photos.length === 0) {
      missingFields.push("酒店照片");
    }

    // 房型验证（业务要求：每个酒店必须有房型）
    if (!values.roomTypes || values.roomTypes.length === 0) {
      missingFields.push("房型配置");
    } else {
      // 检查每个房型是否有照片
      const roomsWithoutPhotos = values.roomTypes.filter(
        (room: any) => !room.photos || room.photos.length === 0,
      );
      if (roomsWithoutPhotos.length > 0) {
        missingFields.push("房型照片");
      }
    }

    return {
      isValid: missingFields.length === 0,
      missingFields,
    };
  };

  /**
   * 构建提交数据
   */
  const buildPayload = (values: any, auditFields: any) => {
    let openingDateStr = "";
    if (values.openingDate) {
      openingDateStr =
        typeof values.openingDate.format === "function"
          ? values.openingDate.format("YYYY-MM-DD")
          : values.openingDate;
    }

    const normalizedStar =
      values.star === "" || values.star === undefined || values.star === null
        ? undefined
        : typeof values.star === "string"
          ? parseInt(values.star, 10)
          : values.star;

    const isUpdate =
      values.id !== undefined && values.id !== null && values.id !== "";

    const payload: any = {
      ...values,
      name: values.name?.trim() || "",
      nameEn: values.nameEn?.trim() || "",
      address: values.address?.trim() || "",
      phone: values.phone?.trim() || "",
      location: values.location || [],
      amenities: values.amenities || [],
      star: normalizedStar,
      openingDate: openingDateStr,
      status: auditFields.status,
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
      isActive: auditFields.isActive,
      isDeleted: false,
      isIncomplete: auditFields.isIncomplete,
      completionStatus: auditFields.completionStatus,
      rejectReason: auditFields.rejectReason,
    };

    if (!isUpdate) {
      payload.createTime = new Date().toISOString();
    }

    // 修复：version 可能是 0，使用 !== undefined 而不是 truthy check
    if (values.version !== undefined && values.version !== null) {
      payload.version = values.version;
    }

    return payload;
  };

  /**
   * 保存草稿
   * 最低要求：酒店名称
   * 适用于第二步和第三步
   */
  const handleSaveDraft = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // 获取所有表单数据（不强制验证）
      const allValues = form.getFieldsValue();

      // 最低要求：酒店名称
      if (!allValues.name?.trim()) {
        message.error("请至少填写酒店名称");
        return false;
      }

      const auditFields = getAuditFieldsByEvent(allValues, {
        type: "MARK_INCOMPLETE",
        completionStatus: "draft",
      });
      const payload = buildPayload(allValues, auditFields);

      const isUpdate = allValues.id;
      let res;
      let hotelId;

      if (isUpdate) {
        res = await hotelService.updateHotel(allValues.id, payload);
        hotelId = allValues.id;
      } else {
        res = await hotelService.saveHotel(payload);
        hotelId = (res as any)?.data?.id;
      }

      if (hotelId) {
        // 关键修复：更新表单中的 id 和 version，确保下次保存时使用最新的 version
        const updatedHotel = (res as any)?.data || res;
        const newVersion = updatedHotel?.version;

        const updatedFields: any = { id: hotelId };
        if (newVersion !== undefined && newVersion !== null) {
          updatedFields.version = newVersion;
        }

        form.setFieldsValue(updatedFields);
        saveFormData({ ...allValues, ...updatedFields });
      }

      message.success("草稿已保存，您可以随时继续编辑");
      return true;
    } catch (error: any) {
      console.error("保存草稿失败:", error);
      // 改善错误提示
      if (error.response?.status === 409) {
        message.error("数据已被更新，正在刷新页面...");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        message.error(
          error.response?.data?.message || error.message || "保存草稿失败",
        );
      }
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 提交审核
   * 严格验证所有必填项
   */
  const handleSubmitForReview = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // 验证所有字段
      const values = await form.validateFields();

      // 完整性验证
      const validationResult = validateCompleteness(values);
      if (!validationResult.isValid) {
        // 标记为信息不全并保存
        const auditFields = getAuditFieldsByEvent(values, {
          type: "MARK_INCOMPLETE",
          completionStatus: "incomplete",
        });
        const payload = buildPayload(values, auditFields);

        if (values.id) {
          await hotelService.updateHotel(values.id, payload);
        } else {
          await hotelService.saveHotel(payload);
        }

        message.warning({
          content: `信息不完整，已保存但无法提交审核。缺少：${validationResult.missingFields.join("、")}`,
          duration: 5,
        });

        // 跳转到待完善列表
        setTimeout(() => {
          navigate("/hotels/incomplete?status=incomplete");
        }, 1500);

        return false;
      }

      // 信息完整，提交审核
      const auditFields = getAuditFieldsByEvent(values, {
        type: "SUBMIT_FOR_REVIEW",
      });
      const payload = buildPayload(values, auditFields);

      let res;
      let hotelId;

      if (values.id) {
        res = await hotelService.updateHotel(values.id, payload);
        hotelId = values.id;
      } else {
        res = await hotelService.saveHotel(payload);
        hotelId = (res as any)?.data?.id;
      }

      if (!hotelId) {
        throw new Error("后端未返回有效的酒店 ID");
      }

      // 可选：更新 version 以防用户取消跳转后继续编辑
      const updatedHotel = (res as any)?.data || res;
      const newVersion = updatedHotel?.version;
      if (newVersion !== undefined && newVersion !== null) {
        form.setFieldsValue({ version: newVersion });
      }

      clearDraftKeys(values);

      message.success("提交成功！酒店信息已提交审核");

      setTimeout(() => {
        navigate(`/audit-status/${hotelId}`);
      }, 1000);

      return true;
    } catch (error: any) {
      console.error("提交失败:", error);
      if (error?.response?.status === 409) {
        message.error("数据已被更新，正在刷新页面...");
        setTimeout(() => window.location.reload(), 1500);
      } else if (error?.errorFields) {
        message.error(`请检查：${error.errorFields[0].errors.join(", ")}`);
      } else {
        message.error(
          error.response?.data?.message ||
            error.message ||
            "提交失败，请检查填写的信息",
        );
      }
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 兼容旧的 handleSave 方法
   */
  const handleSave = async () => {
    if (isSubmitting) return; // 如果正在提交，直接返回
    setIsSubmitting(true); // 设置为正在提交状态
    try {
      const values = await form.validateFields();

      let openingDateStr = "";
      if (values.openingDate) {
        openingDateStr =
          typeof values.openingDate.format === "function"
            ? values.openingDate.format("YYYY-MM-DD")
            : values.openingDate;
      }

      const isUpdate =
        values.id !== undefined && values.id !== null && values.id !== "";

      const auditFields = getAuditFieldsByEvent(
        values,
        isUpdate
          ? { type: "SUBMIT_FOR_REVIEW" }
          : {
              type: "MARK_INCOMPLETE",
              completionStatus: "draft",
            },
      );

      const payload = buildPayload(
        { ...values, openingDate: openingDateStr },
        auditFields,
      );

      if (values.version !== undefined && values.version !== null) {
        payload.version = values.version;
      }

      let res;
      let hotelId;

      if (isUpdate) {
        res = await hotelService.updateHotel(values.id, payload);
        hotelId = values.id;
      } else {
        res = await hotelService.saveHotel(payload);
        hotelId = (res as any)?.data?.id;
      }

      if (!hotelId) {
        throw new Error("后端未返回有效的酒店 ID");
      }

      // 更新 version 以防用户取消跳转后继续编辑
      const updatedHotel = (res as any)?.data || res;
      const newVersion = updatedHotel?.version;
      if (newVersion !== undefined && newVersion !== null) {
        form.setFieldsValue({ version: newVersion });
      }

      clearDraftKeys(values);

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
        message.error("数据已被更新，正在刷新页面...");
        setTimeout(() => window.location.reload(), 1500);
      } else if (error?.errorFields) {
        message.error(`请检查：${error.errorFields[0].errors.join(", ")}`);
      } else {
        message.error(
          error.response?.data?.message ||
            error.message ||
            "保存失败，请检查填写的信息",
        );
      }
      return false;
    } finally {
      setIsSubmitting(false); // 无论成功或失败都重置状态
    }
  };

  return {
    form,
    handleSave, // 兼容旧代码
    handleSaveDraft, // 保存草稿
    handleSubmitForReview, // 提交审核
    saveFormData,
    isSubmitting,
  };
};
