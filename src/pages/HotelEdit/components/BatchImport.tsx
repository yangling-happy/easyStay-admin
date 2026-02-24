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
import { DownloadOutlined, UploadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import type {
  ExcelRow,
  ImportResult,
  ValidationError,
} from "../batchImport/types";
import { validateHotelBasicInfo } from "../batchImport/validators";
import {
  downloadHotelTemplate,
  downloadOptionsTemplate,
  downloadRoomTemplate,
} from "../batchImport/templateDownloader";
import type { Hotel } from "../../../types/hotel";
import { hotelService } from "../../../api/services/hotelService";
import ImportPreviewModal from "./ImportPreviewModal";
import PhotoUploadModal from "./PhotoUploadModal";
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
  onCancel?: () => void;
}

const BatchImport: React.FC<BatchImportProps> = ({ onCancel }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    [],
  );
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [importStep, setImportStep] = useState<"hotel" | "room">("hotel");
  const [photoUploadModalVisible, setPhotoUploadModalVisible] = useState(false);
  const [importedHotels, setImportedHotels] = useState<Hotel[]>([]);

  const resolveCompletionStatus = (hotel: Hotel) => {
    const missingRequiredFields =
      !hotel.name?.trim() ||
      !hotel.nameEn?.trim() ||
      !hotel.address?.trim() ||
      !hotel.phone?.trim() ||
      !hotel.openingDate ||
      !hotel.star ||
      !hotel.location ||
      hotel.location.length < 2 ||
      !hotel.photos ||
      hotel.photos.length === 0 ||
      !hotel.roomTypes ||
      hotel.roomTypes.length === 0 ||
      hotel.roomTypes.some((room) => !room.photos || room.photos.length === 0);

    return missingRequiredFields ? "incomplete" : "draft";
  };

  /**
   * 下载模板
   */
  const downloadTemplate = (type: string = "hotel") => {
    if (type === "hotel") {
      downloadHotelTemplate();
    } else if (type === "room") {
      downloadRoomTemplate();
    } else {
      downloadOptionsTemplate();
    }
  };

  /**
   * 处理文件上传
   * @param file 上传的文件
   * @param fileType 文件类型：hotel（酒店基础信息）、room（房型信息）
   * @returns false 阻止默认上传行为
   */
  const handleFileUpload = async (file: File, fileType: string = "hotel") => {
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

      if (fileType === "hotel") {
        // 处理酒店基础信息导入
        const hotelData = jsonData as ExcelRow[];
        setPreviewData(hotelData);

        // 只验证酒店基础信息，不验证房型信息
        const errors: ValidationError[] = [];
        const validHotels: Hotel[] = [];

        hotelData.forEach((row: ExcelRow, index: number) => {
          const rowNum = index + 2;
          const basicInfoErrors = validateHotelBasicInfo(row, rowNum);

          if (basicInfoErrors.length > 0) {
            errors.push(...basicInfoErrors);
            return;
          }

          // 解析酒店基础信息
          const star = parseInt(row["酒店星级"], 10);
          const newHotel: Hotel = {
            name: row["酒店中文名"].trim(),
            nameEn: row["酒店英文名"].trim(),
            location: [
              row["所在省份"],
              row["所在城市"],
              row["所在区县"],
            ].filter(Boolean) as string[],
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
          };

          newHotel.completionStatus = resolveCompletionStatus(newHotel);

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

        // 保存导入的酒店数据，用于照片上传
        setImportedHotels(validHotels);

        setProgress(100);

        // 保存酒店数据到后端
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

        console.log("导入成功，设置预览数据:", saveResults);
        console.log("导入的酒店数据:", validHotels);

        const successCount = saveResults.filter(
          (r) => r.status === "success",
        ).length;
        const errorCount = saveResults.filter(
          (r) => r.status === "error",
        ).length;

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
      } else if (fileType === "room") {
        // 处理房型信息导入
        const roomData = jsonData;
        setPreviewData(roomData);

        // 这里需要添加房型数据的验证逻辑
        // 暂时简单验证
        const errors: ValidationError[] = [];
        roomData.forEach((row: any, index: number) => {
          if (!row["酒店名称"]?.trim()) {
            errors.push({
              row: index + 2,
              field: "酒店名称",
              message: "不能为空",
            });
          }
          if (!row["房型名称"]?.trim()) {
            errors.push({
              row: index + 2,
              field: "房型名称",
              message: "不能为空",
            });
          }
          if (!row["每晚价格"] || isNaN(parseFloat(row["每晚价格"]))) {
            errors.push({
              row: index + 2,
              field: "每晚价格",
              message: "必须是有效的正数",
            });
          }
          if (!row["剩余库存"] || isNaN(parseInt(row["剩余库存"]))) {
            errors.push({
              row: index + 2,
              field: "剩余库存",
              message: "必须是有效的非负整数",
            });
          }
          if (
            !row["标准入住人数"] ||
            isNaN(parseInt(row["标准入住人数"])) ||
            parseInt(row["标准入住人数"]) < 1 ||
            parseInt(row["标准入住人数"]) > 4
          ) {
            errors.push({
              row: index + 2,
              field: "标准入住人数",
              message: "必须是1-4之间的整数",
            });
          }
          if (
            !row["床型"] ||
            !["big", "double", "king"].includes(row["床型"])
          ) {
            errors.push({
              row: index + 2,
              field: "床型",
              message: "必须是big/double/king之一",
            });
          }
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
            activeKey={importStep}
            onChange={(key) => setImportStep(key as "hotel" | "room")}
            items={[
              {
                key: "hotel",
                label: "酒店基础信息导入",
                children: (
                  <>
                    <div style={styles.section}>
                      <h3 style={styles.title}>操作步骤：</h3>
                      <ol style={styles.steps}>
                        <li style={{ marginBottom: "8px" }}>
                          点击下方按钮下载 Excel 模板
                        </li>
                        <li style={{ marginBottom: "8px" }}>
                          在本地填写酒店基础信息
                        </li>
                        <li style={{ marginBottom: "8px" }}>
                          上传填写好的 Excel 文件
                        </li>
                        <li style={{ marginBottom: "8px" }}>上传酒店图片</li>
                        <li>提交审核</li>
                      </ol>
                    </div>

                    <div style={styles.buttonGroup}>
                      <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={() => downloadTemplate("hotel")}
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
                          beforeUpload={(file) =>
                            handleFileUpload(file, "hotel")
                          }
                          showUploadList={false}
                          disabled={uploading}
                        >
                          <p className="ant-upload-drag-icon">
                            <UploadOutlined />
                          </p>
                          <p className="ant-upload-text">
                            {uploading
                              ? "处理中..."
                              : "点击或拖拽文件到此区域上传"}
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
                        <li style={{ marginBottom: "6px" }}>
                          开业时间格式为YYYY-MM-DD
                        </li>
                        <li style={{ marginBottom: "6px" }}>
                          酒店设施用逗号分隔
                        </li>
                        <li style={{ marginBottom: "6px" }}>
                          酒店图片上传是必要环节，未完成图片上传不得进入审核流程
                        </li>
                        <li style={{ marginBottom: "6px" }}>
                          酒店照片：建议上传3-8张大堂或外景图
                        </li>
                        <li>每个酒店必须填写完整的基础信息</li>
                      </ul>
                    </div>
                  </>
                ),
              },
              {
                key: "room",
                label: "房型信息导入",
                children: (
                  <>
                    <div style={styles.section}>
                      <h3 style={styles.title}>操作步骤：</h3>
                      <ol style={styles.steps}>
                        <li style={{ marginBottom: "8px" }}>
                          点击下方按钮下载 Excel 模板
                        </li>
                        <li style={{ marginBottom: "8px" }}>
                          在本地填写房型信息，关联已导入的酒店
                        </li>
                        <li style={{ marginBottom: "8px" }}>
                          上传填写好的 Excel 文件
                        </li>
                        <li style={{ marginBottom: "8px" }}>上传房型图片</li>
                        <li>提交审核</li>
                      </ol>
                    </div>

                    <div style={styles.buttonGroup}>
                      <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={() => downloadTemplate("room")}
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
                          beforeUpload={(file) =>
                            handleFileUpload(file, "room")
                          }
                          showUploadList={false}
                          disabled={uploading}
                        >
                          <p className="ant-upload-drag-icon">
                            <UploadOutlined />
                          </p>
                          <p className="ant-upload-text">
                            {uploading
                              ? "处理中..."
                              : "点击或拖拽文件到此区域上传"}
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
                          房型名称不能为空
                        </li>
                        <li style={{ marginBottom: "6px" }}>
                          每晚价格必须是有效的正数
                        </li>
                        <li style={{ marginBottom: "6px" }}>
                          剩余库存必须是有效的非负整数
                        </li>
                        <li style={{ marginBottom: "6px" }}>
                          标准入住人数必须是1-4之间的整数
                        </li>
                        <li style={{ marginBottom: "6px" }}>
                          床型可选：big(1.8m大床)、double(1.2m双床)、king(2.0m超大床)
                        </li>
                        <li style={{ marginBottom: "6px" }}>
                          配套权益用逗号分隔
                        </li>
                        <li style={{ marginBottom: "6px" }}>
                          房型图片上传是必要环节，未完成图片上传不得进入审核流程
                        </li>
                        <li style={{ marginBottom: "6px" }}>
                          房型照片：建议上传3-5张，展示客房细节、卫浴等
                        </li>
                        <li>每个房型必须关联一个已成功导入的酒店</li>
                      </ul>
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
          previewData={previewData}
          importResults={importResults}
          validationErrors={validationErrors}
          hotels={importedHotels}
          onCancel={() => {
            setShowPreview(false);
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
          onBackToPreview={() => {
            setPhotoUploadModalVisible(false);
            setShowPreview(true);
          }}
        />
      </Card>
    </div>
  );
};

export default BatchImport;
