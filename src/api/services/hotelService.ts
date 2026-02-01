import type { Hotel } from "../../types/hotel";

const STORAGE_KEY = "ctrip_hotels_data";


// 初始化 Mock 数据
const initMockData = (): Hotel[] => {
  const mockHotels: Hotel[] = [
    {
      id: 'hotel_001',
      name: '上海外滩国际酒店',
      nameEn: 'Shanghai Bund International Hotel',
      address: '上海市黄浦区外滩中山东一路1号',
      star: 5,
      status: 'pending',
      isDeleted: false,
      roomTypes: [
        { id: 'room_001', name: '豪华大床房', price: 888, stock: 10 },
        { id: 'room_002', name: '标准双床房', price: 688, stock: 15 }
      ],
      createTime: '2024-01-15 10:30:00'
    },
    {
      id: 'hotel_002',
      name: '北京国贸大酒店',
      nameEn: 'Beijing CBD Grand Hotel',
      address: '北京市朝阳区建国门外大街1号',
      star: 4,
      status: 'pending',
      isDeleted: false,
      roomTypes: [
        { id: 'room_003', name: '商务套房', price: 1288, stock: 5 }
      ],
      createTime: '2024-01-16 14:20:00'
    },
    {
      id: 'hotel_003',
      name: '广州天河商务酒店',
      nameEn: 'Guangzhou Tianhe Business Hotel',
      address: '广州市天河区天河路123号',
      star: 3,
      status: 'approved',
      isDeleted: false,
      roomTypes: [
        { id: 'room_004', name: '标准间', price: 388, stock: 20 }
      ],
      createTime: '2024-01-10 09:15:00'
    }
  ];
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockHotels));
  return mockHotels;
};




/**
 * 酒店业务逻辑封装 (Service 层)
 * 作用：统一管理数据的增删改查，屏蔽存储细节
 */
export const hotelService = {
  // 1. 获取所有酒店 (支持过滤掉已逻辑删除的)
  getHotels: (): Hotel[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    
    // 如果没有数据，初始化 Mock 数据
    if (!data || data === '[]' || data === 'null') {
      return initMockData();
    }
    
    try {
      const parsed = JSON.parse(data);
      // 如果解析后是空数组，也初始化数据
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return initMockData();
      }
      return parsed;
    } catch (error) {
      console.error('解析酒店数据失败:', error);
      // 如果解析失败，重新初始化
      return initMockData();
    }
  },
  // 2. 根据 ID 获取单个酒店
  getHotelById: (id: string): Hotel | undefined => {
    const hotels = hotelService.getHotels();
    return hotels.find((h) => h.id === id);
  },

  // 3. 保存/新增酒店
  saveHotel: (hotel: Hotel): void => {
    const hotels = hotelService.getHotels();
    const index = hotels.findIndex((h) => h.id === hotel.id);

    if (index > -1) {
      // 更新
      hotels[index] = hotel;
    } else {
      // 新增 (放在最前面)
      hotels.unshift(hotel);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(hotels));
  },

  // 4. 审核操作 (快捷方法)
  auditHotel: (id: string, status: Hotel["status"], reason?: string): void => {
    const hotels = hotelService.getHotels();
    const index = hotels.findIndex((h) => h.id === id);
    if (index > -1) {
      hotels[index].status = status;
      if (reason) hotels[index].rejectReason = reason;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(hotels));
    }
  },

  // 5. 逻辑删除/下线
  deleteHotel: (id: string): void => {
    const hotels = hotelService.getHotels();
    const index = hotels.findIndex((h) => h.id === id);
    if (index > -1) {
      hotels[index].isDeleted = true; // 仅标记，不物理删除
      localStorage.setItem(STORAGE_KEY, JSON.stringify(hotels));
    }
  },


  // 6. 恢复酒店
  restoreHotel: (id: string): void => {
    const hotels = hotelService.getHotels();
    const index = hotels.findIndex((h) => h.id === id);
    if (index > -1) {
      hotels[index].isDeleted = false;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(hotels));
    }
  },

  // 7. 按状态获取酒店
  getHotelsByStatus: (status: Hotel["status"]): Hotel[] => {
    const hotels = hotelService.getHotels();
    return hotels.filter((h) => h.status === status);
  },


  // 8. 获取待审核酒店
  getPendingHotels: (): Hotel[] => {
    const hotels = hotelService.getHotels();
    return hotels.filter((h) => h.status === 'pending');
  },
};

