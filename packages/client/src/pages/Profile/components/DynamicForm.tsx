// components/DynamicForm.tsx
import React from "react";
import { Form, Input } from "antd";
import type { FormField } from "../types";

interface DynamicFormProps {
  fields: FormField[];
  form: any;
  isEditing: boolean;
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  fields,
  form,
  isEditing,
}) => {
  const renderFormItem = (field: FormField) => {
    const { type, placeholder } = field;

    const inputProps = {
      placeholder,
      disabled: !isEditing, // 非编辑模式下禁用
    };

    switch (type) {
      case "email":
        return <Input {...inputProps} type="email" />;
      case "tel":
        return <Input {...inputProps} type="tel" />;
      case "password":
        return <Input.Password {...inputProps} />;
      default:
        return <Input {...inputProps} />;
    }
  };

  return (
    <Form form={form} layout="vertical">
      {fields.map((field) => (
        <Form.Item
          key={field.name}
          name={field.name}
          label={field.label}
          rules={field.rules}
          initialValue={form.getFieldValue(field.name) || ""}
        >
          {renderFormItem(field)}
        </Form.Item>
      ))}
    </Form>
  );
};

export default DynamicForm;
