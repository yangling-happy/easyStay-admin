export type HotelStatus = "pending" | "approved" | "rejected";

export interface RoomType {
  id: string;
  name: string;   // 房型名，如：经典双床房
  price: number;  // 价格
  stock: number;  // 库存
}

export interface Hotel {
  id: string;
  // --- 基础信息 ---
  name: string;
  nameEn: string;
  address: string;
  star: 1 | 2 | 3 | 4 | 5;
  openingDate: string;    // 文档要求：包含开业时间
  
  // --- 业务状态 (核心) ---
  status: HotelStatus;    // 审核状态
  rejectReason?: string;  // 不通过原因（status为rejected时必填）
  isActive: boolean;      // 发布/下线状态（true为发布，false为下线。对应“下线可恢复”）
  isDeleted: boolean;     // 虚拟删除（商户端删除后不再显示）
  
  // --- 关联与审计 ---
  ownerId: string;        // 所属商户ID（用于后端查询该商户名下的酒店）
  roomTypes: RoomType[];
  createTime: string;     // 创建时间
  updateTime: string;     // 更新时间（建议增加，方便排序）
}