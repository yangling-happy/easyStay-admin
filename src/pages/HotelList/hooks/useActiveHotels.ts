import { useAuditData } from "../../AuditRecords/hooks/useAuditData";
export const useActiveHotels = () => {
  const { data, loading, refresh } = useAuditData();

  // 包括已上线和已下线的酒店（允许恢复上线）
  const allHotels = data
    ? data.filter(
        (item: any) =>
          !item.isDeleted &&
          (item.status === "approved" || item.status === "offline"),
      )
    : [];

  const totalCount = allHotels.length;

  return {
    activeHotels: allHotels,
    activeCount: totalCount,
    loading,
    refresh,
  };
};
