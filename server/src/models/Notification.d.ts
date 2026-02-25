import mongoose, { Document } from "mongoose";
export interface INotification extends Document {
    _id: mongoose.Types.ObjectId;
    type: "audit_result" | "feedback_reply" | "system" | "hotel_offline" | "hotel_online" | "pending_audit" | "new_feedback";
    hotelId?: string;
    hotelName?: string;
    ownerId: string;
    status: "unread" | "read";
    message: string;
    relatedId?: string;
    operatorId?: string;
    operatorRole?: "merchant" | "admin";
    createdAt: Date;
    updatedAt: Date;
}
export declare const NotificationModel: mongoose.Model<INotification, {}, {}, {}, mongoose.Document<unknown, {}, INotification, {}, mongoose.DefaultSchemaOptions> & INotification & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, INotification>;
//# sourceMappingURL=Notification.d.ts.map