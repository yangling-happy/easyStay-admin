import mongoose, { Schema, Document } from "mongoose";
const FeedbackSchema = new Schema({
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
    images: {
        type: [String],
        default: [],
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
}, {
    timestamps: true,
});
// 添加索引
FeedbackSchema.index({ ownerId: 1, createdAt: -1 });
FeedbackSchema.index({ hotelId: 1 });
FeedbackSchema.index({ notificationId: 1 });
FeedbackSchema.index({ status: 1 });
// 转换 _id 为 id
FeedbackSchema.set("toJSON", {
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
export const FeedbackModel = mongoose.model("Feedback", FeedbackSchema);
//# sourceMappingURL=Feedback.js.map