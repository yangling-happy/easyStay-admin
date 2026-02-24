import React, { useState } from "react";
import { Button, Upload, message, Progress, Space, Divider } from "antd";
import { DownloadOutlined, UploadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import type {
  ExcelRow,
  ImportResult,
  ValidationError,
} from "../batchImport/types";
import { validateRoomTypeInfo } from "../batchImport/validators";
import { downloadRoomTemplate } from "../batchImport/templateDownloader";
import ImportPreviewModal from "./ImportPreviewModal";

// 样式定义
const styles = {
  space: {
    width: "100%",
  },
  section: {
    marginBottom: "16px",
    padding: "12px",
    backgroundColor: "#fafafa",
    borderRadius: "6px",
  },
  title: {
    marginBottom: "12px",
    color: "#262626",
    fontWeight: 600,
  },
  steps: {
    marginBottom: "12px",
  },
  notice: {
    marginTop: "12px",
  },
  buttonGroup: {
    marginTop: "12px",
    marginBottom: "12px",
  },
  uploadSection: {
    padding: "16px",
    border: "1px dashed #d9d9d9",
    borderRadius: "6px",
    textAlign: "center" as const,
    margin: "12px 0",
    transition: "all 0.3s",
    "&:hover": {
      borderColor: "#1890ff",
      backgroundColor: "#e6f7ff",
    },
  },
  divider: {
    margin: "16px 0",
  },
};

interface RoomBatchImportProps {}

const RoomBatchImport: React.FC<RoomBatchImportProps> = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    [],
  );
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const downloadTemplate = () => {
    downloadRoomTemplate();
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setProgress(0);
    setValidationErrors([]);
    setPreviewData([]);
    setImportResults([]);

    try {
      setProgress(20);

      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        message.error("Excel文件为空，请检查后重试");
        setUploading(false);
        return false;
      }

      setProgress(40);

      const errors: ValidationError[] = [];
      const roomData: any[] = [];

      jsonData.forEach((row: ExcelRow, index: number) => {
        const rowNum = index + 2;

        const roomTypeErrors = validateRoomTypeInfo(row, rowNum);

        if (roomTypeErrors.length > 0) {
          errors.push(...roomTypeErrors);
          return;
        }

        const price = parseFloat(row["每晚价格"]);
        const stock = parseInt(row["剩余库存"], 10);
        const capacity = parseInt(row["标准入住人数"], 10);

        if (!row["每晚价格"] || isNaN(price)) {
          errors.push({
            row: rowNum,
            field: "每晚价格",
            message: "必须是有效的正数",
          });
        }
        if (!row["剩余库存"] || isNaN(stock)) {
          errors.push({
            row: rowNum,
            field: "剩余库存",
            message: "必须是有效的非负整数",
          });
        }
        if (
          !row["标准入住人数"] ||
          isNaN(capacity) ||
          capacity < 1 ||
          capacity > 4
        ) {
          errors.push({
            row: rowNum,
            field: "标准入住人数",
            message: "必须是1-4之间的整数",
          });
        }
        if (!row["床型"] || !["big", "double", "king"].includes(row["床型"])) {
          errors.push({
            row: rowNum,
            field: "床型",
            message: "必须是big/double/king之一",
          });
        }

        roomData.push(row);
      });

      setProgress(60);

      if (errors.length > 0) {
        setValidationErrors(errors);
        message.warning(`发现 ${errors.length} 个数据验证错误，请检查后重试`);
        setShowPreview(true);
        setUploading(false);
        return false;
      }

      setProgress(100);
      setPreviewData(roomData);
      setImportResults(
        roomData.map((row: any) => ({
          hotelName: row["酒店名称"],
          status: "success",
          message: `房型"${row["房型名称"]}"导入成功，等待上传图片`,
        })),
      );

      message.success(
        `批量导入成功！共导入 ${roomData.length} 个房型的基础信息`,
      );
      setShowPreview(true);
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
    <>
      <Space direction="vertical" size="large" style={styles.space}>
        <div style={styles.section}>
          <h3 style={styles.title}>操作步骤：</h3>
          <ol style={styles.steps}>
            <li style={{ marginBottom: "8px" }}>点击下方按钮下载 Excel 模板</li>
            <li style={{ marginBottom: "8px" }}>
              在本地填写房型信息，关联已导入的酒店
            </li>
            <li style={{ marginBottom: "8px" }}>上传填写好的 Excel 文件</li>
            <li style={{ marginBottom: "8px" }}>上传房型图片</li>
            <li>提交审核</li>
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
            下载房型模板
          </Button>
        </div>

        <Divider style={styles.divider} />

        <div style={styles.section}>
          <h3 style={styles.title}>上传文件：</h3>
          <div style={styles.uploadSection}>
            <Upload.Dragger
              accept=".xlsx,.xls"
              beforeUpload={handleFileUpload}
              showUploadList={false}
              disabled={uploading}
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">
                {uploading ? "处理中..." : "点击或拖拽文件到此区域上传"}
              </p>
              <p className="ant-upload-hint">
                支持 .xlsx, .xls 格式的 Excel 文件
              </p>
            </Upload.Dragger>

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
            <li style={{ marginBottom: "6px" }}>房型名称不能为空</li>
            <li style={{ marginBottom: "6px" }}>每晚价格必须是有效的正数</li>
            <li style={{ marginBottom: "6px" }}>
              剩余库存必须是有效的非负整数
            </li>
            <li style={{ marginBottom: "6px" }}>
              标准入住人数必须是1-4之间的整数
            </li>
            <li style={{ marginBottom: "6px" }}>
              床型可选：big(1.8m大床)、double(1.2m双床)、king(2.0m超大床)
            </li>
            <li style={{ marginBottom: "6px" }}>配套权益用逗号分隔</li>
            <li style={{ marginBottom: "6px" }}>
              房型图片上传是必要环节，未完成图片上传不得进入审核流程
            </li>
            <li style={{ marginBottom: "6px" }}>
              房型照片：建议上传3-5张，展示客房细节、卫浴等
            </li>
            <li>每个房型必须关联一个已成功导入的酒店</li>
          </ul>
        </div>
      </Space>

      <ImportPreviewModal
        visible={showPreview}
        previewData={previewData}
        importResults={importResults}
        validationErrors={validationErrors}
        hotels={[]}
        onCancel={() => {
          setShowPreview(false);
        }}
      />
    </>
  );
};

export default RoomBatchImport;
