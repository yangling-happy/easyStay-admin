import { Modal, Form, Input } from 'antd'

interface Props {
  open: boolean
  onCancel: () => void
  onSubmit: (reason: string) => void
}

const RejectModal = ({ open, onCancel, onSubmit }: Props) => {
  const [form] = Form.useForm()

  const handleOk = async () => {
    const values = await form.validateFields()
    onSubmit(values.reason)
    form.resetFields()
  }

  return (
    <Modal
      title="拒绝酒店审核"
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      okText="确认拒绝"
      cancelText="取消"
    >
      <Form form={form}>
        <Form.Item
          label="拒绝原因"
          name="reason"
          rules={[{ required: true, message: '请输入拒绝原因' }]}
        >
          <Input.TextArea rows={4} placeholder="请输入拒绝原因" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default RejectModal
