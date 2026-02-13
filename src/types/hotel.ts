export type HotelStatus = "pending" | "approved" | "rejected";
export interface HotelImage { url: string; isPrimary?: boolean; alt?: string; }
export interface RoomType {
  id?: string;
  name: string; // 房型名，如：经典双床房
  price: number; // 价格
  stock: number; // 库存
  photos:HotelImage[];// 房型专属照片（新增）
}

export interface Hotel {
  id?: string; // MongoDB 会生成 _id
  // --- 基础信息 ---
  name: string;
  nameEn: string;
  address: string;
  star: 1 | 2 | 3 | 4 | 5;
  openingDate: string; // 格式：YYYY-MM-DD
  photos: HotelImage[]; // 酒店整体照片
  description: string; // 酒店描述
  nearbyInfo?: string;
  
  // --- 审核与状态 ---
  status: HotelStatus; // 审核状态
  rejectReason?: string; // 不通过原因
  isActive: boolean; // 发布/下线状态
  isDeleted: boolean; // 虚拟删除

  // --- 关联与审计 ---
  ownerId: string; // 所属商户ID
  roomTypes: RoomType[]; // 现在包含 photos 字段
  createTime?: string | Date; // 创建时间
  updateTime?: string | Date; // 更新时间
}

// 前端表单数据类型
export interface HotelFormData {
  name: string;
  nameEn: string;
  address: string;
  star: string; // 注意：前端可能是字符串 "3"，后端是数字 3
  openingDate: any; // Dayjs 对象或字符串
  photos: HotelImage[];
  nearbyInfo?: string;
  roomTypes: Array<{
    name: string;
    price: number;
    stock: number;
    photos: HotelImage[];
  }>;
}
