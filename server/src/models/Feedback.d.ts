import mongoose, { Document } from "mongoose";
export interface IFeedback extends Document {
    _id: mongoose.Types.ObjectId;
    hotelId: string;
    ownerId: string;
    notificationId?: string;
    content: string;
    images?: string[];
    reply?: string;
    status: "pending" | "replied";
    createdAt: Date;
    updatedAt: Date;
    repliedAt?: Date;
}
export declare const FeedbackModel: mongoose.Model<IFeedback, {}, {}, {}, mongoose.Document<unknown, {}, IFeedback, {}, mongoose.DefaultSchemaOptions> & IFeedback & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IFeedback>;
//# sourceMappingURL=Feedback.d.ts.map