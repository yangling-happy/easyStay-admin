import mongoose, { Schema, Document } from "mongoose";
const NotificationSchema = new Schema({
    type: {
        type: String,
        enum: [
            "audit_result",
            "feedback_reply",
            "system",
            "hotel_offline",
            "hotel_online",
            "pending_audit",
            "new_feedback",
        ],
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
    operatorId: {
        type: String,
    },
    operatorRole: {
        type: String,
        enum: ["merchant", "admin"],
    },
}, {
    timestamps: true,
});
// 添加索引
NotificationSchema.index({ ownerId: 1, status: 1 });
NotificationSchema.index({ ownerId: 1, createdAt: -1 });
// 转换 _id 为 id
NotificationSchema.set("toJSON", {
    virtuals: true,
    transform: function (doc, ret) {
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
export const NotificationModel = mongoose.model("Notification", NotificationSchema);
//# sourceMappingURL=Notification.js.map