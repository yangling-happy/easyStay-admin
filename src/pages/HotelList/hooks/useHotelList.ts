// src/pages/HotelList/hooks/useHotelList.ts
import { useState, useEffect } from 'react';
import type { Hotel } from '../../../types/hotel';
import { message } from 'antd';

export const useHotelList = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);

  // 获取列表数据
  const fetchHotels = async () => {
    setLoading(true);
    try {
      // 模拟 API 请求
      // const res = await api.getHotels();
      // setHotels(res);
    } finally {
      setLoading(false);
    }
  };

  // 切换上下线 (对应 PDF 中的发布/下线功能)
  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      // await api.updateHotel(id, { isActive: !currentStatus });
      message.success('操作成功');
      fetchHotels(); // 重新加载
    } catch (e) {
      message.error('操作失败');
    }
  };

  // 虚拟删除逻辑
  const deleteHotel = async (id: string) => {
    // 逻辑实现...
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  return { hotels, loading, toggleActive, deleteHotel, refresh: fetchHotels };
};