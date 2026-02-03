// src/pages/HotelEdit/hooks/useHotelForm.ts
import { Form, message } from "antd";
import { useNavigate } from "react-router-dom"; // 只需要这个
import { hotelService } from "../../../api/services/hotelService";

export const useHotelForm = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate(); // 获取路由跳转函数
  
  const handleSave = async () => {
    console.log('=== 开始保存 ===');
    
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
        name: values.name?.trim() || '',
        nameEn: values.nameEn?.trim() || '',
        address: values.address?.trim() || '',
        star: typeof values.star === 'string' ? parseInt(values.star, 10) : values.star,
        id: values.id || Date.now().toString(), // 临时ID
        openingDate: openingDateStr,
        status: "pending" as const,
        ownerId: localStorage.getItem("userId") || "user_001",
        roomTypes: values.roomTypes || [],
        photos: values.photos || [], // 添加照片
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
        isActive: true,
        isDeleted: false,
      };

      console.log('提交数据:', payload);
      
      // 4. 提交到后端
      const savedHotel = await hotelService.saveHotel(payload);
      console.log('保存成功:', savedHotel);
      
      // 5. 获取真实酒店ID
      const hotelId = savedHotel?.id || payload.id;
      console.log('酒店ID:', hotelId);
      
      // 6. 提示并跳转
      message.success(`提交成功！酒店编号: ${hotelId}`);
      
      // 等待1秒让用户看到消息，然后跳转
      setTimeout(() => {
        navigate(`/audit-status/${hotelId}`); // 跳转到审核页面
      }, 1000);
      
      return true;
      
    } catch (error: any) {
      console.error("保存失败:", error);
      
      if (error?.errorFields) {
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