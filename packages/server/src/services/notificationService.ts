import { NotificationModel } from "../models/Notification.js";
import { User } from "../models/User.js";

/**
 * @description 通知管理员有新的酒店待审核
 */
export async function notifyAdminsOfPendingHotel(
  hotelId: string,
  hotelName: string,
) {
  try {
    const admins = await User.find({ role: "admin" }).select("_id");
    if (admins.length === 0) return;

    const message = `有新的酒店"${hotelName}"待审核`;
    await NotificationModel.insertMany(
      admins.map((admin) => ({
        type: "pending_audit",
        hotelId,
        hotelName,
        ownerId: admin._id.toString(),
        status: "unread",
        message,
      })),
    );
  } catch (error: unknown) {
    console.error("通知管理员待审核失败:", error);
  }
}

/**
 * @description 通知商户酒店已下线
 */
export async function notifyMerchantHotelOffline(params: {
  hotelId: string;
  hotelName: string;
  ownerId: string;
}) {
  try {
    const message = `您的酒店"${params.hotelName}"已下线，旅客将无法预订。如需恢复上线，请在酒店列表中提交申请。`;

    await NotificationModel.create({
      type: "hotel_offline",
      hotelId: params.hotelId,
      hotelName: params.hotelName,
      ownerId: params.ownerId,
      status: "unread",
      message,
    });
  } catch (error: unknown) {
    console.error("发送下线通知失败:", error);
  }
}

/**
 * @description 通知商户审核结果
 */
export async function notifyMerchantAuditResult(params: {
  hotelId: string;
  hotelName: string;
  ownerId: string;
  status: "approved" | "rejected";
  rejectReason?: string;
}) {
  try {
    const message =
      params.status === "approved"
        ? `您的酒店"${params.hotelName}"审核已通过，现已上线`
        : `您的酒店"${params.hotelName}"审核被拒绝：${params.rejectReason || "未提供原因"}`;

    await NotificationModel.create({
      type: "audit_result",
      hotelId: params.hotelId,
      hotelName: params.hotelName,
      ownerId: params.ownerId,
      status: "unread",
      message,
    });
  } catch (error: unknown) {
    console.error("创建审核通知失败:", error);
  }
}

/**
 * @description 通知商户酒店被管理员上下线
 */
export async function notifyMerchantHotelStatusChangedByAdmin(params: {
  hotelId: string;
  hotelName: string;
  ownerId: string;
  isOnline: boolean;
  operatorId?: string;
}) {
  try {
    const message = params.isOnline
      ? `您的酒店"${params.hotelName}"已由管理员上线`
      : `您的酒店"${params.hotelName}"已由管理员下线`;

    await NotificationModel.create({
      type: params.isOnline ? "hotel_online" : "hotel_offline",
      hotelId: params.hotelId,
      hotelName: params.hotelName,
      ownerId: params.ownerId,
      status: "unread",
      message,
      operatorId: params.operatorId,
      operatorRole: "admin",
    });
  } catch (error: unknown) {
    console.error("创建上下线通知失败:", error);
  }
}
