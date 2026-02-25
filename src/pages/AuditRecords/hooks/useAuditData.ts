// src/pages/AuditRecords/hooks/useAuditData.ts
import { useState, useEffect } from "react";
import { get } from "../../../api/http/request";
import { message } from "antd";

export const useAuditData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      // 这里的路径要对应后端路由，后端现在是通过 Token 自动识别 ownerId 的
      const res: any = await get("/hotels/records", { scope: "audit" });
      if (res.success) {
        const filtered = (res.data || []).filter((hotel: any) => {
          if (!hotel?.status) return false;
          if (hotel.status === "rejected" || hotel.status === "offline")
            return true;
          if (hotel.status === "pending" || hotel.status === "approved") {
            return hotel.isIncomplete === false;
          }
          return false;
        });
        setData(filtered);
      } else {
        message.error(res.message || "获取记录失败");
      }
    } catch (error) {
      console.error("Fetch records error:", error);
      message.error("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return { data, loading, refresh: fetchRecords };
};
