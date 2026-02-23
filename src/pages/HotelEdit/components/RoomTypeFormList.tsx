import React from "react";
import {
  Input,
  InputNumber,
  Button,
  Space,
  Card,
  Divider,
  Form,
  Select,
  Checkbox,
  Row,
  Col,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import PhotoUploader from "./PhotoUploader";

export const ROOM_TYPE_FIELD = "roomTypes";

export const ROOM_TYPE_FIELDS = [
  ["roomTypes", "name"],
  ["roomTypes", "price"],
  ["roomTypes", "stock"],
  ["roomTypes", "capacity"],
  ["roomTypes", "bedType"],
  ["roomTypes", "photos"],
];
const RoomTypeFormList: React.FC = () => {
  return (
    <>
      <Divider orientation="left" style={{ marginTop: 40 }}>
        房型与价格配置
      </Divider>

      <Form.List
        name="roomTypes"
        rules={[
          {
            validator: async (_, names) => {
              if (!names || names.length < 1) {
                return Promise.reject(new Error("至少需要添加一种房型"));
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
                style={{
                  marginBottom: 24,
                  border: "1px solid #f0f0f0",
                  borderRadius: 8,
                }}
                title={
                  <span style={{ fontSize: 14 }}>
                    房型项目{" "}
                    <strong style={{ color: "#1890ff" }}>{name + 1}</strong>
                  </span>
                }
                extra={
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => remove(name)}
                  >
                    删除
                  </Button>
                }
              >
                {/* 1. 基础物理规格区：使用 Row/Col 保证对齐 */}
                <Row gutter={[16, 0]}>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      {...restField}
                      name={[name, "name"]}
                      label="房型名称"
                      rules={[{ required: true, message: "如：豪华大床房" }]}
                    >
                      <Input placeholder="例如：豪华大床房" />
                    </Form.Item>
                  </Col>

                  <Col xs={12} sm={6} md={4}>
                    <Form.Item
                      {...restField}
                      name={[name, "price"]}
                      label="每晚价格"
                      rules={[
                        { required: true, message: "请输入每晚价格" },
                        {
                          validator: (_, value) => {
                            if (
                              value === null ||
                              value === undefined ||
                              value === ""
                            ) {
                              return Promise.reject("价格不能为空");
                            }
                            if (isNaN(value) || value < 0) {
                              return Promise.reject("请输入有效的正数价格");
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <InputNumber
                        min={0}
                        prefix="¥"
                        style={{ width: "100%" }}
                        placeholder="请输入价格"
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={12} sm={6} md={4}>
                    <Form.Item
                      {...restField}
                      name={[name, "stock"]}
                      label="剩余库存"
                      rules={[{ required: true, message: "必填" }]}
                    >
                      <InputNumber
                        min={0}
                        max={999}
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={12} sm={12} md={4}>
                    <Form.Item
                      {...restField}
                      name={[name, "capacity"]}
                      label="标准入住"
                      rules={[{ required: true }]}
                    >
                      <Select placeholder="人数">
                        <Select.Option value={1}>1人</Select.Option>
                        <Select.Option value={2}>2人</Select.Option>
                        <Select.Option value={3}>3人</Select.Option>
                        <Select.Option value={4}>4人及以上</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col xs={12} sm={12} md={4}>
                    <Form.Item
                      {...restField}
                      name={[name, "bedType"]}
                      label="床型"
                      rules={[{ required: true }]}
                    >
                      <Select placeholder="选择床型">
                        <Select.Option value="big">1.8m 大床</Select.Option>
                        <Select.Option value="double">1.2m 双床</Select.Option>
                        <Select.Option value="king">2.0m 超大床</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                {/* 2. 权益勾选区：独占一行 */}
                <Form.Item
                  {...restField}
                  name={[name, "tags"]}
                  label="配套权益"
                  style={{ marginBottom: 12 }}
                >
                  <Checkbox.Group>
                    <Space direction="horizontal" wrap>
                      <Checkbox value="breakfast">含早餐</Checkbox>
                      <Checkbox value="cancel">免费取消</Checkbox>
                      <Checkbox value="window">有窗</Checkbox>
                      <Checkbox value="bathroom">独立卫浴</Checkbox>
                      <Checkbox value="wifi">免费WiFi</Checkbox>
                    </Space>
                  </Checkbox.Group>
                </Form.Item>

                {/* 3. 照片上传区 */}
                <Form.Item
                  {...restField}
                  name={[name, "photos"]}
                  label="房型照片"
                  extra="建议上传 3-5 张，展示客房细节、卫浴等"
                  rules={[{ required: true, message: "请至少上传一张照片" }]}
                >
                  <PhotoUploader maxCount={5} />
                </Form.Item>
              </Card>
            ))}

            <Form.Item>
              <Button
                type="dashed"
                onClick={() =>
                  add({
                    name: "",
                    price: undefined,
                    stock: 10,
                    capacity: 2,
                    bedType: "big",
                    tags: ["wifi", "cancel"],
                    photos: [],
                  })
                }
                block
                icon={<PlusOutlined />}
                style={{ height: 50, borderRadius: 8 }}
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
