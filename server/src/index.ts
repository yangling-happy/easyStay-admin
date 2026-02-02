import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import hotelRoutes from './routes/hotelRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 数据库连接
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/easyStay';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// 基础路由测试
app.get('/health', (req, res) => res.send('API is running...'));

// 添加酒店路由
app.use('/api/hotels', hotelRoutes);
// 添加上传路由
app.use('/api/upload', uploadRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
});