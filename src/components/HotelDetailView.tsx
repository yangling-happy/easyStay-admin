import React from "react";
import { Descriptions, Tag, Space, Card, Typography, Image } from "antd";
const { Text } = Typography;

interface Props {
  data: any;
  type: "audit" | "list";
}

const HotelDetailView: React.FC<Props> = ({ data, type }) => {
  if (!data) return null;

  return (
    <Descriptions bordered column={1} size="small">
      <Descriptions.Item label="酒店名称">
        <Text strong>{data.name}</Text> {data.nameEn && `(${data.nameEn})`}
      </Descriptions.Item>

      <Descriptions.Item label="当前状态">
        {type === "list" ? (
          <Tag color={data.isActive ? "green" : "orange"}>
            {data.isActive ? "销售中" : "已下线"}
          </Tag>
        ) : (
          <Tag
            color={
              data.status === "approved"
                ? "green"
                : data.status === "rejected"
                  ? "red"
                  : "orange"
            }
          >
            {data.status === "approved"
              ? "已通过"
              : data.status === "rejected"
                ? "已拒绝"
                : "审核中"}
          </Tag>
        )}
      </Descriptions.Item>

      <Descriptions.Item label="酒店照片">
        <Space wrap>
          {data.photos?.map((p: any, i: number) => (
            <div key={i} style={{ textAlign: "center" }}>
              <Image
                width={100}
                height={100}
                src={p.url}
                style={{ objectFit: "cover", borderRadius: 4 }}
              />
              {p.isPrimary && (
                <div style={{ fontSize: "12px", color: "#1890ff" }}>封面图</div>
              )}
            </div>
          ))}
        </Space>
      </Descriptions.Item>

      <Descriptions.Item label="房型信息">
        {data.roomTypes?.map((room: any, i: number) => (
          <Card
            size="small"
            title={room.name}
            key={i}
            style={{ marginBottom: 8, background: "#fafafa" }}
          >
            <p>
              价格: ¥{room.price} | 库存: {room.stock}
            </p>
            <Space wrap>
              {room.photos?.map((rp: any, ri: number) => (
                <Image key={ri} width={60} src={rp.url} />
              ))}
            </Space>
          </Card>
        ))}
      </Descriptions.Item>
    </Descriptions>
  );
};

export default HotelDetailView;
