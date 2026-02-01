import React, { useState } from "react";
import { Card, Steps, Button } from "antd";
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
    <Card bordered={false} className="hotel-edit-container">
      <Steps
        current={current}
        items={steps.map((s) => ({ title: s.title }))}
        style={{ marginBottom: 40 }}
      />

      <div className="step-content">{steps[current].content}</div>

      <div
        className="step-actions"
        style={{ marginTop: 40, textAlign: "center" }}
      >
        {current > 0 && current < steps.length && (
          <Button
            style={{ margin: "0 8px" }}
            onClick={() => setCurrent(current - 1)}
          >
            上一步
          </Button>
        )}
        {current === 1 && (
          <Button type="primary" onClick={handleSave}>
            提交
          </Button>
        )}
      </div>
    </Card>
  );
};

export default HotelEdit;
