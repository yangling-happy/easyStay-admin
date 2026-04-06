import { create } from 'zustand';
import type { Hotel } from '../types/hotel';

interface HotelState {
  hotels: Hotel[];
  // 新增酒店
  addHotel: (hotel: Hotel) => void;
  // 更新酒店（包括审核、下线）
  updateHotel: (id: string, updates: Partial<Hotel>) => void;
  // 批量初始化（后期从接口获取时用）
  setHotels: (hotels: Hotel[]) => void;
}

export const useHotelStore = create<HotelState>((set) => ({
  hotels: [], 
  addHotel: (hotel) => set((state) => ({ 
    hotels: [hotel, ...state.hotels] 
  })),
  updateHotel: (id, updates) => set((state) => ({
    hotels: state.hotels.map(h => h.id === id ? { ...h, ...updates } : h)
  })),
  setHotels: (hotels) => set({ hotels }),
}));