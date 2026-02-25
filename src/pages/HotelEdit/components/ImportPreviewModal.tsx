/**
 * ImportPreviewModal 组件
 * 功能：显示批量导入的预览、结果和验证错误信息
 * 版本：1.0.0
 * 日期：2026-02-24
 */

import React from "react";
import { Modal, Table, Tag, Button, Space, Card, Typography } from "antd";
import {
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import type { ValidationError, ImportResult } from "../batchImport/types";
import type { Hotel } from "../../../types/hotel";

interface ImportPreviewModalProps {
  /** 控制弹窗显示/隐藏 */
  visible: boolean;
  /** 预览数据 */
  previewData: any[];
  /** 导入结果 */
  importResults: ImportResult[];
  /** 验证错误信息 */
  validationErrors: ValidationError[];
  /** 关闭弹窗的回调函数 */
  onCancel: () => void;
  /** 导入的酒店数据 */
  hotels?: Hotel[];
}

const ImportPreviewModal: React.FC<ImportPreviewModalProps> = ({
  visible,
  previewData,
  importResults,
  validationErrors,
  onCancel,
  hotels,
}) => {
  const navigate = useNavigate();

  console.log("ImportPreviewModal渲染:", {
    visible,
    importResults,
    validationErrors,
    previewData,
  });

  /**
   * 酒店数据预览列配置
   */
  const previewColumns = [
    {
      title: "酒店中文名",
      dataIndex: "酒店中文名",
      key: "hotelName",
      width: 150,
    },
    {
      title: "房型名称",
      dataIndex: "房型名称",
      key: "roomTypeName",
      width: 120,
    },
    {
      title: "价格",
      dataIndex: "每晚价格",
      key: "price",
      width: 80,
    },
    {
      title: "库存",
      dataIndex: "剩余库存",
      key: "stock",
      width: 80,
    },
  ];

  /**
   * 错误列配置
   */
  const errorColumns = [
    {
      title: "行号",
      dataIndex: "row",
      key: "row",
      width: 80,
      render: (row: number) => (row === 1 ? "整体" : row),
    },
    {
      title: "字段",
      dataIndex: "field",
      key: "field",
      width: 120,
    },
    {
      title: "错误信息",
      dataIndex: "message",
      key: "message",
    },
    {
      title: "严重程度",
      key: "severity",
      width: 100,
      render: (_: any, record: ValidationError) => {
        const isCritical =
          record.field === "酒店房型" ||
          record.field === "酒店中文名" ||
          record.field === "酒店英文名";
        return (
          <Tag color={isCritical ? "red" : "orange"}>
            {isCritical ? "严重" : "警告"}
          </Tag>
        );
      },
    },
  ];

  /**
   * 结果列配置
   */
  const resultColumns = [
    {
      title: "酒店名称",
      dataIndex: "hotelName",
      key: "hotelName",
      width: 200,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => (
        <Tag
          icon={
            status === "success" ? (
              <CheckCircleOutlined />
            ) : (
              <CloseCircleOutlined />
            )
          }
          color={status === "success" ? "success" : "error"}
        >
          {status === "success" ? "成功" : "失败"}
        </Tag>
      ),
    },
    {
      title: "消息",
      dataIndex: "message",
      key: "message",
    },
  ];

  /**
   * 生成弹窗标题
   */
  const getModalTitle = () => {
    if (importResults.length > 0) {
      return "批量导入结果";
    }
    if (validationErrors.length > 0) {
      return "数据验证错误";
    }
    return "数据预览";
  };

  /**
   * 渲染弹窗内容
   */
  const renderModalContent = () => {
    if (importResults.length > 0) {
      return (
        <div>
          <Table
            dataSource={importResults}
            columns={resultColumns}
            rowKey={(record) => record.hotelName}
            pagination={false}
            style={{ marginBottom: 24 }}
          />

          {hotels && hotels.length > 0 && (
            <div>
              <Typography.Title level={4} style={{ marginBottom: 16 }}>
                酒店详细信息
              </Typography.Title>
              <Space
                direction="vertical"
                size="large"
                style={{ width: "100%" }}
              >
                {hotels.map((hotel, index) => (
                  <Card
                    key={index}
                    title={`酒店 ${index + 1}: ${hotel.name}`}
                    size="small"
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          gap: 24,
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 200 }}>
                          <div style={{ fontWeight: "bold", marginBottom: 4 }}>
                            酒店中文名
                          </div>
                          <div>{hotel.name}</div>
                        </div>
                        <div style={{ flex: 1, minWidth: 200 }}>
                          <div style={{ fontWeight: "bold", marginBottom: 4 }}>
                            酒店英文名
                          </div>
                          <div>{hotel.nameEn || "未提供"}</div>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          gap: 24,
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 200 }}>
                          <div style={{ fontWeight: "bold", marginBottom: 4 }}>
                            酒店星级
                          </div>
                          <div>
                            {hotel.star === 1
                              ? "一星级/基础"
                              : hotel.star === 2
                                ? "二星级/普通"
                                : hotel.star === 3
                                  ? "三星级/舒适"
                                  : hotel.star === 4
                                    ? "四星级/高档"
                                    : hotel.star === 5
                                      ? "五星级/豪华"
                                      : "未设置"}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        <div style={{ fontWeight: "bold" }}>酒店地址</div>
                        <div>
                          {hotel.location && hotel.location.length > 0 && (
                            <div style={{ marginBottom: 4 }}>
                              <span style={{ marginRight: 8 }}>
                                所在省份: {hotel.location[0]}
                              </span>
                              <span style={{ marginRight: 8 }}>
                                所在城市: {hotel.location[1]}
                              </span>
                              <span>所在区县: {hotel.location[2]}</span>
                            </div>
                          )}
                          <div>{hotel.address || "未提供"}</div>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          gap: 24,
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 200 }}>
                          <div style={{ fontWeight: "bold", marginBottom: 4 }}>
                            开业时间
                          </div>
                          <div>{hotel.openingDate || "未提供"}</div>
                        </div>
                        <div style={{ flex: 1, minWidth: 200 }}>
                          <div style={{ fontWeight: "bold", marginBottom: 4 }}>
                            联系电话
                          </div>
                          <div>{hotel.phone || "未提供"}</div>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        <div style={{ fontWeight: "bold" }}>酒店设施</div>
                        <div>
                          {hotel.amenities && hotel.amenities.length > 0 ? (
                            <div
                              style={{
                                display: "flex",
                                gap: 8,
                                flexWrap: "wrap",
                              }}
                            >
                              {hotel.amenities.map((amenity, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    padding: "4px 12px",
                                    backgroundColor: "#f0f0f0",
                                    borderRadius: 16,
                                  }}
                                >
                                  {amenity === "WiFi"
                                    ? "WiFi"
                                    : amenity === "Parking"
                                      ? "停车场"
                                      : amenity === "Breakfast"
                                        ? "早餐"
                                        : amenity}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div>未设置</div>
                          )}
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      ></div>
                    </div>
                  </Card>
                ))}
              </Space>
            </div>
          )}
        </div>
      );
    }

    if (validationErrors.length > 0) {
      return (
        <div>
          <div
            style={{
              marginBottom: 16,
              padding: 16,
              backgroundColor: "#fff2f0",
              borderRadius: 8,
            }}
          >
            <h4
              style={{
                color: "#ff4d4f",
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
              }}
            >
              <ExclamationCircleOutlined style={{ marginRight: 8 }} />
              发现 {validationErrors.length} 个验证错误
            </h4>
            <p style={{ margin: 0, color: "#666" }}>
              请修复以下错误后重新上传文件。标记为"严重"的错误必须修复，标记为"警告"的错误建议修复。
            </p>
          </div>
          <Table
            dataSource={validationErrors}
            columns={errorColumns}
            rowKey={(record) => `${record.row}-${record.field}`}
            pagination={{ pageSize: 10 }}
            scroll={{ y: 400 }}
          />
        </div>
      );
    }

    return (
      <Table
        dataSource={previewData}
        columns={previewColumns}
        rowKey={(_record: any, index?: number) => index ?? 0}
        pagination={{ pageSize: 10 }}
        scroll={{ y: 400 }}
      />
    );
  };

  return (
    <Modal
      title={getModalTitle()}
      open={visible}
      onCancel={onCancel}
      width={1000}
      zIndex={2000}
      footer={[
        <Button key="close" onClick={onCancel}>
          关闭
        </Button>,
        importResults.length > 0 &&
          importResults.every((result) => result.status === "success") && (
            <Button
              key="goToIncomplete"
              type="primary"
              onClick={() => {
                onCancel();
                navigate("/hotels/incomplete?status=all");
              }}
            >
              前往待完善酒店
            </Button>
          ),
      ].filter(Boolean)}
    >
      {renderModalContent()}
    </Modal>
  );
};

export default ImportPreviewModal;
