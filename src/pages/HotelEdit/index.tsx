import React, { useState, useEffect } from "react";
import { Card, Steps, Button, message, Form, Typography, Alert } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import HotelSelector from "./components/HotelSelector";
import BasicInfoForm from "./components/BasicInfoForm";
import RoomTypeFormList from "./components/RoomTypeFormList";
import HotelBatchImport from "./components/HotelBatchImport";
import { useHotelForm } from "./hooks/useHotelForm";
import { BASIC_INFO_FIELDS } from "./components/BasicInfoForm";
import { ROOM_TYPE_FIELDS } from "./components/RoomTypeFormList";

const HotelEdit: React.FC = () => {
  const { id: routeHotelId } = useParams();

  // 加载保存的步骤
  const loadSavedStep = () => {
    try {
      const stepKey = `hotel_edit_current_step_${routeHotelId ?? "new"}`;
      const step = localStorage.getItem(stepKey);
      return step ? parseInt(step, 10) : 0;
    } catch {
      return 0;
    }
  };

  const [current, setCurrent] = useState(loadSavedStep());
  const [showBatchImport, setShowBatchImport] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<string>("");
  const {
    form,
    handleSaveDraft,
    handleSubmitForReview,
    saveFormData,
    isSubmitting,
  } = useHotelForm({ routeHotelId });

  //保存当前步骤
  const saveStep = (step: number) => {
    const stepKey = `hotel_edit_current_step_${routeHotelId ?? "new"}`;
    localStorage.setItem(stepKey, step.toString());
    setCurrent(step);
  };

  //自动保存：每3秒保存一次表单数据到本地
  useEffect(() => {
    const interval = setInterval(() => {
      const values = form.getFieldsValue();
      saveFormData(values);
      // 更新最后保存时间
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
      setLastSaveTime(timeStr);
    }, 3000);

    return () => clearInterval(interval);
  }, [form, saveFormData]);

  // 页面离开前提示
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const values = form.getFieldsValue();
      const hasData = Object.values(values).some(
        (val) => val !== undefined && val !== null && val !== "",
      );

      if (hasData) {
        e.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [form]);

  const handleProceed = () => {
    saveStep(1);
  };

  // 分步骤验证
  const handleNext = async () => {
    try {
      if (current === 1) {
        await form.validateFields(BASIC_INFO_FIELDS);
      } else if (current === 2) {
        await form.validateFields(ROOM_TYPE_FIELDS);
      }

      // 保存当前数据
      const values = form.getFieldsValue();
      saveFormData(values);

      // 切换到下一步
      saveStep(current + 1);
    } catch (errorInfo) {
      console.log("表单校验未通过:", errorInfo);
      message.error("请完善当前页面的必填信息");
    }
  };

  // 上一步处理
  const handlePrev = () => {
    const values = form.getFieldsValue();
    saveFormData(values);
    saveStep(current - 1);
  };

  // 处理批量创建入口
  const handleBatchCreate = () => {
    setShowBatchImport(true);
  };

  // 处理批量导入取消
  const handleBatchImportCancel = () => {
    setShowBatchImport(false);
  };
  return (
    <>
      <Card className="hotel-edit-container">
        <Steps
          current={current}
          items={[
            { title: "认领/选择" },
            { title: "基本信息" },
            { title: "房型配置" },
          ]}
          style={{ marginBottom: 40 }}
        />

        {/*关键：监听表单变化自动保存 */}
        <Form
          form={form}
          layout="vertical"
          onValuesChange={(_, allValues) => {
            // 表单变化时自动保存（防抖在 saveFormData 中实现）
            saveFormData(allValues);
          }}
        >
          {/* 第0步 */}
          <div style={{ display: current === 0 ? "block" : "none" }}>
            <HotelSelector form={form} onAction={handleProceed} />
            {/* 批量创建入口 */}
            <div style={{ marginBottom: 30, textAlign: "center" }}>
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                size="large"
                onClick={handleBatchCreate}
                style={{ marginBottom: 20 }}
              >
                批量创建酒店
              </Button>
              <Typography.Paragraph type="secondary">
                点击按钮进入批量创建模式，支持一次性导入多个酒店及其房型
              </Typography.Paragraph>
            </div>
          </div>

          {/* 第1步：基础信息 */}
          <div style={{ display: current === 1 ? "block" : "none" }}>
            <Alert
              message=" 温馨提示"
              description={
                <div>
                  <p style={{ marginBottom: 8 }}>
                    • <strong>自动保存</strong>
                    ：系统每3秒自动保存表单数据到本地，防止数据丢失
                  </p>
                  <p style={{ marginBottom: 8 }}>
                    • <strong>保存草稿</strong>
                    ：保存当前进度到服务器，可随时在"待完善酒店"列表中继续编辑（最低要求：酒店名称）
                  </p>
                  <p style={{ marginBottom: 0 }}>
                    • <strong>下一步</strong>
                    ：验证当前页面必填信息后，进入房型配置步骤
                  </p>
                  {lastSaveTime && (
                    <p
                      style={{
                        marginTop: 8,
                        marginBottom: 0,
                        color: "#52c41a",
                      }}
                    >
                      最后自动保存时间：{lastSaveTime}
                    </p>
                  )}
                </div>
              }
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <BasicInfoForm />
          </div>

          {/* 第2步：房型配置 */}
          <div style={{ display: current === 2 ? "block" : "none" }}>
            <Alert
              message=" 温馨提示"
              description={
                <div>
                  <p style={{ marginBottom: 8 }}>
                    • <strong>自动保存</strong>
                    ：系统每3秒自动保存表单数据到本地，防止数据丢失
                  </p>
                  <p style={{ marginBottom: 8 }}>
                    • <strong>保存草稿</strong>
                    ：保存当前进度到服务器，可随时继续编辑（最低要求：酒店名称）
                  </p>
                  <p style={{ marginBottom: 0 }}>
                    • <strong>提交审核</strong>
                    ：必须填写完整所有必填信息（酒店照片、房型配置和房型照片）
                  </p>
                  {lastSaveTime && (
                    <p
                      style={{
                        marginTop: 8,
                        marginBottom: 0,
                        color: "#52c41a",
                      }}
                    >
                      最后自动保存时间：{lastSaveTime}
                    </p>
                  )}
                </div>
              }
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <RoomTypeFormList />
          </div>
        </Form>

        <div
          className="step-actions"
          style={{
            marginTop: 30,
            textAlign: "center",
            paddingTop: 20,
          }}
        >
          {current > 0 && (
            <Button style={{ margin: "0 8px" }} onClick={handlePrev}>
              上一步
            </Button>
          )}

          {/* 第1步：基础信息，可以保存草稿或下一步 */}
          {current === 1 && (
            <>
              <Button
                style={{ margin: "0 8px" }}
                onClick={handleSaveDraft}
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                保存草稿
              </Button>
              <Button type="primary" onClick={handleNext}>
                下一步
              </Button>
            </>
          )}

          {/* 第2步：房型配置，可以保存草稿或继续下一步 */}
          {current === 2 && (
            <>
              <Button
                style={{ margin: "0 8px" }}
                onClick={handleSaveDraft}
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                保存草稿
              </Button>
              <Button
                type="primary"
                onClick={handleSubmitForReview}
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                提交审核
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* 批量导入模态框 */}
      {showBatchImport && (
        <Card
          title="批量创建酒店"
          className="batch-import-modal"
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1001,
            width: "90%",
            maxWidth: 1200,
            maxHeight: "90vh",
            overflow: "auto",
          }}
          extra={<Button onClick={handleBatchImportCancel}>关闭</Button>}
        >
          <HotelBatchImport />
        </Card>
      )}

      {/* 背景遮罩 */}
      {showBatchImport && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1000,
          }}
          onClick={handleBatchImportCancel}
        />
      )}
    </>
  );
};

export default HotelEdit;
