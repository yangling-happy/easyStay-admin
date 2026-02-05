import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema({
  // 基本信息
  name: {
    type: String,
    required: true,
    trim: true,
  },
  nameEn: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },

  // 等级信息
  star: {
    type: Number,
    enum: [1, 2, 3, 4, 5],
    required: true,
  },
  openingDate: {
    type: String,
    required: true,
  },

  // 酒店整体照片（新增）
  photos: [
    {
      type: String,
      default: [],
    },
  ],

  // 扩展信息
  nearbyInfo: {
    type: String,
    default: "",
  },

  // 审核状态
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  rejectReason: {
    type: String,
    default: "",
  },

  // 系统字段
  isActive: {
    type: Boolean,
    default: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  ownerId: {
    type: String,
    required: false,
  },

  // 房型配置
  roomTypes: [
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      price: {
        type: Number,
        required: true,
        min: 0, // 价格不能为负数
      },
      stock: {
        type: Number,
        required: true,
        min: 0, // 库存不能为负数
        default: 0,
      },
      // 房型专属照片
      photos: [
        {
          type: String,
          default: [],
        },
      ],
    },
  ],

  // 时间戳
  createTime: {
    type: Date,
    default: Date.now,
  },
  updateTime: {
    type: Date,
    default: Date.now,
  },
});

hotelSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret: any) {
    // 将 _id 转换为 id
    if (ret._id) {
      ret.id = ret._id.toString();
      delete ret._id;
    }
    // 删除 MongoDB 版本号字段
    if (ret.__v !== undefined) {
      delete ret.__v;
    }
    return ret;
  },
});

export const HotelModel = mongoose.model("Hotel", hotelSchema);
