import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";

export function generateToken(userId: string, role: string) {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });
}

export function isValidEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function buildUserResponse(user: any) {
  const userResponse: any = {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };

  if (user.role === "merchant") {
    userResponse.hotelName = user.hotelName;
    userResponse.contactPhone = user.contactPhone;
  }

  if (user.role === "admin") {
    userResponse.department = user.department;
  }

  return userResponse;
}

export function decodeTokenFromHeader(authHeader?: string) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  return jwt.verify(token, process.env.JWT_SECRET!) as any;
}

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(
  rawPassword: string,
  hashedPassword: string,
) {
  return bcrypt.compare(rawPassword, hashedPassword);
}

export async function ensureUniqueUsernameAndEmail(
  username: string,
  email: string,
) {
  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    return "用户名或邮箱已被注册";
  }

  return null;
}
