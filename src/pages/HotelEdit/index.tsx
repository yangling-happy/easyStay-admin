import React, { useState } from "react";
import { Card, Steps, Button, message, Form } from "antd";
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

  // 分步骤验证
  const handleNext = async () => {
    try {
      if (current === 1) {
        // 验证基本信息
        await form.validateFields(['name', 'nameEn', 'address', 'star', 'openingDate']);
      } else if (current === 2) {
        // 验证房型
        await form.validateFields(['roomTypes']);
      }
      setCurrent(current + 1);
    } catch (errorInfo) {
      console.log("表单校验未通过:", errorInfo);
      message.error("请完善当前页面的必填信息");
    }
  };

  return (
    <Card className="hotel-edit-container">
      <Steps
        current={current}
        items={[
          { title: "认领/选择" },
          { title: "基本信息" },
          { title: "房型配置" }
        ]}
        style={{ marginBottom: 40 }}
      />

      {/* 关键：一个Form包裹所有内容 */}
      <Form form={form} layout="vertical">
        {/* 第0步 */}
        <div style={{ display: current === 0 ? 'block' : 'none' }}>
          <HotelSelector form={form} onAction={handleProceed} />
        </div>
        
        {/* 第1步：BasicInfoForm - 不传递form参数 */}
        <div style={{ display: current === 1 ? 'block' : 'none' }}>
          <BasicInfoForm />
        </div>
        
        {/* 第2步：RoomTypeFormList - 不传递form参数 */}
        <div style={{ display: current === 2 ? 'block' : 'none' }}>
          <RoomTypeFormList />
        </div>
      </Form>

      {/* 添加调试按钮
      <div style={{ marginTop: 10, textAlign: 'center' }}>
        <Button 
          size="small" 
          onClick={() => {
            const values = form.getFieldsValue();
            console.log('当前步骤表单值:', values);
            console.log('当前步骤:', current);
          }}
        >
          调试表单状态
        </Button>
      </div> */}

      <div
        className="step-actions"
        style={{
          marginTop: 30,
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