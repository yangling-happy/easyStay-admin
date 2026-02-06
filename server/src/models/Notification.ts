import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  type: "audit_result" | "feedback_reply" | "system"; // 通知类型
  hotelId?: string; // 关联的酒店 ID（可选）
  hotelName?: string; // 冗余存储酒店名称（可选）
  ownerId: string; // 商户 ID（接收通知的用户）
  status: "unread" | "read"; // 未读/已读状态
  message: string; // 通知内容
  relatedId?: string; // 关联的反馈ID或其他业务ID
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    type: {
      type: String,
      enum: ["audit_result", "feedback_reply", "system"],
      required: true,
      default: "feedback_reply",
    },
    hotelId: {
      type: String,
    },
    hotelName: {
      type: String,
      trim: true,
    },
    ownerId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["unread", "read"],
      default: "unread",
    },
    message: {
      type: String,
      required: true,
    },
    relatedId: {
      type: String, // 可以存 feedbackId
    },
  },
  {
    timestamps: true,
  }
);

// 添加索引
NotificationSchema.index({ ownerId: 1, status: 1 });
NotificationSchema.index({ ownerId: 1, createdAt: -1 });

// 转换 _id 为 id
NotificationSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret: any) {
    if (ret._id) {
      ret.id = ret._id.toString();
      delete ret._id;
    }
    if (ret.__v !== undefined) {
      delete ret.__v;
    }
    return ret;
  },
});

export const NotificationModel = mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);