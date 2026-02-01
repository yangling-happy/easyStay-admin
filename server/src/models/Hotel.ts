import mongoose from 'mongoose';

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nameEn: { type: String, required: true },
  address: { type: String, required: true },
  star: { type: Number, enum: [1, 2, 3, 4, 5], required: true },
  openingDate: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejectReason: { type: String },
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  ownerId: { type: String, required: true },
  roomTypes: [{
    name: String,
    price: Number,
    stock: Number
  }],
  createTime: { type: Date, default: Date.now },
  updateTime: { type: Date, default: Date.now }
});

export const HotelModel = mongoose.model('Hotel', hotelSchema);