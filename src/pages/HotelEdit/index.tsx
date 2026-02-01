import React, { useState } from "react";
import { Card, Steps, Button, message } from "antd";
import HotelSelector from "./components/HotelSelector";
import BasicInfoForm from "./components/BasicInfoForm";
import RoomTypeFormList from "./components/RoomTypeFormList";
import { useHotelForm } from "./hooks/useHotelForm";

const HotelEdit: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const { form, handleSave } = useHotelForm();

  const handleProceed = () => {
    setCurrent(1);
  };

  const handleNext = async () => {
    try {
      await form.validateFields();
      setCurrent(current + 1);
    } catch (errorInfo) {
      console.log("表单校验未通过:", errorInfo);
      message.error("请完善当前页面的必填信息");
    }
  };

  const steps = [
    {
      title: "认领/选择",
      content: <HotelSelector form={form} onAction={handleProceed} />,
    },
    {
      title: "基本信息",
      content: <BasicInfoForm form={form} />,
    },
    {
      title: "房型配置",
      content: <RoomTypeFormList form={form} />,
    },
  ];

  return (
    <Card className="hotel-edit-container">
      <Steps
        current={current}
        items={steps.map((s) => ({ title: s.title }))}
        style={{ marginBottom: 40 }}
      />

      <div className="step-content" style={{ minHeight: "300px" }}>
        {steps[current].content}
      </div>

      <div
        className="step-actions"
        style={{
          marginTop: 40,
          textAlign: "center",
          borderTop: "1px solid #f0f0f0",
          paddingTop: 20,
        }}
      >
        {current > 0 && (
          <Button
            style={{ margin: "0 8px" }}
            onClick={() => setCurrent(current - 1)}
          >
            上一步
          </Button>
        )}

        {current === 1 && (
          <Button type="primary" onClick={handleNext}>
            下一步
          </Button>
        )}

        {current === 2 && (
          <Button type="primary" onClick={handleSave}>
            完成并提交审核
          </Button>
        )}
      </div>
    </Card>
  );
};

export default HotelEdit;
