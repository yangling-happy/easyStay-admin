import React from "react";
import {
  Descriptions,
  Tag,
  Space,
  Card,
  Typography,
  Image,
  Divider,
  Timeline,
} from "antd";
import { getFullAddress } from "../utils/addressData";
import { formatDateTime } from "../utils/dateUtils";
const { Text } = Typography;

interface Props {
  data: any;
  type: "audit" | "list";
}

const HotelDetailView: React.FC<Props> = ({ data, type }) => {
  if (!data) return null;

  const bedTypeMap = {
    big: "1.8m 大床",
    double: "1.2m 双床",
    king: "2.0m 超大床",
  };

  const starMap = {
    1: "一星级/基础",
    2: "二星级/普通",
    3: "三星级/舒适",
    4: "四星级/高档",
    5: "五星级/豪华",
  };

  const actionMap: Record<string, string> = {
    create: "创建酒店",
    update: "修改信息",
    audit_approved: "审核通过",
    audit_rejected: "审核拒绝",
  };

  const roleMap: Record<string, string> = {
    merchant: "商户",
    admin: "管理员",
  };

  const amenitiesMap: Record<string, string> = {
    WiFi: "WiFi",
    Parking: "停车场",
    Breakfast: "早餐",
    Family: "亲子友好",
    Gym: "健身房",
    Pool: "泳池",
    Pets: "可带宠物",
    Airport: "机场接送",
    pool: "泳池",
    gym: "健身房",
    spa: "水疗",
    restaurant: "餐厅",
    bar: "酒吧",
    hotel: "酒店",
    apartment: "公寓",
    homestay: "民宿",
    hostel: "青旅",
  };

  const tagsMap: Record<string, string> = {
    breakfast: "含早餐",
    cancel: "免费取消",
    window: "有窗",
    bathroom: "独立卫浴",
    wifi: "免费WiFi",
    family_theme: "亲子主题房",
    loft: "复式LOFT房",
    movie: "影音房",
  };

  console.log("酒店详情数据:", data);

  return (
    <>
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="酒店中文名">
          <Text strong>{data.name}</Text>
        </Descriptions.Item>

        <Descriptions.Item label="酒店英文名">
          {data.nameEn || "未提供"}
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

        <Descriptions.Item label="酒店星级">
          {data.star ? starMap[data.star as keyof typeof starMap] : "未选择"}
        </Descriptions.Item>

        <Descriptions.Item label="所在地区">
          {Array.isArray(data.location) && data.location.length > 0
            ? getFullAddress(data.location)
            : "未选择"}
        </Descriptions.Item>

        <Descriptions.Item label="详细地址">
          {data.address || "未提供"}
        </Descriptions.Item>

        <Descriptions.Item label="开业时间">
          {data.openingDate || "未提供"}
        </Descriptions.Item>

        <Descriptions.Item label="联系电话">
          {data.phone ? data.phone : "未提供"}
        </Descriptions.Item>

        <Descriptions.Item label="酒店设施">
          {Array.isArray(data.amenities) && data.amenities.length > 0 ? (
            <Space wrap>
              {data.amenities.map((item: string, i: number) => (
                <Tag key={i}>{amenitiesMap[item] || item}</Tag>
              ))}
            </Space>
          ) : (
            <Text type="secondary">未设置</Text>
          )}
        </Descriptions.Item>

        <Descriptions.Item label="酒店照片">
          {Array.isArray(data.photos) && data.photos.length > 0 ? (
            <Space wrap>
              {data.photos.map((p: any, i: number) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <Image
                    width={100}
                    height={100}
                    src={p.url}
                    style={{ objectFit: "cover", borderRadius: 4 }}
                  />
                  {p.isPrimary && (
                    <div style={{ fontSize: "12px", color: "#1890ff" }}>
                      封面图
                    </div>
                  )}
                </div>
              ))}
            </Space>
          ) : (
            <Text type="secondary">未上传</Text>
          )}
        </Descriptions.Item>
      </Descriptions>

      {data.roomTypes && data.roomTypes.length > 0 && (
        <>
          <Divider style={{ margin: "24px 0" }}>房型配置</Divider>
          <Space direction="vertical" style={{ width: "100%" }}>
            {data.roomTypes?.map((room: any, i: number) => (
              <Card
                size="small"
                title={room.name}
                key={i}
                style={{ background: "#fafafa" }}
              >
                <Descriptions size="small" column={2}>
                  <Descriptions.Item label="每晚价格">
                    ¥{room.price}
                  </Descriptions.Item>
                  <Descriptions.Item label="剩余库存">
                    {room.stock}
                  </Descriptions.Item>
                  <Descriptions.Item label="标准入住">
                    {room.capacity !== undefined && room.capacity !== null
                      ? `${room.capacity}人`
                      : "未设置"}
                  </Descriptions.Item>
                  <Descriptions.Item label="床型">
                    {room.bedType
                      ? bedTypeMap[room.bedType as keyof typeof bedTypeMap] ||
                        room.bedType
                      : "未设置"}
                  </Descriptions.Item>
                </Descriptions>

                <div style={{ marginTop: 12 }}>
                  <Text type="secondary" style={{ marginRight: 12 }}>
                    配套权益:
                  </Text>
                  {Array.isArray(room.tags) && room.tags.length > 0 ? (
                    <Space wrap>
                      {room.tags.map((t: string) => (
                        <Tag key={t}>{tagsMap[t] || t}</Tag>
                      ))}
                    </Space>
                  ) : (
                    <Text type="secondary">未设置</Text>
                  )}
                </div>

                <div style={{ marginTop: 12 }}>
                  <Text type="secondary" style={{ marginRight: 12 }}>
                    房型照片:
                  </Text>
                  {Array.isArray(room.photos) && room.photos.length > 0 ? (
                    <Space wrap>
                      {room.photos.map((rp: any, ri: number) => (
                        <Image
                          key={ri}
                          width={80}
                          src={rp.url}
                          style={{ borderRadius: 4 }}
                        />
                      ))}
                    </Space>
                  ) : (
                    <Text type="secondary">未上传</Text>
                  )}
                </div>
              </Card>
            ))}
          </Space>
        </>
      )}

      {data.auditHistory && data.auditHistory.length > 0 && (
        <>
          <Divider style={{ margin: "24px 0" }}>审核历史记录</Divider>
          <Timeline
            mode="left"
            items={data.auditHistory
              .slice()
              .reverse()
              .map((record: any) => ({
                color:
                  record.action === "audit_approved"
                    ? "green"
                    : record.action === "audit_rejected"
                      ? "red"
                      : "blue",
                children: (
                  <div>
                    <Space>
                      <Tag
                        color={
                          record.status === "approved"
                            ? "green"
                            : record.status === "rejected"
                              ? "red"
                              : "orange"
                        }
                      >
                        {record.status === "approved"
                          ? "已通过"
                          : record.status === "rejected"
                            ? "已拒绝"
                            : "审核中"}
                      </Tag>
                      <Text strong>
                        {actionMap[record.action] || record.action}
                      </Text>
                    </Space>
                    <div style={{ marginTop: 8, fontSize: "13px" }}>
                      <Text type="secondary">操作人: </Text>
                      {roleMap[record.operatorRole] || record.operatorRole}
                    </div>
                    {record.rejectReason && (
                      <div style={{ marginTop: 8, fontSize: "13px" }}>
                        <Text type="secondary">拒绝原因: </Text>
                        <Text type="danger">{record.rejectReason}</Text>
                      </div>
                    )}
                    <div
                      style={{ marginTop: 8, fontSize: "12px", color: "#999" }}
                    >
                      {formatDateTime(record.timestamp)}
                    </div>
                  </div>
                ),
              }))}
          />
        </>
      )}
    </>
  );
};

export default HotelDetailView;
