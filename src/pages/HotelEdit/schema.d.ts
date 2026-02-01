export interface Hotel {
  id: string;
  name: string;        // 中文名
  nameEn: string;      // 英文名 
  address: string;     // 地址
  star: 1 | 2 | 3 | 4 | 5; // 星级 
  openingDate: string; // 开业时间
  status: HotelStatus;
  roomTypes: RoomType[]; // 房型与价格
  // 可选维度
  nearbyInfo?: string; // 景点/交通
  discountLabel?: string; // 优惠场景
  isDeleted: boolean;
  createTime: string;
}