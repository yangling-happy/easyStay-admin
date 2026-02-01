import { Form, message } from 'antd';
import { hotelService } from '../../../api/services/hotelService';

export const useHotelForm = () => {
  const [form] = Form.useForm();

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      // 转换日期格式再保存
      const payload = {
        ...values,
        id: values.id || Date.now().toString(),
        openingDate: values.openingDate?.format('YYYY-MM-DD'),
        status: 'pending',
      };
      hotelService.saveHotel(payload);
      message.success('保存成功！已进入审核流程');
      return true;
    } catch (error) {
      return false;
    }
  };

  return { form, handleSave };
};