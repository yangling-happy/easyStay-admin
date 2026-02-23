import { useAuditData } from "../../AuditRecords/hooks/useAuditData";
export const useActiveHotels = () => {
  const { data, loading, refresh } = useAuditData();

  const allHotels = data
    ? data.filter(
        (item: any) =>
          !item.isDeleted && item.status === "approved",
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
