import { Form, message } from "antd";
import { hotelService } from "../../../api/services/hotelService";

export const useHotelForm = () => {
  const [form] = Form.useForm();
  
  const handleSave = async () => {
    console.log('=== 开始 handleSave ===');
    
    try {
      // 1. 验证所有字段
      console.log('1. 开始验证表单...');
      const values = await form.validateFields();
      console.log('2. 验证通过的值:', values);
      
      // 2. 处理数据转换
      let openingDateStr = "";
      if (values.openingDate) {
        if (typeof values.openingDate.format === "function") {
          openingDateStr = values.openingDate.format("YYYY-MM-DD");
        } else if (typeof values.openingDate === "string") {
          openingDateStr = values.openingDate;
        }
      }
      
      // 3. 构建 payload，注意类型转换
      const payload = {
        ...values,
        // 确保字段存在且有值
        name: values.name?.trim() || '',
        nameEn: values.nameEn?.trim() || '',
        address: values.address?.trim() || '',
        // star 需要从字符串转为数字
        star: typeof values.star === 'string' ? parseInt(values.star, 10) : values.star,
        
        // 其他字段
        id: values.id || Date.now().toString(),
        openingDate: openingDateStr,
        status: "pending" as const,
        ownerId: localStorage.getItem("userId") || "user_001",
        roomTypes: values.roomTypes || [],
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
        isActive: true,
        isDeleted: false,
      };

      console.log('3. 最终提交的数据:', payload);
      
      // 4. 提交数据
      await hotelService.saveHotel(payload);
      message.success("保存成功！已进入审核流程");
      return true;
      
    } catch (error: any) {
      console.error("=== 保存酒店失败详情 ===");
      console.error("错误类型:", error?.constructor?.name);
      console.error("错误消息:", error?.message);
      console.error("完整错误:", error);
      
      if (error?.errorFields) {
        console.error("表单验证错误字段:", error.errorFields);
        const firstError = error.errorFields[0];
        message.error(`请检查：${firstError.errors.join(', ')}`);
      } else {
        message.error("保存失败，请检查填写的信息");
      }
      
      return false;
    }
  };

  return { form, handleSave };
};