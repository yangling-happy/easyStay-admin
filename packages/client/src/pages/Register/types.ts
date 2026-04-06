// src/pages/Register/types.ts
export interface FormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'merchant' | 'admin';
  hotelName?: string;
  contactPhone?: string;
  department?: string;
}

export interface RegisterStepProps {
  selectedRole: 'merchant' | 'admin';
  setSelectedRole: (role: 'merchant' | 'admin') => void;
  form?: any;
  onFinish?: (values: FormValues) => Promise<void>;
  loading?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
}