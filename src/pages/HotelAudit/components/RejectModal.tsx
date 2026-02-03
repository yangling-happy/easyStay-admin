// src/pages/HotelAudit/components/RejectModal.tsx
import { Modal, Form, Input, message } from 'antd'

interface Props {
  open: boolean    //弹窗显示 or 隐藏
  onCancel: () => void   //关闭模态框的回调函数
  onSubmit: (reason: string) => void   //提交拒绝原因的回调函数
}

// 拒绝模态框组件
const RejectModal = ({ open, onCancel, onSubmit }: Props) => {
  const [form] = Form.useForm()   // 创建表单实例

  const handleOk = async () => {   // 确认按钮点击处理
    try {
      const values = await form.validateFields()   // 表单验证
      onSubmit(values.reason)
      form.resetFields()   // 重置表单
    } catch (error) {
      message.error('请填写拒绝原因')   // 验证失败，显示错误信息
    }
  }

  const handleCancel = () => {   // 取消按钮点击处理
    form.resetFields()   // 重置表单  
    onCancel()   // 调用关闭回调函数
  }

  return (
    <Modal   // 模态框组件
      title="拒绝酒店审核"
      open={open}   // 是否显示
      onOk={handleOk}   // 确认按钮 点击处理
      onCancel={handleCancel}   // 取消 按钮点击处理
      okText="确认拒绝"   // 确认按钮文本
      cancelText="取消"   // 取消按钮文本
      okButtonProps={{ danger: true }}   // 确认按钮样式
    >
      <Form form={form} layout="vertical">   // 表单组件
        <Form.Item
          label="拒绝原因"   // 标签文本
          name="reason"   // 表单项名称
          rules={[
            { required: true, message: '请输入拒绝原因' },   // 必填项，显示错误信息
            { min: 10, message: '拒绝原因至少10个字符' }   // 最小长度，显示错误信息
          ]}
        >
          <Input.TextArea  // 文本域组件
            rows={4} 
            placeholder="请输入拒绝原因，此原因将显示给商户（至少10个字符）" 
            showCount
            maxLength={200}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default RejectModal