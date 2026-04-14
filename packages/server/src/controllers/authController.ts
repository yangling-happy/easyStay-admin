import type { NextFunction, Request, Response } from "express";
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
import { logger } from "../services/logger.js";
import { AppError } from "../middleware/errorMiddleware.js";

function mapJwtError(error: any) {
  if (error?.name === "JsonWebTokenError") {
    return new AppError("Token无效", 401);
  }

  if (error?.name === "TokenExpiredError") {
    return new AppError("Token已过期", 401);
  }

  return null;
}

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
) {
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
      return next(new AppError("用户名、邮箱和密码不能为空", 400));
    }

    if (!isValidEmail(email)) {
      return next(new AppError("邮箱格式不正确", 400));
    }

    if (!["merchant", "admin"].includes(role)) {
      return next(new AppError("角色只能是 merchant 或 admin", 400));
    }

    if (role === "merchant" && (!hotelName || !contactPhone)) {
      return next(new AppError("商户必须提供公司/酒店名称和联系电话", 400));
    }

    if (role === "admin" && !department) {
      return next(new AppError("管理员必须提供部门", 400));
    }

    if (password.length < 6) {
      return next(new AppError("密码至少6位", 400));
    }

    const uniqueError = await ensureUniqueUsernameAndEmail(username, email);
    if (uniqueError) {
      return next(new AppError(uniqueError, 400));
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
    logger.error("注册失败", error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return next(
        new AppError(`${field === "username" ? "用户名" : "邮箱"}已存在`, 400),
      );
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(
        (err: any) => err.message,
      );
      return next(new AppError(messages.join(", "), 400));
    }

    return next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return next(new AppError("用户名和密码不能为空", 400));
    }

    const user = await User.findOne({ username }).select("+password");
    if (!user) {
      return next(new AppError("用户名或密码错误", 401));
    }

    if (user.isActive === false) {
      return next(new AppError("账号已被禁用，请联系管理员", 403));
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return next(new AppError("用户名或密码错误", 401));
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
  } catch (error) {
    logger.error("登录失败", error);
    return next(error);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const decoded = decodeTokenFromHeader(req.headers.authorization);
    if (!decoded) {
      return next(new AppError("请先登录", 401));
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return next(new AppError("用户不存在", 404));
    }

    return res.json({
      success: true,
      data: { user: buildUserResponse(user) },
    });
  } catch (error: any) {
    const jwtError = mapJwtError(error);
    if (jwtError) return next(jwtError);
    return next(error);
  }
}

export async function updateMe(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const decoded = decodeTokenFromHeader(req.headers.authorization);
    if (!decoded) {
      return next(new AppError("请先登录", 401));
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return next(new AppError("用户不存在", 404));
    }

    const { username, email, hotelName, contactPhone, department } = req.body;

    if (email && !isValidEmail(email)) {
      return next(new AppError("邮箱格式不正确", 400));
    }

    if (typeof username === "string" && username !== user.username) {
      const existing = await User.findOne({ username, _id: { $ne: user._id } });
      if (existing) {
        return next(new AppError("用户名已存在", 400));
      }
      user.username = username;
    }

    if (typeof email === "string" && email !== user.email) {
      const existing = await User.findOne({ email, _id: { $ne: user._id } });
      if (existing) {
        return next(new AppError("邮箱已存在", 400));
      }
      user.email = email;
    }

    if (user.role === "merchant") {
      if (hotelName !== undefined) user.hotelName = hotelName;
      if (contactPhone !== undefined) user.contactPhone = contactPhone;
      if (!user.hotelName || !user.contactPhone) {
        return next(new AppError("商户必须提供公司/酒店名称和联系电话", 400));
      }
    }

    if (user.role === "admin") {
      if (department !== undefined) user.department = department;
      if (!user.department) {
        return next(new AppError("管理员必须提供部门", 400));
      }
    }

    const saved = await user.save();
    return res.json({
      success: true,
      message: "更新成功",
      data: { user: buildUserResponse(saved) },
    });
  } catch (error: any) {
    logger.error("更新用户信息失败", error);
    const jwtError = mapJwtError(error);
    if (jwtError) return next(jwtError);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return next(
        new AppError(`${field === "username" ? "用户名" : "邮箱"}已存在`, 400),
      );
    }

    return next(error);
  }
}

export async function changePassword(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return next(new AppError("原密码和新密码不能为空", 400));
    }

    if (newPassword.length < 6) {
      return next(new AppError("新密码至少6位", 400));
    }

    const decoded = decodeTokenFromHeader(req.headers.authorization);
    if (!decoded) {
      return next(new AppError("请先登录", 401));
    }

    const user = await User.findById(decoded.userId).select("+password");
    if (!user) {
      return next(new AppError("用户不存在", 404));
    }

    const isValid = await comparePassword(oldPassword, user.password);
    if (!isValid) {
      return next(new AppError("原密码不正确", 400));
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    return res.json({ success: true, message: "密码修改成功" });
  } catch (error: any) {
    logger.error("修改密码失败", error);
    const jwtError = mapJwtError(error);
    if (jwtError) return next(jwtError);
    return next(error);
  }
}
