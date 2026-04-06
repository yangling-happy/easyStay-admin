import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

// 扩展 Express 的 Request 类型，以便我们可以把 user 挂载上去
interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // 1. 从请求头获取 Token (格式通常为: Bearer <token>)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "未授权，请先登录" });
    }

    const token = authHeader.split(" ")[1];

    // 2. 验证 Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // 3. 将解析出来的用户信息挂载到 req 对象上
    // 这样后面的路由（比如创建酒店）就可以直接拿到 req.user.userId
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next(); // 校验通过，放行！
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Token 无效或已过期" });
  }
};
