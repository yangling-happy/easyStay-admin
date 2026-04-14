import type { Request, Response } from "express";
import { User } from "../models/User.js";
import {
  buildUserResponse,
  comparePassword,
  decodeTokenFromHeader,
  ensureUniqueUsernameAndEmail,
  generateToken,
  hashPassword,
  isValidEmail,
} from "../services/authService.js";

function handleJwtError(error: any, res: Response) {
  if (error?.name === "JsonWebTokenError") {
    return res.status(401).json({ success: false, message: "Token无效" });
  }

  if (error?.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, message: "Token已过期" });
  }

  return null;
}

export async function register(req: Request, res: Response) {
  try {
    const {
      username,
      email,
      password,
      role = "merchant",
      hotelName,
      contactPhone,
      department,
    } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "用户名、邮箱和密码不能为空",
      });
    }

    if (!isValidEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "邮箱格式不正确" });
    }

    if (!["merchant", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "角色只能是 merchant 或 admin",
      });
    }

    if (role === "merchant" && (!hotelName || !contactPhone)) {
      return res.status(400).json({
        success: false,
        message: "商户必须提供公司/酒店名称和联系电话",
      });
    }

    if (role === "admin" && !department) {
      return res.status(400).json({
        success: false,
        message: "管理员必须提供部门",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "密码至少6位" });
    }

    const uniqueError = await ensureUniqueUsernameAndEmail(username, email);
    if (uniqueError) {
      return res.status(400).json({ success: false, message: uniqueError });
    }

    const hashedPassword = await hashPassword(password);

    const userData: any = {
      username,
      email,
      password: hashedPassword,
      role,
      isActive: true,
    };

    if (role === "merchant") {
      userData.hotelName = hotelName;
      userData.contactPhone = contactPhone;
    }

    if (role === "admin") {
      userData.department = department;
    }

    const user = await User.create(userData);
    const token = generateToken(user._id.toString(), user.role);

    return res.status(201).json({
      success: true,
      message: "注册成功",
      data: {
        user: buildUserResponse(user),
        token,
      },
    });
  } catch (error: any) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field === "username" ? "用户名" : "邮箱"}已存在`,
      });
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(
        (err: any) => err.message,
      );
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    return res.status(500).json({ success: false, message: "服务器内部错误" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ success: false, message: "用户名和密码不能为空" });
    }

    const user = await User.findOne({ username }).select("+password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "用户名或密码错误" });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "账号已被禁用，请联系管理员",
      });
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return res
        .status(401)
        .json({ success: false, message: "用户名或密码错误" });
    }

    const token = generateToken(user._id.toString(), user.role);
    return res.json({
      success: true,
      message: "登录成功",
      data: {
        user: buildUserResponse(user),
        token,
      },
    });
  } catch {
    return res.status(500).json({ success: false, message: "服务器内部错误" });
  }
}

export async function getMe(req: Request, res: Response) {
  try {
    const decoded = decodeTokenFromHeader(req.headers.authorization);
    if (!decoded) {
      return res.status(401).json({ success: false, message: "请先登录" });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "用户不存在" });
    }

    return res.json({
      success: true,
      data: { user: buildUserResponse(user) },
    });
  } catch (error: any) {
    const jwtResponse = handleJwtError(error, res);
    if (jwtResponse) return jwtResponse;
    return res.status(500).json({ success: false, message: "服务器内部错误" });
  }
}

export async function updateMe(req: Request, res: Response) {
  try {
    const decoded = decodeTokenFromHeader(req.headers.authorization);
    if (!decoded) {
      return res.status(401).json({ success: false, message: "请先登录" });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "用户不存在" });
    }

    const { username, email, hotelName, contactPhone, department } = req.body;

    if (email && !isValidEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "邮箱格式不正确" });
    }

    if (typeof username === "string" && username !== user.username) {
      const existing = await User.findOne({ username, _id: { $ne: user._id } });
      if (existing) {
        return res
          .status(400)
          .json({ success: false, message: "用户名已存在" });
      }
      user.username = username;
    }

    if (typeof email === "string" && email !== user.email) {
      const existing = await User.findOne({ email, _id: { $ne: user._id } });
      if (existing) {
        return res.status(400).json({ success: false, message: "邮箱已存在" });
      }
      user.email = email;
    }

    if (user.role === "merchant") {
      if (hotelName !== undefined) user.hotelName = hotelName;
      if (contactPhone !== undefined) user.contactPhone = contactPhone;
      if (!user.hotelName || !user.contactPhone) {
        return res.status(400).json({
          success: false,
          message: "商户必须提供公司/酒店名称和联系电话",
        });
      }
    }

    if (user.role === "admin") {
      if (department !== undefined) user.department = department;
      if (!user.department) {
        return res.status(400).json({
          success: false,
          message: "管理员必须提供部门",
        });
      }
    }

    const saved = await user.save();
    return res.json({
      success: true,
      message: "更新成功",
      data: { user: buildUserResponse(saved) },
    });
  } catch (error: any) {
    const jwtResponse = handleJwtError(error, res);
    if (jwtResponse) return jwtResponse;

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field === "username" ? "用户名" : "邮箱"}已存在`,
      });
    }

    return res.status(500).json({ success: false, message: "服务器内部错误" });
  }
}

export async function changePassword(req: Request, res: Response) {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "原密码和新密码不能为空",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "新密码至少6位" });
    }

    const decoded = decodeTokenFromHeader(req.headers.authorization);
    if (!decoded) {
      return res.status(401).json({ success: false, message: "请先登录" });
    }

    const user = await User.findById(decoded.userId).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, message: "用户不存在" });
    }

    const isValid = await comparePassword(oldPassword, user.password);
    if (!isValid) {
      return res.status(400).json({ success: false, message: "原密码不正确" });
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    return res.json({ success: true, message: "密码修改成功" });
  } catch (error: any) {
    const jwtResponse = handleJwtError(error, res);
    if (jwtResponse) return jwtResponse;
    return res.status(500).json({ success: false, message: "服务器内部错误" });
  }
}
