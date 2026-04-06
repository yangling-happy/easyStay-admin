/**
 * HotelBatchImport 组件
 * 功能：批量导入酒店基础信息
 * 版本：1.0.0
 * 日期：2026-02-24
 */

import React, { useState } from "react";
import { Button, Upload, message, Progress, Space, Divider } from "antd";
import { DownloadOutlined, UploadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import type {
  ExcelRow,
  ImportResult,
  ValidationError,
} from "../batchImport/types";
import { validateHotelBasicInfo } from "../batchImport/validators";
import { downloadHotelTemplate } from "../batchImport/templateDownloader";
import type { Hotel } from "../../../types/hotel";
import { hotelService } from "../../../api/services/hotelService";
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

interface HotelBatchImportProps {}

const HotelBatchImport: React.FC<HotelBatchImportProps> = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    [],
  );
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const downloadTemplate = () => {
    downloadHotelTemplate();
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
      const validHotels: Hotel[] = [];

      jsonData.forEach((row: ExcelRow, index: number) => {
        const rowNum = index + 2;

        const basicInfoErrors = validateHotelBasicInfo(row, rowNum);

        if (basicInfoErrors.length > 0) {
          errors.push(...basicInfoErrors);
          return;
        }

        const star = parseInt(row["酒店星级"], 10);

        const newHotel: Hotel = {
          name: row["酒店中文名"].trim(),
          nameEn: row["酒店英文名"].trim(),
          location: [row["所在省份"], row["所在城市"], row["所在区县"]].filter(
            Boolean,
          ) as string[],
          address: row["详细地址"]?.trim() || "",
          phone: row["联系电话"].trim(),
          star: star as 1 | 2 | 3 | 4 | 5,
          openingDate: row["开业时间"],
          amenities: row["酒店设施"]
            ? row["酒店设施"]
                .split(",")
                .map((s: string) => s.trim())
                .filter(Boolean)
            : [],
          roomTypes: [],
          photos: [],
          status: "pending",
          isActive: false,
          isIncomplete: true,
          completionStatus: "draft",
          ownerId: localStorage.getItem("userId") || "user_001",
          createTime: new Date().toISOString(),
          updateTime: new Date().toISOString(),
          isDeleted: false,
          version: 1,
        };

        validHotels.push(newHotel);
      });

      setProgress(60);

      if (errors.length > 0) {
        setValidationErrors(errors);
        message.warning(`发现 ${errors.length} 个数据验证错误，请检查后重试`);
        setShowPreview(true);
        setUploading(false);
        return false;
      }

      setProgress(80);

      setPreviewData(validHotels);

      setProgress(100);

      const saveResults = await Promise.all(
        validHotels.map(async (hotel) => {
          try {
            const savedHotel = await hotelService.saveHotel(hotel);
            return {
              hotelName: hotel.name,
              status: "success" as const,
              message: "酒店基础信息导入成功",
              hotelId: savedHotel?.id || hotel.id,
            };
          } catch (error: any) {
            return {
              hotelName: hotel.name,
              status: "error" as const,
              message: error.message || "导入失败",
            };
          }
        }),
      );

      setImportResults(saveResults);

      const successCount = saveResults.filter(
        (r) => r.status === "success",
      ).length;
      const errorCount = saveResults.filter((r) => r.status === "error").length;

      if (errorCount === 0) {
        message.success(
          `批量导入成功！共导入 ${successCount} 家酒店的基础信息，请去"待完善酒店"完善照片和房型`,
        );
      } else {
        message.warning(
          `批量导入完成：成功 ${successCount} 家，失败 ${errorCount} 家。请前往"待完善酒店"查看成功导入的酒店。`,
        );
      }
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
            <li style={{ marginBottom: "8px" }}>在本地填写酒店基础信息</li>
            <li style={{ marginBottom: "8px" }}>上传填写好的 Excel 文件</li>
            <li style={{ marginBottom: "8px" }}>上传酒店图片</li>
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
            下载酒店模板
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
            <li style={{ marginBottom: "6px" }}>
              酒店星级必须是 1-5 之间的数字
            </li>
            <li style={{ marginBottom: "6px" }}>开业时间格式为YYYY-MM-DD</li>
            <li style={{ marginBottom: "6px" }}>酒店设施用逗号分隔</li>
            <li style={{ marginBottom: "6px" }}>
              酒店图片上传是必要环节，未完成图片上传不得进入审核流程
            </li>
            <li style={{ marginBottom: "6px" }}>
              酒店照片：建议上传3-8张大堂或外景图
            </li>
            <li>每个酒店必须填写完整的基础信息</li>
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

export default HotelBatchImport;
