/**
 * BatchImport 组件
 * 功能：批量导入酒店数据和Select选项数据
 * 版本：1.0.0
 * 日期：2026-02-24
 */

import React, { useState } from "react";
import {
  Card,
  Button,
  Upload,
  message,
  Progress,
  Table,
  Space,
  Modal,
  Tag,
  Tabs,
} from "antd";
import {
  DownloadOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SettingOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import { useSelectOptions } from "../hooks/useSelectOptions";
import type {
  ExcelRow,
  OptionExcelRow,
  ImportResult,
  ValidationError,
  ImportMode,
} from "../batchImport/types";
import {
  validateHotelData,
  handleHotelImport,
  handleOptionsImport,
} from "../batchImport/importProcessor";
import { validateOptionData } from "../batchImport/validators";
import {
  downloadHotelTemplate,
  downloadOptionsTemplate,
} from "../batchImport/templateDownloader";
import type { Hotel } from "../../../types/hotel";
import PhotoUploadModal from "./PhotoUploadModal";

interface BatchImportProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const BatchImport: React.FC<BatchImportProps> = ({ onSuccess, onCancel }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    [],
  );
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [importMode, setImportMode] = useState<ImportMode>("hotel");
  const { importFromExcel, resetToDefault } = useSelectOptions();
  const [photoUploadModalVisible, setPhotoUploadModalVisible] = useState(false);
  const [importedHotels, setImportedHotels] = useState<Hotel[]>([]);

  /**
   * 下载模板
   */
  const downloadTemplate = () => {
    if (importMode === "hotel") {
      downloadHotelTemplate();
    } else {
      downloadOptionsTemplate();
    }
  };

  /**
   * 处理文件上传
   * @param file 上传的文件
   * @returns false 阻止默认上传行为
   */
  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setProgress(0);
    setValidationErrors([]);
    setImportResults([]);

    try {
      setProgress(20);

      // 读取和解析Excel文件
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      setProgress(40);

      // 检查文件是否为空
      if (jsonData.length === 0) {
        message.error("Excel文件为空");
        setUploading(false);
        return false;
      }

      if (importMode === "options") {
        const optionData = jsonData as OptionExcelRow[];
        setPreviewData(optionData as any);

        // 验证选项数据
        const optionErrors = validateOptionData(optionData);

        setProgress(60);

        if (optionErrors.length > 0) {
          setValidationErrors(optionErrors);
          message.warning(
            `发现 ${optionErrors.length} 个数据验证错误，请检查后重试`,
          );
          setShowPreview(true);
          setUploading(false);
          return false;
        }

        setProgress(80);
        await handleOptionsImport(optionData, importFromExcel);
      } else {
        const hotelData = jsonData as ExcelRow[];
        setPreviewData(hotelData);
        const { valid, errors } = validateHotelData(hotelData);

        setProgress(60);

        if (errors.length > 0) {
          setValidationErrors(errors);
          message.warning(`发现 ${errors.length} 个数据验证错误，请检查后重试`);
          setShowPreview(true);
          setUploading(false);
          return false;
        }

        setProgress(80);

        // 保存导入的酒店数据，用于照片上传
        setImportedHotels(valid);

        // 导入酒店数据
        const results = await handleHotelImport(valid);

        setProgress(100);
        setImportResults(results);

        // 显示导入结果
        const successCount = results.filter(
          (r) => r.status === "success",
        ).length;
        const errorCount = results.filter((r) => r.status === "error").length;

        if (errorCount === 0) {
          message.success(`批量导入成功！共导入 ${successCount} 家酒店`);

          // 显示照片上传模态框
          setPhotoUploadModalVisible(true);

          if (onSuccess) {
            onSuccess();
          }
        } else {
          message.warning(
            `批量导入完成：成功 ${successCount} 家，失败 ${errorCount} 家。请查看错误详情。`,
          );
        }

        setShowPreview(true);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "未知错误";
      message.error("文件解析失败: " + errorMessage);
      console.error("文件解析失败:", error);
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 2000);
    }

    return false;
  };

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

  return (
    <Card title="批量导入" className="batch-import-container">
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Tabs
          activeKey={importMode}
          onChange={(key) => setImportMode(key as ImportMode)}
          items={[
            {
              key: "hotel",
              label: "酒店数据导入",
              children: (
                <>
                  <div>
                    <h3>操作步骤：</h3>
                    <ol>
                      <li>点击下方按钮下载 Excel 模板</li>
                      <li>在本地填写酒店和房型信息</li>
                      <li>上传填写好的 Excel 文件</li>
                      <li>系统自动验证并批量提交</li>
                    </ol>
                  </div>

                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={downloadTemplate}
                    size="large"
                  >
                    下载 Excel 模板
                  </Button>

                  <div>
                    <h3>上传文件：</h3>
                    <Upload
                      accept=".xlsx,.xls"
                      beforeUpload={handleFileUpload}
                      showUploadList={false}
                      disabled={uploading}
                    >
                      <Button
                        icon={<UploadOutlined />}
                        size="large"
                        loading={uploading}
                        disabled={uploading}
                      >
                        {uploading ? "处理中..." : "选择 Excel 文件上传"}
                      </Button>
                    </Upload>

                    {uploading && (
                      <div style={{ marginTop: 16 }}>
                        <Progress percent={progress} status="active" />
                      </div>
                    )}
                  </div>

                  <div>
                    <h3>注意事项：</h3>
                    <ul>
                      <li>同一酒店可以有多个房型，请在 Excel 中按行填写</li>
                      <li>酒店星级必须是 1-5 之间的数字</li>
                      <li>
                        床型可选：big(1.8m大床)、double(1.2m双床)、king(2.0m超大床)
                      </li>
                      <li>标准入住人数必须是 1-4 之间的整数</li>
                      <li>酒店设施和配套权益用逗号分隔</li>
                      <li>照片需要在批量导入成功后单独上传</li>
                      <li>酒店照片：建议上传3-8张大堂或外景图</li>
                      <li>房型照片：建议上传3-5张，展示客房细节、卫浴等</li>
                      <li>每个酒店必须至少包含一种房型</li>
                    </ul>
                  </div>
                </>
              ),
            },
            {
              key: "options",
              label: "Select选项导入",
              children: (
                <>
                  <div>
                    <h3>功能说明：</h3>
                    <p>
                      通过Excel批量导入Select组件的选项，支持酒店设施、床型、配套权益等选项的自定义扩展。
                    </p>
                  </div>

                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={downloadTemplate}
                    size="large"
                  >
                    下载选项模板
                  </Button>

                  <div>
                    <h3>上传文件：</h3>
                    <Upload
                      accept=".xlsx,.xls"
                      beforeUpload={handleFileUpload}
                      showUploadList={false}
                      disabled={uploading}
                    >
                      <Button
                        icon={<UploadOutlined />}
                        size="large"
                        loading={uploading}
                        disabled={uploading}
                      >
                        {uploading ? "处理中..." : "选择 Excel 文件上传"}
                      </Button>
                    </Upload>

                    {uploading && (
                      <div style={{ marginTop: 16 }}>
                        <Progress percent={progress} status="active" />
                      </div>
                    )}
                  </div>

                  <div>
                    <h3>Excel格式说明：</h3>
                    <ul>
                      <li>
                        <strong>选项类型</strong>
                        ：必须是"酒店设施"、"床型"、"配套权益"之一
                      </li>
                      <li>
                        <strong>选项值</strong>
                        ：选项的实际值（英文或数字），如"Spa"、"queen"
                      </li>
                      <li>
                        <strong>选项标签</strong>
                        ：选项显示的中文标签，如"水疗中心"、"1.5m特大床"
                      </li>
                      <li>
                        导入后的选项将自动应用到BasicInfoForm和RoomTypeFormList的Select组件
                      </li>
                      <li>选项数据保存在localStorage中，刷新页面不会丢失</li>
                    </ul>
                  </div>

                  <div>
                    <Button
                      danger
                      icon={<SettingOutlined />}
                      onClick={resetToDefault}
                    >
                      重置为默认选项
                    </Button>
                  </div>
                </>
              ),
            },
          ]}
        />
      </Space>

      <Modal
        title={
          importMode === "options"
            ? "选项导入预览"
            : importResults.length > 0
              ? "批量导入结果"
              : "数据预览"
        }
        open={showPreview}
        onCancel={() => setShowPreview(false)}
        width={1000}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setShowPreview(false);
              if (onCancel) {
                onCancel();
              }
            }}
          >
            关闭
          </Button>,
        ]}
      >
        {importMode === "options" ? (
          <Table
            dataSource={previewData}
            columns={optionPreviewColumns}
            rowKey={(_record: any, index?: number) => index ?? 0}
            pagination={{ pageSize: 10 }}
            scroll={{ y: 400 }}
          />
        ) : importResults.length > 0 ? (
          <Table
            dataSource={importResults}
            columns={resultColumns}
            rowKey={(record) => record.hotelName}
            pagination={false}
          />
        ) : validationErrors.length > 0 ? (
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
        ) : (
          <Table
            dataSource={previewData}
            columns={previewColumns}
            rowKey={(_record: any, index?: number) => index ?? 0}
            pagination={{ pageSize: 10 }}
            scroll={{ y: 400 }}
          />
        )}
      </Modal>

      {/* 照片上传模态框 */}
      <PhotoUploadModal
        visible={photoUploadModalVisible}
        hotels={importedHotels}
        onClose={() => setPhotoUploadModalVisible(false)}
        onComplete={() => {
          setPhotoUploadModalVisible(false);
          if (onCancel) {
            onCancel();
          }
        }}
      />
    </Card>
  );
};

export default BatchImport;
