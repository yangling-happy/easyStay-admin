import React from 'react';
import { Form, Input, InputNumber, Button, Space, Card, Divider } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const RoomTypeFormList: React.FC<{ form: any }> = ({ form }) => {
  return (
    // 注意：name="roomTypes" 必须和你的 Hotel 接口定义一致
    <Form form={form} layout="vertical" autoComplete="off">
      <Divider orientation="left">房型与价格配置 (P0)</Divider>
      
      <Form.List 
        name="roomTypes"
        rules={[
          {
            validator: async (_, names) => {
              if (!names || names.length < 1) {
                return Promise.reject(new Error('至少需要添加一种房型'));
              }
            },
          },
        ]}
      >
        {(fields, { add, remove }, { errors }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Card 
                size="small" 
                key={key} 
                style={{ marginBottom: 16, backgroundColor: '#fafafa' }}
                title={`房型项目 ${name + 1}`}
                extra={
                  <DeleteOutlined 
                    className="dynamic-delete-button" 
                    onClick={() => remove(name)} 
                    style={{ color: '#ff4d4f' }}
                  />
                }
              >
                <Space direction="horizontal" size="large" wrap>
                  {/* 房型名称 */}
                  <Form.Item
                    {...restField}
                    name={[name, 'name']}
                    label="房型名称"
                    rules={[{ required: true, message: '请输入房型名称，如：大床房' }]}
                  >
                    <Input placeholder="例如：豪华大床房" style={{ width: 200 }} />
                  </Form.Item>

                  {/* 价格 */}
                  <Form.Item
                    {...restField}
                    name={[name, 'price']}
                    label="每晚价格 (元)"
                    rules={[{ required: true, message: '请输入价格' }]}
                  >
                    <InputNumber
                      min={0}
                      formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      style={{ width: 150 }}
                    />
                  </Form.Item>

                  {/* 库存 */}
                  <Form.Item
                    {...restField}
                    name={[name, 'stock']}
                    label="剩余库存"
                    rules={[{ required: true, message: '请输入库存' }]}
                  >
                    <InputNumber min={0} max={999} style={{ width: 120 }} />
                  </Form.Item>
                </Space>
              </Card>
            ))}

            <Form.Item>
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
                style={{ height: 45 }}
              >
                新增房型种类
              </Button>
              <Form.ErrorList errors={errors} />
            </Form.Item>
          </>
        )}
      </Form.List>
    </Form>
  );
};

export default RoomTypeFormList;