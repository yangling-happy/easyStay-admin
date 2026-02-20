export type OrderStatus = "pending" | "confirmed" | "checkin" | "checkout" | "cancelled" | "refunded";
export type PaymentStatus = "unpaid" | "paid" | "refunded";

export interface Order {
  id?: string;
  orderNumber: string;
  userId: string;
  hotelId: string;
  hotelName: string;
  roomTypeId: string;
  roomTypeName: string;
  checkInDate: string | Date;
  checkOutDate: string | Date;
  guestCount: number;
  totalPrice: number;
  status: OrderStatus;
  contactName: string;
  contactPhone: string;
  specialRequests?: string;
  paymentStatus: PaymentStatus;
  isDeleted: boolean;
  createTime?: string | Date;
  updateTime?: string | Date;
}
