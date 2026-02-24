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
  Space,
  Tabs,
  Divider,
} from "antd";
import {
  DownloadOutlined,
  UploadOutlined,
  SettingOutlined,
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
import ImportPreviewModal from "./ImportPreviewModal";

// 样式定义
const styles = {
  container: {
    width: "100%",
  },
  card: {
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.09)",
    overflow: "hidden",
  },
  space: {
    width: "100%",
  },
  section: {
    marginBottom: "24px",
    padding: "16px",
    backgroundColor: "#fafafa",
    borderRadius: "6px",
  },
  title: {
    marginBottom: "16px",
    color: "#262626",
    fontWeight: 600,
  },
  steps: {
    marginBottom: "20px",
  },
  notice: {
    marginTop: "20px",
  },
  buttonGroup: {
    marginTop: "20px",
    marginBottom: "20px",
  },
  uploadSection: {
    padding: "20px",
    border: "1px dashed #d9d9d9",
    borderRadius: "6px",
    textAlign: "center" as const,
    margin: "20px 0",
    transition: "all 0.3s",
    "&:hover": {
      borderColor: "#1890ff",
      backgroundColor: "#e6f7ff",
    },
  },
  divider: {
    margin: "24px 0",
  },
};

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

  return (
    <div style={styles.container}>
      <Card
        title="批量导入"
        className="batch-import-container"
        style={styles.card}
      >
        <Space direction="vertical" size="large" style={styles.space}>
          <Tabs
            activeKey={importMode}
            onChange={(key) => setImportMode(key as ImportMode)}
            items={[
              {
                key: "hotel",
                label: "酒店数据导入",
                children: (
                  <>
                    <div style={styles.section}>
                      <h3 style={styles.title}>操作步骤：</h3>
                      <ol style={styles.steps}>
                        <li style={{ marginBottom: "8px" }}>
                          点击下方按钮下载 Excel 模板
                        </li>
                        <li style={{ marginBottom: "8px" }}>
                          在本地填写酒店和房型信息
                        </li>
                        <li style={{ marginBottom: "8px" }}>
                          上传填写好的 Excel 文件
                        </li>
                        <li>系统自动验证并批量提交</li>
                      </ol>
                    </div>

                    <div style={styles.buttonGroup}>
                      <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={downloadTemplate}
                        size="large"
                        style={{ padding: "0 24px", height: "40px" }}
                      >
                        下载 Excel 模板
                      </Button>
                    </div>

                    <Divider style={styles.divider} />

                    <div style={styles.section}>
                      <h3 style={styles.title}>上传文件：</h3>
                      <div style={styles.uploadSection}>
                        <Upload
                          accept=".xlsx,.xls"
                          beforeUpload={handleFileUpload}
                          showUploadList={false}
                          disabled={uploading}
                        >
                          <Button
                            type="default"
                            icon={<UploadOutlined />}
                            size="large"
                            loading={uploading}
                            disabled={uploading}
                            style={{ marginBottom: "16px" }}
                          >
                            {uploading ? "处理中..." : "选择 Excel 文件上传"}
                          </Button>
                        </Upload>

                        {uploading && (
                          <div style={{ marginTop: 16 }}>
                            <Progress
                              percent={progress}
                              status="active"
                              strokeColor="#1890ff"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <Divider style={styles.divider} />

                    <div style={styles.section}>
                      <h3 style={styles.title}>注意事项：</h3>
                      <ul style={styles.notice}>
                        <li style={{ marginBottom: "6px" }}>
                          同一酒店可以有多个房型，请在 Excel 中按行填写
                        </li>
                        <li style={{ marginBottom: "6px" }}>
                          酒店星级必须是 1-5 之间的数字
                        </li>
                        <li style={{ marginBottom: "6px" }}>
                          床型可选：big(1.8m大床)、double(1.2m双床)、king(2.0m超大床)
                        </li>
                        <li style={{ marginBottom: "6px" }}>
                          标准入住人数必须是 1-4 之间的整数
                        </li>
                        <li style={{ marginBottom: "6px" }}>
                          酒店设施和配套权益用逗号分隔
                        </li>
                        <li style={{ marginBottom: "6px" }}>
                          照片需要在批量导入成功后单独上传
                        </li>
                        <li style={{ marginBottom: "6px" }}>
                          酒店照片：建议上传3-8张大堂或外景图
                        </li>
                        <li style={{ marginBottom: "6px" }}>
                          房型照片：建议上传3-5张，展示客房细节、卫浴等
                        </li>
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
                    <div style={styles.section}>
                      <h3 style={styles.title}>功能说明：</h3>
                      <p style={{ lineHeight: "1.6" }}>
                        通过Excel批量导入Select组件的选项，支持酒店设施、床型、配套权益等选项的自定义扩展。
                      </p>
                    </div>

                    <div style={styles.buttonGroup}>
                      <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={downloadTemplate}
                        size="large"
                        style={{ padding: "0 24px", height: "40px" }}
                      >
                        下载选项模板
                      </Button>
                    </div>

                    <Divider style={styles.divider} />

                    <div style={styles.section}>
                      <h3 style={styles.title}>上传文件：</h3>
                      <div style={styles.uploadSection}>
                        <Upload
                          accept=".xlsx,.xls"
                          beforeUpload={handleFileUpload}
                          showUploadList={false}
                          disabled={uploading}
                        >
                          <Button
                            type="default"
                            icon={<UploadOutlined />}
                            size="large"
                            loading={uploading}
                            disabled={uploading}
                            style={{ marginBottom: "16px" }}
                          >
                            {uploading ? "处理中..." : "选择 Excel 文件上传"}
                          </Button>
                        </Upload>

                        {uploading && (
                          <div style={{ marginTop: 16 }}>
                            <Progress
                              percent={progress}
                              status="active"
                              strokeColor="#1890ff"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <Divider style={styles.divider} />

                    <div style={styles.section}>
                      <h3 style={styles.title}>Excel格式说明：</h3>
                      <ul style={styles.notice}>
                        <li style={{ marginBottom: "8px" }}>
                          <strong>选项类型</strong>
                          ：必须是"酒店设施"、"床型"、"配套权益"之一
                        </li>
                        <li style={{ marginBottom: "8px" }}>
                          <strong>选项值</strong>
                          ：选项的实际值（英文或数字），如"Spa"、"queen"
                        </li>
                        <li style={{ marginBottom: "8px" }}>
                          <strong>选项标签</strong>
                          ：选项显示的中文标签，如"水疗中心"、"1.5m特大床"
                        </li>
                        <li style={{ marginBottom: "8px" }}>
                          导入后的选项将自动应用到BasicInfoForm和RoomTypeFormList的Select组件
                        </li>
                        <li>选项数据保存在localStorage中，刷新页面不会丢失</li>
                      </ul>
                    </div>

                    <div style={{ marginTop: "20px" }}>
                      <Button
                        danger
                        icon={<SettingOutlined />}
                        onClick={resetToDefault}
                        style={{ padding: "0 16px" }}
                      >
                        重置为默认选项
                      </Button>
                    </div>
                  </>
                ),
              },
            ]}
            tabBarStyle={{ marginBottom: "24px" }}
          />
        </Space>

        <ImportPreviewModal
          visible={showPreview}
          importMode={importMode}
          previewData={previewData}
          importResults={importResults}
          validationErrors={validationErrors}
          onCancel={() => {
            setShowPreview(false);
            if (onCancel) {
              onCancel();
            }
          }}
        />

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
    </div>
  );
};

export default BatchImport;
