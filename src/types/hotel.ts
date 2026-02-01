export type HotelStatus = "pending" | "approved" | "rejected";

export interface RoomType {
  id: string;
  name: string; // 房型名，如：经典双床房
  price: number; // 价格
  stock: number; // 库存
}

export interface Hotel {
  id: string;
  name: string;
  address: string;
  star: 1 | 2 | 3 | 4 | 5;
  status: HotelStatus;
  rejectReason?: string; // 只有 status 为 rejected 时必填
  isDeleted: boolean; // 下线逻辑：true 为已下线
  roomTypes: RoomType[];
  createTime: string;
}
