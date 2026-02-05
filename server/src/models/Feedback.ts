import mongoose, { Schema, Document } from "mongoose";

export interface IFeedback extends Document {
  _id: mongoose.Types.ObjectId;
  hotelId: string; // 酒店 ID
  ownerId: string; // 商户 ID
  notificationId?: string; // 关联的通知 ID（可选）
  content: string; // 商户反馈内容
  reply?: string; // 管理员回复内容
  status: "pending" | "replied"; // 待处理/已回复
  createdAt: Date;
  updatedAt: Date;
  repliedAt?: Date; // 回复时间
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    hotelId: {
      type: String,
      required: true,
    },
    ownerId: {
      type: String,
      required: true,
    },
    notificationId: {
      type: String,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
    reply: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "replied"],
      default: "pending",
    },
    repliedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// 添加索引
FeedbackSchema.index({ ownerId: 1, createdAt: -1 });
FeedbackSchema.index({ hotelId: 1 });
FeedbackSchema.index({ notificationId: 1 });
FeedbackSchema.index({ status: 1 });

// 转换 _id 为 id
FeedbackSchema.set("toJSON", {
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

export const FeedbackModel = mongoose.model<IFeedback>(
  "Feedback",
  FeedbackSchema
);