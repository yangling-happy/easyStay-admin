import type { Request, Response, NextFunction } from "express";
interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: string;
    };
}
export declare const auth: (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export {};
//# sourceMappingURL=authMiddleware.d.ts.map