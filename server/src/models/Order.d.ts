import mongoose from "mongoose";
export declare const OrderModel: mongoose.Model<{
    status: "pending" | "confirmed" | "checkin" | "checkout" | "cancelled" | "refunded";
    isDeleted: boolean;
    createTime: NativeDate;
    updateTime: NativeDate;
    hotelId: string;
    hotelName: string;
    userId: string;
    contactPhone: string;
    orderNumber: string;
    roomTypeId: string;
    roomTypeName: string;
    checkInDate: NativeDate;
    checkOutDate: NativeDate;
    guestCount: number;
    totalPrice: number;
    contactName: string;
    specialRequests: string;
    paymentStatus: "refunded" | "unpaid" | "paid";
}, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    status: "pending" | "confirmed" | "checkin" | "checkout" | "cancelled" | "refunded";
    isDeleted: boolean;
    createTime: NativeDate;
    updateTime: NativeDate;
    hotelId: string;
    hotelName: string;
    userId: string;
    contactPhone: string;
    orderNumber: string;
    roomTypeId: string;
    roomTypeName: string;
    checkInDate: NativeDate;
    checkOutDate: NativeDate;
    guestCount: number;
    totalPrice: number;
    contactName: string;
    specialRequests: string;
    paymentStatus: "refunded" | "unpaid" | "paid";
}, {
    id: string;
}, mongoose.DefaultSchemaOptions> & Omit<{
    status: "pending" | "confirmed" | "checkin" | "checkout" | "cancelled" | "refunded";
    isDeleted: boolean;
    createTime: NativeDate;
    updateTime: NativeDate;
    hotelId: string;
    hotelName: string;
    userId: string;
    contactPhone: string;
    orderNumber: string;
    roomTypeId: string;
    roomTypeName: string;
    checkInDate: NativeDate;
    checkOutDate: NativeDate;
    guestCount: number;
    totalPrice: number;
    contactName: string;
    specialRequests: string;
    paymentStatus: "refunded" | "unpaid" | "paid";
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    status: "pending" | "confirmed" | "checkin" | "checkout" | "cancelled" | "refunded";
    isDeleted: boolean;
    createTime: NativeDate;
    updateTime: NativeDate;
    hotelId: string;
    hotelName: string;
    userId: string;
    contactPhone: string;
    orderNumber: string;
    roomTypeId: string;
    roomTypeName: string;
    checkInDate: NativeDate;
    checkOutDate: NativeDate;
    guestCount: number;
    totalPrice: number;
    contactName: string;
    specialRequests: string;
    paymentStatus: "refunded" | "unpaid" | "paid";
}, mongoose.Document<unknown, {}, {
    status: "pending" | "confirmed" | "checkin" | "checkout" | "cancelled" | "refunded";
    isDeleted: boolean;
    createTime: NativeDate;
    updateTime: NativeDate;
    hotelId: string;
    hotelName: string;
    userId: string;
    contactPhone: string;
    orderNumber: string;
    roomTypeId: string;
    roomTypeName: string;
    checkInDate: NativeDate;
    checkOutDate: NativeDate;
    guestCount: number;
    totalPrice: number;
    contactName: string;
    specialRequests: string;
    paymentStatus: "refunded" | "unpaid" | "paid";
}, {
    id: string;
}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & Omit<{
    status: "pending" | "confirmed" | "checkin" | "checkout" | "cancelled" | "refunded";
    isDeleted: boolean;
    createTime: NativeDate;
    updateTime: NativeDate;
    hotelId: string;
    hotelName: string;
    userId: string;
    contactPhone: string;
    orderNumber: string;
    roomTypeId: string;
    roomTypeName: string;
    checkInDate: NativeDate;
    checkOutDate: NativeDate;
    guestCount: number;
    totalPrice: number;
    contactName: string;
    specialRequests: string;
    paymentStatus: "refunded" | "unpaid" | "paid";
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    [path: string]: mongoose.SchemaDefinitionProperty<undefined, any, any>;
} | {
    [x: string]: mongoose.SchemaDefinitionProperty<any, any, mongoose.Document<unknown, {}, {
        status: "pending" | "confirmed" | "checkin" | "checkout" | "cancelled" | "refunded";
        isDeleted: boolean;
        createTime: NativeDate;
        updateTime: NativeDate;
        hotelId: string;
        hotelName: string;
        userId: string;
        contactPhone: string;
        orderNumber: string;
        roomTypeId: string;
        roomTypeName: string;
        checkInDate: NativeDate;
        checkOutDate: NativeDate;
        guestCount: number;
        totalPrice: number;
        contactName: string;
        specialRequests: string;
        paymentStatus: "refunded" | "unpaid" | "paid";
    }, {
        id: string;
    }, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & Omit<{
        status: "pending" | "confirmed" | "checkin" | "checkout" | "cancelled" | "refunded";
        isDeleted: boolean;
        createTime: NativeDate;
        updateTime: NativeDate;
        hotelId: string;
        hotelName: string;
        userId: string;
        contactPhone: string;
        orderNumber: string;
        roomTypeId: string;
        roomTypeName: string;
        checkInDate: NativeDate;
        checkOutDate: NativeDate;
        guestCount: number;
        totalPrice: number;
        contactName: string;
        specialRequests: string;
        paymentStatus: "refunded" | "unpaid" | "paid";
    } & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, {
    status: "pending" | "confirmed" | "checkin" | "checkout" | "cancelled" | "refunded";
    isDeleted: boolean;
    createTime: NativeDate;
    updateTime: NativeDate;
    hotelId: string;
    hotelName: string;
    userId: string;
    contactPhone: string;
    orderNumber: string;
    roomTypeId: string;
    roomTypeName: string;
    checkInDate: NativeDate;
    checkOutDate: NativeDate;
    guestCount: number;
    totalPrice: number;
    contactName: string;
    specialRequests: string;
    paymentStatus: "refunded" | "unpaid" | "paid";
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    status: "pending" | "confirmed" | "checkin" | "checkout" | "cancelled" | "refunded";
    isDeleted: boolean;
    createTime: NativeDate;
    updateTime: NativeDate;
    hotelId: string;
    hotelName: string;
    userId: string;
    contactPhone: string;
    orderNumber: string;
    roomTypeId: string;
    roomTypeName: string;
    checkInDate: NativeDate;
    checkOutDate: NativeDate;
    guestCount: number;
    totalPrice: number;
    contactName: string;
    specialRequests: string;
    paymentStatus: "refunded" | "unpaid" | "paid";
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=Order.d.ts.map