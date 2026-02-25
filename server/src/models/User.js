import mongoose, { Schema, Document } from "mongoose";
const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    role: {
        type: String,
        enum: ["merchant", "admin"],
        default: "merchant",
    },
    // 商户注册时的基本信息（不是具体的酒店信息）
    hotelName: {
        type: String,
        required: function () {
            return this.role === "merchant";
        },
    },
    contactPhone: {
        type: String,
        required: function () {
            return this.role === "merchant";
        },
    },
    // 管理员信息
    department: {
        type: String,
        required: function () {
            return this.role === "admin";
        },
    },
    // 账号状态（是否可用）
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});
export const User = mongoose.model("User", UserSchema);
//# sourceMappingURL=User.js.map