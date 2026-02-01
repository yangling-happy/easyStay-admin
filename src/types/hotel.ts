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
  nameEn: string; 
  address: string;
  star: 1 | 2 | 3 | 4 | 5;
  status: HotelStatus;
  rejectReason?: string;
  isDeleted: boolean;
  roomTypes: RoomType[];
  createTime: string;
}
