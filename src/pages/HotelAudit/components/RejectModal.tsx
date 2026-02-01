// src/pages/HotelAudit/components/RejectModal.tsx
import { Modal, Form, Input, message } from 'antd'

interface Props {
  open: boolean
  onCancel: () => void
  onSubmit: (reason: string) => void
}

const RejectModal = ({ open, onCancel, onSubmit }: Props) => {
  const [form] = Form.useForm()

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      onSubmit(values.reason)
      form.resetFields()
    } catch (error) {
      message.error('请填写拒绝原因')
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onCancel()
  }

  return (
    <Modal
      title="拒绝酒店审核"
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="确认拒绝"
      cancelText="取消"
      okButtonProps={{ danger: true }}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="拒绝原因"
          name="reason"
          rules={[
            { required: true, message: '请输入拒绝原因' },
            { min: 10, message: '拒绝原因至少10个字符' }
          ]}
        >
          <Input.TextArea 
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