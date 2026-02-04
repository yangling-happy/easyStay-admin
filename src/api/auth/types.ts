export interface RegisterParams {
  username: string;
  email: string;
  password: string;
  role: "merchant" | "admin";
  hotelName?: string;
  contactPhone?: string;
  department?: string;
}

export interface LoginParams {
  username: string;
  password: string;
}

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  role: "merchant" | "admin";
  hotelName?: string;
  contactPhone?: string;
  department?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: UserInfo;
    token: string;
  };
}

export interface MeResponse {
  success: boolean;
  data: {
    user: UserInfo;
  };
}
