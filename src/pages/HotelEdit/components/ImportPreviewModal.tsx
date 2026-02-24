/**
 * ImportPreviewModal 组件
 * 功能：显示批量导入的预览、结果和验证错误信息
 * 版本：1.0.0
 * 日期：2026-02-24
 */

import React from "react";
import { Modal, Table, Tag, Button } from "antd";
import {
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import type {
  ValidationError,
  ImportResult,
  ImportMode,
} from "../batchImport/types";

interface ImportPreviewModalProps {
  /** 控制弹窗显示/隐藏 */
  visible: boolean;
  /** 导入模式：hotel 或 options */
  importMode: ImportMode;
  /** 预览数据 */
  previewData: any[];
  /** 导入结果 */
  importResults: ImportResult[];
  /** 验证错误信息 */
  validationErrors: ValidationError[];
  /** 关闭弹窗的回调函数 */
  onCancel: () => void;
  /** 导航到下一步的回调函数 */
  onNext?: () => void;
}

const ImportPreviewModal: React.FC<ImportPreviewModalProps> = ({
  visible,
  importMode,
  previewData,
  importResults,
  validationErrors,
  onCancel,
  onNext,
}) => {
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
   * 选项数据预览列配置
   */
  const optionPreviewColumns = [
    {
      title: "选项类型",
      dataIndex: "选项类型",
      key: "optionType",
      width: 120,
    },
    {
      title: "选项值",
      dataIndex: "选项值",
      key: "optionValue",
      width: 120,
    },
    {
      title: "选项标签",
      dataIndex: "选项标签",
      key: "optionLabel",
      width: 150,
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
    if (importMode === "options") {
      return "选项导入预览";
    }
    if (importResults.length > 0) {
      return "批量导入结果";
    }
    return "数据预览";
  };

  /**
   * 渲染弹窗内容
   */
  const renderModalContent = () => {
    if (importMode === "options") {
      return (
        <Table
          dataSource={previewData}
          columns={optionPreviewColumns}
          rowKey={(_record: any, index?: number) => index ?? 0}
          pagination={{ pageSize: 10 }}
          scroll={{ y: 400 }}
        />
      );
    }

    if (importResults.length > 0) {
      return (
        <Table
          dataSource={importResults}
          columns={resultColumns}
          rowKey={(record) => record.hotelName}
          pagination={false}
        />
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
      footer={[
        <Button key="close" onClick={onCancel}>
          关闭
        </Button>,
        importMode === "hotel" &&
          importResults.length > 0 &&
          importResults.every((result) => result.status === "success") &&
          onNext && (
            <Button key="next" type="primary" onClick={onNext}>
              下一步
            </Button>
          ),
      ].filter(Boolean)}
    >
      {renderModalContent()}
    </Modal>
  );
};

export default ImportPreviewModal;
