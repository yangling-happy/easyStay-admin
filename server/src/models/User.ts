import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password: string;
  role: "merchant" | "admin";
  // 商户基本信息
  hotelName?: string; // 商户的公司/酒店集团名称
  contactPhone?: string; // 联系电话
  // 管理员信息
  department?: string;
  // 账号状态
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
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
  },
  {
    timestamps: true,
  },
);

export const User = mongoose.model<IUser>("User", UserSchema);
