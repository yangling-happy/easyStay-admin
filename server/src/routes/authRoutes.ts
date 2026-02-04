import express from "express";
import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// 辅助函数：生成Token
const generateToken = (userId: string, role: string) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });
};

// 1. 注册接口 - 直接注册，无需审核
router.post("/register", async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      role = "merchant",
      hotelName, // 商户的公司名称
      contactPhone, // 联系电话
      department, // 管理员部门
    } = req.body;

    console.log("注册请求:", { username, email, role });

    // 基础验证
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "用户名、邮箱和密码不能为空",
      });
    }

    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "邮箱格式不正确",
      });
    }

    // 角色验证
    if (!["merchant", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "角色只能是 merchant 或 admin",
      });
    }

    // 根据角色验证必要字段
    if (role === "merchant") {
      if (!hotelName) {
        return res.status(400).json({
          success: false,
          message: "商户必须提供公司/酒店名称",
        });
      }
      if (!contactPhone) {
        return res.status(400).json({
          success: false,
          message: "商户必须提供联系电话",
        });
      }
    }

    if (role === "admin") {
      if (!department) {
        return res.status(400).json({
          success: false,
          message: "管理员必须提供部门信息",
        });
      }
    }

    // 检查重复用户
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "用户名或邮箱已被注册",
      });
    }

    // 密码强度检查（可选）
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "密码至少6位",
      });
    }

    // 哈希密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 创建用户数据
    const userData: any = {
      username,
      email,
      password: hashedPassword,
      role,
      isActive: true, // 账号直接激活
    };

    // 添加角色特有字段
    if (role === "merchant") {
      userData.hotelName = hotelName;
      userData.contactPhone = contactPhone;
    }

    if (role === "admin") {
      userData.department = department;
    }

    // 保存到数据库
    const user = await User.create(userData);

    // 生成Token
    const token = generateToken(user._id.toString(), user.role);

    // 返回用户信息（不包含密码）
    const userResponse: any = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };

    // 添加角色特有信息
    if (user.role === "merchant") {
      userResponse.hotelName = user.hotelName;
      userResponse.contactPhone = user.contactPhone;
    }

    if (user.role === "admin") {
      userResponse.department = user.department;
    }

    res.status(201).json({
      success: true,
      message: "注册成功",
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error: any) {
    console.error("注册错误:", error);

    // MongoDB重复键错误
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field === "username" ? "用户名" : "邮箱"}已存在`,
      });
    }

    // 验证错误
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(
        (err: any) => err.message,
      );
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "服务器内部错误",
    });
  }
});

// 2. 登录接口 - 直接登录，不检查审核状态
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log("登录请求:", username);

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "用户名和密码不能为空",
      });
    }

    // 查找用户（包含密码字段）
    const user = await User.findOne({ username }).select("+password");

    if (!user) {
      // 安全：统一错误提示
      return res.status(401).json({
        success: false,
        message: "用户名或密码错误",
      });
    }

    // 检查账号是否被禁用
    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "账号已被禁用，请联系管理员",
      });
    }

    // 验证密码
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "用户名或密码错误",
      });
    }

    // 生成Token
    const token = generateToken(user._id.toString(), user.role);

    // 构建响应数据
    const userResponse: any = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };

    // 添加角色特有信息
    if (user.role === "merchant") {
      userResponse.hotelName = user.hotelName;
      userResponse.contactPhone = user.contactPhone;
    }

    if (user.role === "admin") {
      userResponse.department = user.department;
    }

    res.json({
      success: true,
      message: "登录成功",
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error: any) {
    console.error("登录错误:", error);
    res.status(500).json({
      success: false,
      message: "服务器内部错误",
    });
  }
});

// 3. 获取当前用户信息
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "请先登录",
      });
    }

    const token = authHeader.split(" ")[1];

    // 验证Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // 查找用户
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "用户不存在",
      });
    }

    // 构建响应
    const userResponse: any = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    };

    if (user.role === "merchant") {
      userResponse.hotelName = user.hotelName;
      userResponse.contactPhone = user.contactPhone;
    }

    if (user.role === "admin") {
      userResponse.department = user.department;
    }

    res.json({
      success: true,
      data: { user: userResponse },
    });
  } catch (error: any) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token无效",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token已过期",
      });
    }

    res.status(500).json({
      success: false,
      message: "服务器内部错误",
    });
  }
});

export default router;
