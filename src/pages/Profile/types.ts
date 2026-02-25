// pages/profile/types.ts
export interface UserInfo {
  id?: string;
  username: string;
  email: string;
  role: "merchant" | "admin";
  hotelName?: string; // 商户特有
  contactPhone?: string; // 商户特有
  department?: string; // 管理员特有
  createdAt?: string;
  lastLogin?: string;
  phone?: string; // 可选的通用字段
}

// 表单字段配置
export interface FormField {
  name: keyof UserInfo;
  label: string;
  type: "text" | "email" | "tel" | "password";
  required?: boolean;
  placeholder?: string;
  roles?: ("merchant" | "admin")[]; // 允许的角色
  rules?: any[]; // 表单验证规则
}

// 根据角色获取对应的表单字段
export const getFormFieldsByRole = (
  role: "merchant" | "admin",
): FormField[] => {
  const commonFields: FormField[] = [
    {
      name: "username",
      label: "用户名",
      type: "text",
      required: true,
      placeholder: "请输入用户名",
      rules: [
        { required: true, message: "请输入用户名" },
        { min: 3, message: "用户名至少3个字符" },
        { max: 20, message: "用户名最多20个字符" },
      ],
    },
    {
      name: "email",
      label: "邮箱",
      type: "email",
      required: true,
      placeholder: "请输入邮箱",
      rules: [
        { required: true, message: "请输入邮箱" },
        { type: "email", message: "请输入有效的邮箱地址" },
      ],
    },
  ];

  const merchantFields: FormField[] = [
    {
      name: "hotelName",
      label: "酒店名称",
      type: "text",
      required: true,
      placeholder: "请输入酒店名称",
      rules: [{ required: true, message: "请输入酒店名称" }],
      roles: ["merchant"],
    },
    {
      name: "contactPhone",
      label: "联系电话",
      type: "tel",
      required: true,
      placeholder: "请输入酒店联系电话",
      rules: [
        { required: true, message: "请输入联系电话" },
        { pattern: /^1[3-9]\d{9}$/, message: "请输入有效的手机号" },
      ],
      roles: ["merchant"],
    },
  ];

  const adminFields: FormField[] = [
    {
      name: "department",
      label: "部门",
      type: "text",
      required: true,
      placeholder: "请输入部门",
      rules: [{ required: true, message: "请输入部门" }],
      roles: ["admin"],
    },
  ];

  // 过滤掉密码字段（资料页面一般不需要显示密码）
  const fields = [...commonFields];

  if (role === "merchant") {
    fields.push(...merchantFields);
  } else if (role === "admin") {
    fields.push(...adminFields);
  }

  return fields;
};
