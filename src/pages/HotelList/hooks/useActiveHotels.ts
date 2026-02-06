import { useMemo } from "react";
import { useAuditData } from "../../AuditRecords/hooks/useAuditData";
export const useActiveHotels = () => {
  const { data, loading, refresh } = useAuditData();

  // 使用 useMemo 优化性能，只有当原始数据 data 改变时才重新过滤
  const activeHotels = useMemo(() => {
    if (!data) return [];
    // 严格过滤：状态为 'approved' 且未被虚拟删除
    return data.filter(
      (item: any) => item.status === "approved" && !item.isDeleted,
    );
  }, [data]);

  // 统计在线数量
  const activeCount = activeHotels.length;

  return {
    activeHotels,
    activeCount,
    loading,
    refresh,
  };
};
