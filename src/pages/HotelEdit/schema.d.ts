export interface HotelImage {
  url: string;
  isPrimary?: boolean;
  alt?: string;
}
export interface RoomType {
  name: string; // 房型名称
  price: number; // 每晚价格
  stock: number; // 剩余库存
  capacity?: number; // 标准入住人数
  bedType?: string; // 床型 (big/double/king)
  tags?: string[]; // 配套权益
  photos: HotelImage[]; // 房型照片
}

export type HotelStatus = "pending" | "approved" | "rejected";

export interface Hotel {
  id: string;
  name: string; // 中文名
  nameEn: string; // 英文名
  address: string; // 地址
  star: 1 | 2 | 3 | 4 | 5; // 星级
  openingDate: string; // 开业时间
  status: HotelStatus;
  photos: HotelImage[]; // 酒店整体照片
  roomTypes: RoomType[]; // 房型与价格
  phone: string;
  location: string[];
  amenities: string[];
  discountLabel?: string; // 优惠场景
  isDeleted: boolean;
  createTime: string;
}
