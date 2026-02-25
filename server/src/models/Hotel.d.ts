import mongoose from "mongoose";
export declare const HotelModel: mongoose.Model<{
    name: string;
    version: number;
    photos: mongoose.Types.DocumentArray<{
        url?: string | null | undefined;
        isPrimary?: boolean | null | undefined;
        alt?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        url?: string | null | undefined;
        isPrimary?: boolean | null | undefined;
        alt?: string | null | undefined;
    }> & {
        url?: string | null | undefined;
        isPrimary?: boolean | null | undefined;
        alt?: string | null | undefined;
    }>;
    location: string[];
    amenities: string[];
    status: "pending" | "approved" | "rejected" | "offline";
    rejectReason: string;
    isActive: boolean;
    isDeleted: boolean;
    isIncomplete: boolean;
    auditHistory: mongoose.Types.DocumentArray<{
        status: "pending" | "approved" | "rejected" | "offline";
        rejectReason: string;
        action: "offline" | "create" | "update" | "audit_approved" | "audit_rejected" | "online" | "reapply_online";
        timestamp: NativeDate;
        operatorId?: string | null | undefined;
        operatorRole?: "merchant" | "admin" | null | undefined;
        beforeStatus?: any;
        afterStatus?: any;
        snapshot?: any;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        status: "pending" | "approved" | "rejected" | "offline";
        rejectReason: string;
        action: "offline" | "create" | "update" | "audit_approved" | "audit_rejected" | "online" | "reapply_online";
        timestamp: NativeDate;
        operatorId?: string | null | undefined;
        operatorRole?: "merchant" | "admin" | null | undefined;
        beforeStatus?: any;
        afterStatus?: any;
        snapshot?: any;
    }> & {
        status: "pending" | "approved" | "rejected" | "offline";
        rejectReason: string;
        action: "offline" | "create" | "update" | "audit_approved" | "audit_rejected" | "online" | "reapply_online";
        timestamp: NativeDate;
        operatorId?: string | null | undefined;
        operatorRole?: "merchant" | "admin" | null | undefined;
        beforeStatus?: any;
        afterStatus?: any;
        snapshot?: any;
    }>;
    roomTypes: mongoose.Types.DocumentArray<{
        name: string;
        photos: mongoose.Types.DocumentArray<{
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }> & {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }>;
        price: number;
        stock: number;
        tags: string[];
        capacity?: number | null | undefined;
        bedType?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        name: string;
        photos: mongoose.Types.DocumentArray<{
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }> & {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }>;
        price: number;
        stock: number;
        tags: string[];
        capacity?: number | null | undefined;
        bedType?: string | null | undefined;
    }> & {
        name: string;
        photos: mongoose.Types.DocumentArray<{
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }> & {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }>;
        price: number;
        stock: number;
        tags: string[];
        capacity?: number | null | undefined;
        bedType?: string | null | undefined;
    }>;
    createTime: NativeDate;
    updateTime: NativeDate;
    nameEn?: string | null | undefined;
    address?: string | null | undefined;
    star?: number | null | undefined;
    openingDate?: string | null | undefined;
    phone?: string | null | undefined;
    completionStatus?: "rejected" | "draft" | "incomplete" | null | undefined;
    ownerId?: string | null | undefined;
}, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    name: string;
    version: number;
    photos: mongoose.Types.DocumentArray<{
        url?: string | null | undefined;
        isPrimary?: boolean | null | undefined;
        alt?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        url?: string | null | undefined;
        isPrimary?: boolean | null | undefined;
        alt?: string | null | undefined;
    }> & {
        url?: string | null | undefined;
        isPrimary?: boolean | null | undefined;
        alt?: string | null | undefined;
    }>;
    location: string[];
    amenities: string[];
    status: "pending" | "approved" | "rejected" | "offline";
    rejectReason: string;
    isActive: boolean;
    isDeleted: boolean;
    isIncomplete: boolean;
    auditHistory: mongoose.Types.DocumentArray<{
        status: "pending" | "approved" | "rejected" | "offline";
        rejectReason: string;
        action: "offline" | "create" | "update" | "audit_approved" | "audit_rejected" | "online" | "reapply_online";
        timestamp: NativeDate;
        operatorId?: string | null | undefined;
        operatorRole?: "merchant" | "admin" | null | undefined;
        beforeStatus?: any;
        afterStatus?: any;
        snapshot?: any;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        status: "pending" | "approved" | "rejected" | "offline";
        rejectReason: string;
        action: "offline" | "create" | "update" | "audit_approved" | "audit_rejected" | "online" | "reapply_online";
        timestamp: NativeDate;
        operatorId?: string | null | undefined;
        operatorRole?: "merchant" | "admin" | null | undefined;
        beforeStatus?: any;
        afterStatus?: any;
        snapshot?: any;
    }> & {
        status: "pending" | "approved" | "rejected" | "offline";
        rejectReason: string;
        action: "offline" | "create" | "update" | "audit_approved" | "audit_rejected" | "online" | "reapply_online";
        timestamp: NativeDate;
        operatorId?: string | null | undefined;
        operatorRole?: "merchant" | "admin" | null | undefined;
        beforeStatus?: any;
        afterStatus?: any;
        snapshot?: any;
    }>;
    roomTypes: mongoose.Types.DocumentArray<{
        name: string;
        photos: mongoose.Types.DocumentArray<{
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }> & {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }>;
        price: number;
        stock: number;
        tags: string[];
        capacity?: number | null | undefined;
        bedType?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        name: string;
        photos: mongoose.Types.DocumentArray<{
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }> & {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }>;
        price: number;
        stock: number;
        tags: string[];
        capacity?: number | null | undefined;
        bedType?: string | null | undefined;
    }> & {
        name: string;
        photos: mongoose.Types.DocumentArray<{
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }> & {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }>;
        price: number;
        stock: number;
        tags: string[];
        capacity?: number | null | undefined;
        bedType?: string | null | undefined;
    }>;
    createTime: NativeDate;
    updateTime: NativeDate;
    nameEn?: string | null | undefined;
    address?: string | null | undefined;
    star?: number | null | undefined;
    openingDate?: string | null | undefined;
    phone?: string | null | undefined;
    completionStatus?: "rejected" | "draft" | "incomplete" | null | undefined;
    ownerId?: string | null | undefined;
}, {
    id: string;
}, mongoose.DefaultSchemaOptions> & Omit<{
    name: string;
    version: number;
    photos: mongoose.Types.DocumentArray<{
        url?: string | null | undefined;
        isPrimary?: boolean | null | undefined;
        alt?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        url?: string | null | undefined;
        isPrimary?: boolean | null | undefined;
        alt?: string | null | undefined;
    }> & {
        url?: string | null | undefined;
        isPrimary?: boolean | null | undefined;
        alt?: string | null | undefined;
    }>;
    location: string[];
    amenities: string[];
    status: "pending" | "approved" | "rejected" | "offline";
    rejectReason: string;
    isActive: boolean;
    isDeleted: boolean;
    isIncomplete: boolean;
    auditHistory: mongoose.Types.DocumentArray<{
        status: "pending" | "approved" | "rejected" | "offline";
        rejectReason: string;
        action: "offline" | "create" | "update" | "audit_approved" | "audit_rejected" | "online" | "reapply_online";
        timestamp: NativeDate;
        operatorId?: string | null | undefined;
        operatorRole?: "merchant" | "admin" | null | undefined;
        beforeStatus?: any;
        afterStatus?: any;
        snapshot?: any;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        status: "pending" | "approved" | "rejected" | "offline";
        rejectReason: string;
        action: "offline" | "create" | "update" | "audit_approved" | "audit_rejected" | "online" | "reapply_online";
        timestamp: NativeDate;
        operatorId?: string | null | undefined;
        operatorRole?: "merchant" | "admin" | null | undefined;
        beforeStatus?: any;
        afterStatus?: any;
        snapshot?: any;
    }> & {
        status: "pending" | "approved" | "rejected" | "offline";
        rejectReason: string;
        action: "offline" | "create" | "update" | "audit_approved" | "audit_rejected" | "online" | "reapply_online";
        timestamp: NativeDate;
        operatorId?: string | null | undefined;
        operatorRole?: "merchant" | "admin" | null | undefined;
        beforeStatus?: any;
        afterStatus?: any;
        snapshot?: any;
    }>;
    roomTypes: mongoose.Types.DocumentArray<{
        name: string;
        photos: mongoose.Types.DocumentArray<{
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }> & {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }>;
        price: number;
        stock: number;
        tags: string[];
        capacity?: number | null | undefined;
        bedType?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        name: string;
        photos: mongoose.Types.DocumentArray<{
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }> & {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }>;
        price: number;
        stock: number;
        tags: string[];
        capacity?: number | null | undefined;
        bedType?: string | null | undefined;
    }> & {
        name: string;
        photos: mongoose.Types.DocumentArray<{
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }> & {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }>;
        price: number;
        stock: number;
        tags: string[];
        capacity?: number | null | undefined;
        bedType?: string | null | undefined;
    }>;
    createTime: NativeDate;
    updateTime: NativeDate;
    nameEn?: string | null | undefined;
    address?: string | null | undefined;
    star?: number | null | undefined;
    openingDate?: string | null | undefined;
    phone?: string | null | undefined;
    completionStatus?: "rejected" | "draft" | "incomplete" | null | undefined;
    ownerId?: string | null | undefined;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    name: string;
    version: number;
    photos: mongoose.Types.DocumentArray<{
        url?: string | null | undefined;
        isPrimary?: boolean | null | undefined;
        alt?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        url?: string | null | undefined;
        isPrimary?: boolean | null | undefined;
        alt?: string | null | undefined;
    }> & {
        url?: string | null | undefined;
        isPrimary?: boolean | null | undefined;
        alt?: string | null | undefined;
    }>;
    location: string[];
    amenities: string[];
    status: "pending" | "approved" | "rejected" | "offline";
    rejectReason: string;
    isActive: boolean;
    isDeleted: boolean;
    isIncomplete: boolean;
    auditHistory: mongoose.Types.DocumentArray<{
        status: "pending" | "approved" | "rejected" | "offline";
        rejectReason: string;
        action: "offline" | "create" | "update" | "audit_approved" | "audit_rejected" | "online" | "reapply_online";
        timestamp: NativeDate;
        operatorId?: string | null | undefined;
        operatorRole?: "merchant" | "admin" | null | undefined;
        beforeStatus?: any;
        afterStatus?: any;
        snapshot?: any;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        status: "pending" | "approved" | "rejected" | "offline";
        rejectReason: string;
        action: "offline" | "create" | "update" | "audit_approved" | "audit_rejected" | "online" | "reapply_online";
        timestamp: NativeDate;
        operatorId?: string | null | undefined;
        operatorRole?: "merchant" | "admin" | null | undefined;
        beforeStatus?: any;
        afterStatus?: any;
        snapshot?: any;
    }> & {
        status: "pending" | "approved" | "rejected" | "offline";
        rejectReason: string;
        action: "offline" | "create" | "update" | "audit_approved" | "audit_rejected" | "online" | "reapply_online";
        timestamp: NativeDate;
        operatorId?: string | null | undefined;
        operatorRole?: "merchant" | "admin" | null | undefined;
        beforeStatus?: any;
        afterStatus?: any;
        snapshot?: any;
    }>;
    roomTypes: mongoose.Types.DocumentArray<{
        name: string;
        photos: mongoose.Types.DocumentArray<{
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }> & {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }>;
        price: number;
        stock: number;
        tags: string[];
        capacity?: number | null | undefined;
        bedType?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        name: string;
        photos: mongoose.Types.DocumentArray<{
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }> & {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }>;
        price: number;
        stock: number;
        tags: string[];
        capacity?: number | null | undefined;
        bedType?: string | null | undefined;
    }> & {
        name: string;
        photos: mongoose.Types.DocumentArray<{
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }> & {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }>;
        price: number;
        stock: number;
        tags: string[];
        capacity?: number | null | undefined;
        bedType?: string | null | undefined;
    }>;
    createTime: NativeDate;
    updateTime: NativeDate;
    nameEn?: string | null | undefined;
    address?: string | null | undefined;
    star?: number | null | undefined;
    openingDate?: string | null | undefined;
    phone?: string | null | undefined;
    completionStatus?: "rejected" | "draft" | "incomplete" | null | undefined;
    ownerId?: string | null | undefined;
}, mongoose.Document<unknown, {}, {
    name: string;
    version: number;
    photos: mongoose.Types.DocumentArray<{
        url?: string | null | undefined;
        isPrimary?: boolean | null | undefined;
        alt?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        url?: string | null | undefined;
        isPrimary?: boolean | null | undefined;
        alt?: string | null | undefined;
    }> & {
        url?: string | null | undefined;
        isPrimary?: boolean | null | undefined;
        alt?: string | null | undefined;
    }>;
    location: string[];
    amenities: string[];
    status: "pending" | "approved" | "rejected" | "offline";
    rejectReason: string;
    isActive: boolean;
    isDeleted: boolean;
    isIncomplete: boolean;
    auditHistory: mongoose.Types.DocumentArray<{
        status: "pending" | "approved" | "rejected" | "offline";
        rejectReason: string;
        action: "offline" | "create" | "update" | "audit_approved" | "audit_rejected" | "online" | "reapply_online";
        timestamp: NativeDate;
        operatorId?: string | null | undefined;
        operatorRole?: "merchant" | "admin" | null | undefined;
        beforeStatus?: any;
        afterStatus?: any;
        snapshot?: any;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        status: "pending" | "approved" | "rejected" | "offline";
        rejectReason: string;
        action: "offline" | "create" | "update" | "audit_approved" | "audit_rejected" | "online" | "reapply_online";
        timestamp: NativeDate;
        operatorId?: string | null | undefined;
        operatorRole?: "merchant" | "admin" | null | undefined;
        beforeStatus?: any;
        afterStatus?: any;
        snapshot?: any;
    }> & {
        status: "pending" | "approved" | "rejected" | "offline";
        rejectReason: string;
        action: "offline" | "create" | "update" | "audit_approved" | "audit_rejected" | "online" | "reapply_online";
        timestamp: NativeDate;
        operatorId?: string | null | undefined;
        operatorRole?: "merchant" | "admin" | null | undefined;
        beforeStatus?: any;
        afterStatus?: any;
        snapshot?: any;
    }>;
    roomTypes: mongoose.Types.DocumentArray<{
        name: string;
        photos: mongoose.Types.DocumentArray<{
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }> & {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }>;
        price: number;
        stock: number;
        tags: string[];
        capacity?: number | null | undefined;
        bedType?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        name: string;
        photos: mongoose.Types.DocumentArray<{
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }> & {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }>;
        price: number;
        stock: number;
        tags: string[];
        capacity?: number | null | undefined;
        bedType?: string | null | undefined;
    }> & {
        name: string;
        photos: mongoose.Types.DocumentArray<{
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }> & {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }>;
        price: number;
        stock: number;
        tags: string[];
        capacity?: number | null | undefined;
        bedType?: string | null | undefined;
    }>;
    createTime: NativeDate;
    updateTime: NativeDate;
    nameEn?: string | null | undefined;
    address?: string | null | undefined;
    star?: number | null | undefined;
    openingDate?: string | null | undefined;
    phone?: string | null | undefined;
    completionStatus?: "rejected" | "draft" | "incomplete" | null | undefined;
    ownerId?: string | null | undefined;
}, {
    id: string;
}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & Omit<{
    name: string;
    version: number;
    photos: mongoose.Types.DocumentArray<{
        url?: string | null | undefined;
        isPrimary?: boolean | null | undefined;
        alt?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        url?: string | null | undefined;
        isPrimary?: boolean | null | undefined;
        alt?: string | null | undefined;
    }> & {
        url?: string | null | undefined;
        isPrimary?: boolean | null | undefined;
        alt?: string | null | undefined;
    }>;
    location: string[];
    amenities: string[];
    status: "pending" | "approved" | "rejected" | "offline";
    rejectReason: string;
    isActive: boolean;
    isDeleted: boolean;
    isIncomplete: boolean;
    auditHistory: mongoose.Types.DocumentArray<{
        status: "pending" | "approved" | "rejected" | "offline";
        rejectReason: string;
        action: "offline" | "create" | "update" | "audit_approved" | "audit_rejected" | "online" | "reapply_online";
        timestamp: NativeDate;
        operatorId?: string | null | undefined;
        operatorRole?: "merchant" | "admin" | null | undefined;
        beforeStatus?: any;
        afterStatus?: any;
        snapshot?: any;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        status: "pending" | "approved" | "rejected" | "offline";
        rejectReason: string;
        action: "offline" | "create" | "update" | "audit_approved" | "audit_rejected" | "online" | "reapply_online";
        timestamp: NativeDate;
        operatorId?: string | null | undefined;
        operatorRole?: "merchant" | "admin" | null | undefined;
        beforeStatus?: any;
        afterStatus?: any;
        snapshot?: any;
    }> & {
        status: "pending" | "approved" | "rejected" | "offline";
        rejectReason: string;
        action: "offline" | "create" | "update" | "audit_approved" | "audit_rejected" | "online" | "reapply_online";
        timestamp: NativeDate;
        operatorId?: string | null | undefined;
        operatorRole?: "merchant" | "admin" | null | undefined;
        beforeStatus?: any;
        afterStatus?: any;
        snapshot?: any;
    }>;
    roomTypes: mongoose.Types.DocumentArray<{
        name: string;
        photos: mongoose.Types.DocumentArray<{
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }> & {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }>;
        price: number;
        stock: number;
        tags: string[];
        capacity?: number | null | undefined;
        bedType?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        name: string;
        photos: mongoose.Types.DocumentArray<{
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }> & {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }>;
        price: number;
        stock: number;
        tags: string[];
        capacity?: number | null | undefined;
        bedType?: string | null | undefined;
    }> & {
        name: string;
        photos: mongoose.Types.DocumentArray<{
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }> & {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }>;
        price: number;
        stock: number;
        tags: string[];
        capacity?: number | null | undefined;
        bedType?: string | null | undefined;
    }>;
    createTime: NativeDate;
    updateTime: NativeDate;
    nameEn?: string | null | undefined;
    address?: string | null | undefined;
    star?: number | null | undefined;
    openingDate?: string | null | undefined;
    phone?: string | null | undefined;
    completionStatus?: "rejected" | "draft" | "incomplete" | null | undefined;
    ownerId?: string | null | undefined;
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
        name: string;
        version: number;
        photos: mongoose.Types.DocumentArray<{
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }> & {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }>;
        location: string[];
        amenities: string[];
        status: "pending" | "approved" | "rejected" | "offline";
        rejectReason: string;
        isActive: boolean;
        isDeleted: boolean;
        isIncomplete: boolean;
        auditHistory: mongoose.Types.DocumentArray<{
            status: "pending" | "approved" | "rejected" | "offline";
            rejectReason: string;
            action: "offline" | "create" | "update" | "audit_approved" | "audit_rejected" | "online" | "reapply_online";
            timestamp: NativeDate;
            operatorId?: string | null | undefined;
            operatorRole?: "merchant" | "admin" | null | undefined;
            beforeStatus?: any;
            afterStatus?: any;
            snapshot?: any;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            status: "pending" | "approved" | "rejected" | "offline";
            rejectReason: string;
            action: "offline" | "create" | "update" | "audit_approved" | "audit_rejected" | "online" | "reapply_online";
            timestamp: NativeDate;
            operatorId?: string | null | undefined;
            operatorRole?: "merchant" | "admin" | null | undefined;
            beforeStatus?: any;
            afterStatus?: any;
            snapshot?: any;
        }> & {
            status: "pending" | "approved" | "rejected" | "offline";
            rejectReason: string;
            action: "offline" | "create" | "update" | "audit_approved" | "audit_rejected" | "online" | "reapply_online";
            timestamp: NativeDate;
            operatorId?: string | null | undefined;
            operatorRole?: "merchant" | "admin" | null | undefined;
            beforeStatus?: any;
            afterStatus?: any;
            snapshot?: any;
        }>;
        roomTypes: mongoose.Types.DocumentArray<{
            name: string;
            photos: mongoose.Types.DocumentArray<{
                url?: string | null | undefined;
                isPrimary?: boolean | null | undefined;
                alt?: string | null | undefined;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
                url?: string | null | undefined;
                isPrimary?: boolean | null | undefined;
                alt?: string | null | undefined;
            }> & {
                url?: string | null | undefined;
                isPrimary?: boolean | null | undefined;
                alt?: string | null | undefined;
            }>;
            price: number;
            stock: number;
            tags: string[];
            capacity?: number | null | undefined;
            bedType?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            name: string;
            photos: mongoose.Types.DocumentArray<{
                url?: string | null | undefined;
                isPrimary?: boolean | null | undefined;
                alt?: string | null | undefined;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
                url?: string | null | undefined;
                isPrimary?: boolean | null | undefined;
                alt?: string | null | undefined;
            }> & {
                url?: string | null | undefined;
                isPrimary?: boolean | null | undefined;
                alt?: string | null | undefined;
            }>;
            price: number;
            stock: number;
            tags: string[];
            capacity?: number | null | undefined;
            bedType?: string | null | undefined;
        }> & {
            name: string;
            photos: mongoose.Types.DocumentArray<{
                url?: string | null | undefined;
                isPrimary?: boolean | null | undefined;
                alt?: string | null | undefined;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
                url?: string | null | undefined;
                isPrimary?: boolean | null | undefined;
                alt?: string | null | undefined;
            }> & {
                url?: string | null | undefined;
                isPrimary?: boolean | null | undefined;
                alt?: string | null | undefined;
            }>;
            price: number;
            stock: number;
            tags: string[];
            capacity?: number | null | undefined;
            bedType?: string | null | undefined;
        }>;
        createTime: NativeDate;
        updateTime: NativeDate;
        nameEn?: string | null | undefined;
        address?: string | null | undefined;
        star?: number | null | undefined;
        openingDate?: string | null | undefined;
        phone?: string | null | undefined;
        completionStatus?: "rejected" | "draft" | "incomplete" | null | undefined;
        ownerId?: string | null | undefined;
    }, {
        id: string;
    }, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & Omit<{
        name: string;
        version: number;
        photos: mongoose.Types.DocumentArray<{
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }> & {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }>;
        location: string[];
        amenities: string[];
        status: "pending" | "approved" | "rejected" | "offline";
        rejectReason: string;
        isActive: boolean;
        isDeleted: boolean;
        isIncomplete: boolean;
        auditHistory: mongoose.Types.DocumentArray<{
            status: "pending" | "approved" | "rejected" | "offline";
            rejectReason: string;
            action: "offline" | "create" | "update" | "audit_approved" | "audit_rejected" | "online" | "reapply_online";
            timestamp: NativeDate;
            operatorId?: string | null | undefined;
            operatorRole?: "merchant" | "admin" | null | undefined;
            beforeStatus?: any;
            afterStatus?: any;
            snapshot?: any;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            status: "pending" | "approved" | "rejected" | "offline";
            rejectReason: string;
            action: "offline" | "create" | "update" | "audit_approved" | "audit_rejected" | "online" | "reapply_online";
            timestamp: NativeDate;
            operatorId?: string | null | undefined;
            operatorRole?: "merchant" | "admin" | null | undefined;
            beforeStatus?: any;
            afterStatus?: any;
            snapshot?: any;
        }> & {
            status: "pending" | "approved" | "rejected" | "offline";
            rejectReason: string;
            action: "offline" | "create" | "update" | "audit_approved" | "audit_rejected" | "online" | "reapply_online";
            timestamp: NativeDate;
            operatorId?: string | null | undefined;
            operatorRole?: "merchant" | "admin" | null | undefined;
            beforeStatus?: any;
            afterStatus?: any;
            snapshot?: any;
        }>;
        roomTypes: mongoose.Types.DocumentArray<{
            name: string;
            photos: mongoose.Types.DocumentArray<{
                url?: string | null | undefined;
                isPrimary?: boolean | null | undefined;
                alt?: string | null | undefined;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
                url?: string | null | undefined;
                isPrimary?: boolean | null | undefined;
                alt?: string | null | undefined;
            }> & {
                url?: string | null | undefined;
                isPrimary?: boolean | null | undefined;
                alt?: string | null | undefined;
            }>;
            price: number;
            stock: number;
            tags: string[];
            capacity?: number | null | undefined;
            bedType?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            name: string;
            photos: mongoose.Types.DocumentArray<{
                url?: string | null | undefined;
                isPrimary?: boolean | null | undefined;
                alt?: string | null | undefined;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
                url?: string | null | undefined;
                isPrimary?: boolean | null | undefined;
                alt?: string | null | undefined;
            }> & {
                url?: string | null | undefined;
                isPrimary?: boolean | null | undefined;
                alt?: string | null | undefined;
            }>;
            price: number;
            stock: number;
            tags: string[];
            capacity?: number | null | undefined;
            bedType?: string | null | undefined;
        }> & {
            name: string;
            photos: mongoose.Types.DocumentArray<{
                url?: string | null | undefined;
                isPrimary?: boolean | null | undefined;
                alt?: string | null | undefined;
            }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
                url?: string | null | undefined;
                isPrimary?: boolean | null | undefined;
                alt?: string | null | undefined;
            }> & {
                url?: string | null | undefined;
                isPrimary?: boolean | null | undefined;
                alt?: string | null | undefined;
            }>;
            price: number;
            stock: number;
            tags: string[];
            capacity?: number | null | undefined;
            bedType?: string | null | undefined;
        }>;
        createTime: NativeDate;
        updateTime: NativeDate;
        nameEn?: string | null | undefined;
        address?: string | null | undefined;
        star?: number | null | undefined;
        openingDate?: string | null | undefined;
        phone?: string | null | undefined;
        completionStatus?: "rejected" | "draft" | "incomplete" | null | undefined;
        ownerId?: string | null | undefined;
    } & {
        _id: mongoose.Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, {
    name: string;
    version: number;
    photos: mongoose.Types.DocumentArray<{
        url?: string | null | undefined;
        isPrimary?: boolean | null | undefined;
        alt?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        url?: string | null | undefined;
        isPrimary?: boolean | null | undefined;
        alt?: string | null | undefined;
    }> & {
        url?: string | null | undefined;
        isPrimary?: boolean | null | undefined;
        alt?: string | null | undefined;
    }>;
    location: string[];
    amenities: string[];
    status: "pending" | "approved" | "rejected" | "offline";
    rejectReason: string;
    isActive: boolean;
    isDeleted: boolean;
    isIncomplete: boolean;
    auditHistory: mongoose.Types.DocumentArray<{
        status: "pending" | "approved" | "rejected" | "offline";
        rejectReason: string;
        action: "offline" | "create" | "update" | "audit_approved" | "audit_rejected" | "online" | "reapply_online";
        timestamp: NativeDate;
        operatorId?: string | null | undefined;
        operatorRole?: "merchant" | "admin" | null | undefined;
        beforeStatus?: any;
        afterStatus?: any;
        snapshot?: any;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        status: "pending" | "approved" | "rejected" | "offline";
        rejectReason: string;
        action: "offline" | "create" | "update" | "audit_approved" | "audit_rejected" | "online" | "reapply_online";
        timestamp: NativeDate;
        operatorId?: string | null | undefined;
        operatorRole?: "merchant" | "admin" | null | undefined;
        beforeStatus?: any;
        afterStatus?: any;
        snapshot?: any;
    }> & {
        status: "pending" | "approved" | "rejected" | "offline";
        rejectReason: string;
        action: "offline" | "create" | "update" | "audit_approved" | "audit_rejected" | "online" | "reapply_online";
        timestamp: NativeDate;
        operatorId?: string | null | undefined;
        operatorRole?: "merchant" | "admin" | null | undefined;
        beforeStatus?: any;
        afterStatus?: any;
        snapshot?: any;
    }>;
    roomTypes: mongoose.Types.DocumentArray<{
        name: string;
        photos: mongoose.Types.DocumentArray<{
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }> & {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }>;
        price: number;
        stock: number;
        tags: string[];
        capacity?: number | null | undefined;
        bedType?: string | null | undefined;
    } | {
        name: string;
        photos: mongoose.Types.DocumentArray<{
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }> & {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }>;
        price: number;
        stock: number;
        tags: string[];
        capacity?: number | null | undefined;
        bedType?: string | null | undefined;
        _id: string;
    } | {
        name: string;
        photos: mongoose.Types.DocumentArray<{
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }> & {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }>;
        price: number;
        stock: number;
        tags: string[];
        capacity?: number | null | undefined;
        bedType?: string | null | undefined;
        _id: string;
    }, mongoose.Types.Subdocument<string | mongoose.mongo.BSON.ObjectId, unknown, {
        name: string;
        photos: mongoose.Types.DocumentArray<{
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }> & {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }>;
        price: number;
        stock: number;
        tags: string[];
        capacity?: number | null | undefined;
        bedType?: string | null | undefined;
    } | {
        name: string;
        photos: mongoose.Types.DocumentArray<{
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }> & {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }>;
        price: number;
        stock: number;
        tags: string[];
        capacity?: number | null | undefined;
        bedType?: string | null | undefined;
        _id: string;
    } | {
        name: string;
        photos: mongoose.Types.DocumentArray<{
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }> & {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }>;
        price: number;
        stock: number;
        tags: string[];
        capacity?: number | null | undefined;
        bedType?: string | null | undefined;
        _id: string;
    }> & ({
        name: string;
        photos: mongoose.Types.DocumentArray<{
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }> & {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }>;
        price: number;
        stock: number;
        tags: string[];
        capacity?: number | null | undefined;
        bedType?: string | null | undefined;
    } | {
        name: string;
        photos: mongoose.Types.DocumentArray<{
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }> & {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }>;
        price: number;
        stock: number;
        tags: string[];
        capacity?: number | null | undefined;
        bedType?: string | null | undefined;
        _id: string;
    } | {
        name: string;
        photos: mongoose.Types.DocumentArray<{
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }> & {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }>;
        price: number;
        stock: number;
        tags: string[];
        capacity?: number | null | undefined;
        bedType?: string | null | undefined;
        _id: string;
    })>;
    createTime: NativeDate;
    updateTime: NativeDate;
    nameEn?: string | null | undefined;
    address?: string | null | undefined;
    star?: number | null | undefined;
    openingDate?: string | null | undefined;
    phone?: string | null | undefined;
    completionStatus?: "rejected" | "draft" | "incomplete" | null | undefined;
    ownerId?: string | null | undefined;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    name: string;
    version: number;
    photos: mongoose.Types.DocumentArray<{
        url?: string | null | undefined;
        isPrimary?: boolean | null | undefined;
        alt?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        url?: string | null | undefined;
        isPrimary?: boolean | null | undefined;
        alt?: string | null | undefined;
    }> & {
        url?: string | null | undefined;
        isPrimary?: boolean | null | undefined;
        alt?: string | null | undefined;
    }>;
    location: string[];
    amenities: string[];
    status: "pending" | "approved" | "rejected" | "offline";
    rejectReason: string;
    isActive: boolean;
    isDeleted: boolean;
    isIncomplete: boolean;
    auditHistory: mongoose.Types.DocumentArray<{
        status: "pending" | "approved" | "rejected" | "offline";
        rejectReason: string;
        action: "offline" | "create" | "update" | "audit_approved" | "audit_rejected" | "online" | "reapply_online";
        timestamp: NativeDate;
        operatorId?: string | null | undefined;
        operatorRole?: "merchant" | "admin" | null | undefined;
        beforeStatus?: any;
        afterStatus?: any;
        snapshot?: any;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
        status: "pending" | "approved" | "rejected" | "offline";
        rejectReason: string;
        action: "offline" | "create" | "update" | "audit_approved" | "audit_rejected" | "online" | "reapply_online";
        timestamp: NativeDate;
        operatorId?: string | null | undefined;
        operatorRole?: "merchant" | "admin" | null | undefined;
        beforeStatus?: any;
        afterStatus?: any;
        snapshot?: any;
    }> & {
        status: "pending" | "approved" | "rejected" | "offline";
        rejectReason: string;
        action: "offline" | "create" | "update" | "audit_approved" | "audit_rejected" | "online" | "reapply_online";
        timestamp: NativeDate;
        operatorId?: string | null | undefined;
        operatorRole?: "merchant" | "admin" | null | undefined;
        beforeStatus?: any;
        afterStatus?: any;
        snapshot?: any;
    }>;
    roomTypes: mongoose.Types.DocumentArray<{
        name: string;
        photos: mongoose.Types.DocumentArray<{
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }> & {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }>;
        price: number;
        stock: number;
        tags: string[];
        capacity?: number | null | undefined;
        bedType?: string | null | undefined;
    } | {
        name: string;
        photos: mongoose.Types.DocumentArray<{
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }> & {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }>;
        price: number;
        stock: number;
        tags: string[];
        capacity?: number | null | undefined;
        bedType?: string | null | undefined;
        _id: string;
    } | {
        name: string;
        photos: mongoose.Types.DocumentArray<{
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }> & {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }>;
        price: number;
        stock: number;
        tags: string[];
        capacity?: number | null | undefined;
        bedType?: string | null | undefined;
        _id: string;
    }, mongoose.Types.Subdocument<string | mongoose.mongo.BSON.ObjectId, unknown, {
        name: string;
        photos: mongoose.Types.DocumentArray<{
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }> & {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }>;
        price: number;
        stock: number;
        tags: string[];
        capacity?: number | null | undefined;
        bedType?: string | null | undefined;
    } | {
        name: string;
        photos: mongoose.Types.DocumentArray<{
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }> & {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }>;
        price: number;
        stock: number;
        tags: string[];
        capacity?: number | null | undefined;
        bedType?: string | null | undefined;
        _id: string;
    } | {
        name: string;
        photos: mongoose.Types.DocumentArray<{
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }> & {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }>;
        price: number;
        stock: number;
        tags: string[];
        capacity?: number | null | undefined;
        bedType?: string | null | undefined;
        _id: string;
    }> & ({
        name: string;
        photos: mongoose.Types.DocumentArray<{
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }> & {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }>;
        price: number;
        stock: number;
        tags: string[];
        capacity?: number | null | undefined;
        bedType?: string | null | undefined;
    } | {
        name: string;
        photos: mongoose.Types.DocumentArray<{
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }> & {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }>;
        price: number;
        stock: number;
        tags: string[];
        capacity?: number | null | undefined;
        bedType?: string | null | undefined;
        _id: string;
    } | {
        name: string;
        photos: mongoose.Types.DocumentArray<{
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, unknown, {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }> & {
            url?: string | null | undefined;
            isPrimary?: boolean | null | undefined;
            alt?: string | null | undefined;
        }>;
        price: number;
        stock: number;
        tags: string[];
        capacity?: number | null | undefined;
        bedType?: string | null | undefined;
        _id: string;
    })>;
    createTime: NativeDate;
    updateTime: NativeDate;
    nameEn?: string | null | undefined;
    address?: string | null | undefined;
    star?: number | null | undefined;
    openingDate?: string | null | undefined;
    phone?: string | null | undefined;
    completionStatus?: "rejected" | "draft" | "incomplete" | null | undefined;
    ownerId?: string | null | undefined;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
//# sourceMappingURL=Hotel.d.ts.map