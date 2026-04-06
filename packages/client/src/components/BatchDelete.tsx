import React, { useState } from "react";
import { Button, Modal, message } from "antd";
import { DeleteFilled, ExclamationCircleOutlined } from "@ant-design/icons";

interface BatchDeleteProps<T> {
  selectedRowKeys: React.Key[];
  dataSource: T[];
  onBatchDelete: (ids: string[]) => Promise<{
    success: boolean;
    successCount: number;
    failedCount: number;
    failedIds: string[];
  }>;
  itemName?: string;
  getDisplayName: (item: T) => string;
  getDisplayInfo?: (item: T) => string;
  loading?: boolean;
  disabled?: boolean;
}

export function BatchDelete<T>({
  selectedRowKeys,
  dataSource,
  onBatchDelete,
  itemName = "项目",
  getDisplayName,
  getDisplayInfo,
  loading: externalLoading,
  disabled: externalDisabled,
}: BatchDeleteProps<T>) {
  const [loading, setLoading] = useState(false);
  const disabled = externalDisabled || selectedRowKeys.length === 0;

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning(`请至少选择一个${itemName}`);
      return;
    }

    const selectedItems = dataSource.filter((item) =>
      selectedRowKeys.includes((item as any)._id || (item as any).id),
    );

    Modal.confirm({
      title: `批量删除确认`,
      icon: <ExclamationCircleOutlined />,
      width: 600,
      content: (
        <div>
          <p>
            您已选择 <strong>{selectedRowKeys.length}</strong> 个{itemName}
            ，确定要批量删除吗？
          </p>
          <div
            style={{ maxHeight: "200px", overflowY: "auto", marginTop: "16px" }}
          >
            {selectedItems.map((item) => {
              const itemId = (item as any)._id || (item as any).id;
              return (
                <div
                  key={itemId}
                  style={{
                    padding: "8px 0",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <div style={{ fontWeight: 500 }}>{getDisplayName(item)}</div>
                  {getDisplayInfo && (
                    <div style={{ fontSize: "12px", color: "#888" }}>
                      {getDisplayInfo(item)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p style={{ marginTop: "16px", color: "#ff4d4f", fontSize: "12px" }}>
            <ExclamationCircleOutlined /> 删除后将无法恢复，请谨慎操作
          </p>
        </div>
      ),
      okText: `确认批量删除`,
      okButtonProps: { danger: true, loading: loading || externalLoading },
      cancelText: "取消",
      onOk: async () => {
        setLoading(true);
        try {
          const result = await onBatchDelete(selectedRowKeys as string[]);

          if (result.success) {
          } else {
            message.error(`批量删除失败，请重试`);
          }
        } catch (error: any) {
          console.error(`批量删除失败:`, error);
          message.error(
            error.response?.data?.message || `批量删除失败，请重试`,
          );
        } finally {
          setLoading(false);
        }
      },
    });
  };

  return (
    <Button
      danger
      icon={<DeleteFilled />}
      disabled={disabled}
      loading={loading || externalLoading}
      onClick={handleBatchDelete}
    >
      批量删除 ({selectedRowKeys.length})
    </Button>
  );
}

export default BatchDelete;
