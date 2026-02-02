// RoomTypeFormList.tsx 的修改方案
import React from 'react';
import { Input, InputNumber, Button, Space, Card, Divider, Form } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import PhotoUploader from './PhotoUploader'; // 导入 PhotoUploader

const RoomTypeFormList: React.FC = () => {
  return (
    <>
      <Divider orientation="left">房型与价格配置</Divider>
      
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
                {/* 基本信息部分 */}
                <Space direction="horizontal" size="large" wrap style={{ marginBottom: 16 }}>
                  <Form.Item
                    {...restField}
                    name={[name, 'name']}
                    label="房型名称"
                    rules={[{ required: true, message: '请输入房型名称，如：大床房' }]}
                  >
                    <Input placeholder="例如：豪华大床房" style={{ width: 200 }} />
                  </Form.Item>

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

                  <Form.Item
                    {...restField}
                    name={[name, 'stock']}
                    label="剩余库存"
                    rules={[{ required: true, message: '请输入库存' }]}
                  >
                    <InputNumber min={0} max={999} style={{ width: 120 }} />
                  </Form.Item>
                </Space>

                {/* 房型照片上传部分 */}
                <Form.Item
                  {...restField}
                  name={[name, 'photos']}
                  label="房型照片"
                  extra="最多上传 5 张房型专属照片，展示客房内部、设施等"
                  rules={[{ 
                    validator: (_, value) => {
                      //作为大图banner
                      if (!value || value.length === 0) {
                        return Promise.reject('请至少上传一张房型照片');
                      }
                      return Promise.resolve();
                    }
                  }]}
                >
                  <PhotoUploader maxCount={5} />
                </Form.Item>
              </Card>
            ))}

            <Form.Item>
              <Button
                type="dashed"
                onClick={() => add({
                  name: '',
                  price: 0,
                  stock: 0,
                  photos: [] // 默认空数组
                })}
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
    </>
  );
};

export default RoomTypeFormList;