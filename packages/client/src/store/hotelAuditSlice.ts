import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { auditService } from "../api/services/auditService";
import type { Hotel } from "../types/hotel";
import { transitHotelAuditState } from "./hotelAuditFsm";

export type AuditFilter =
  | "all"
  | "pending"
  | "published"
  | "rejected"
  | "offline";

export interface HotelAuditState {
  hotels: Hotel[];
  loading: boolean;
  error: string | null;
  statusFilter: AuditFilter;
  searchText: string;
  rejectOpen: boolean;
  detailOpen: boolean;
  currentHotelId: string | null;
}

const initialState: HotelAuditState = {
  hotels: [],
  loading: false,
  error: null,
  statusFilter: "all",
  searchText: "",
  rejectOpen: false,
  detailOpen: false,
  currentHotelId: null,
};

const normalizeHotel = (hotel: any): Hotel => ({
  ...hotel,
  id: hotel.id || hotel._id?.toString() || hotel._id,
});

const mergeDefined = <T extends Record<string, any>>(
  base: T,
  override: Partial<T>,
) => {
  const next = { ...base };
  Object.entries(override).forEach(([key, value]) => {
    if (value !== undefined) {
      (next as any)[key] = value;
    }
  });
  return next;
};

const fetchHotelsByFilter = async (
  statusFilter: AuditFilter,
): Promise<Hotel[]> => {
  switch (statusFilter) {
    case "pending":
      return (await auditService.getPendingHotels()).map(normalizeHotel);
    case "published":
      return (await auditService.getPublishedHotels()).map(normalizeHotel);
    case "rejected":
      return (await auditService.getRejectedHotels()).map(normalizeHotel);
    case "offline":
      return (await auditService.getOfflineHotels()).map(normalizeHotel);
    case "all":
    default: {
      const [pending, published, rejected, offline] = await Promise.all([
        auditService.getPendingHotels(),
        auditService.getPublishedHotels(),
        auditService.getRejectedHotels(),
        auditService.getOfflineHotels(),
      ]);
      return [...pending, ...published, ...rejected, ...offline].map(
        normalizeHotel,
      );
    }
  }
};

export const fetchAuditHotels = createAsyncThunk(
  "hotelAudit/fetchAuditHotels",
  async (statusFilter: AuditFilter) => {
    return fetchHotelsByFilter(statusFilter);
  },
);

export const approveHotel = createAsyncThunk(
  "hotelAudit/approveHotel",
  async (id: string) => {
    const result = await auditService.submitAudit(id, "approved");
    return { id, result };
  },
);

export const rejectHotel = createAsyncThunk(
  "hotelAudit/rejectHotel",
  async ({ id, reason }: { id: string; reason: string }) => {
    const result = await auditService.submitAudit(id, "rejected", reason);
    return { id, reason, result };
  },
);

export const toggleHotelOnlineStatus = createAsyncThunk(
  "hotelAudit/toggleHotelOnlineStatus",
  async ({ id, toActive }: { id: string; toActive: boolean }) => {
    const result = await auditService.toggleHotelStatus(id);
    return { id, toActive, result };
  },
);

const hotelAuditSlice = createSlice({
  name: "hotelAudit",
  initialState,
  reducers: {
    setStatusFilter: (state, action: PayloadAction<AuditFilter>) => {
      state.statusFilter = action.payload;
    },
    setSearchText: (state, action: PayloadAction<string>) => {
      state.searchText = action.payload;
    },
    openRejectModal: (state, action: PayloadAction<string>) => {
      state.currentHotelId = action.payload;
      state.rejectOpen = true;
    },
    closeRejectModal: (state) => {
      state.rejectOpen = false;
      state.currentHotelId = null;
    },
    openDetailDrawer: (state, action: PayloadAction<string>) => {
      state.currentHotelId = action.payload;
      state.detailOpen = true;
    },
    closeDetailDrawer: (state) => {
      state.detailOpen = false;
      state.currentHotelId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuditHotels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuditHotels.fulfilled, (state, action) => {
        const validData = action.payload.filter(
          (hotel) =>
            hotel &&
            (hotel.id || (hotel as any)._id) &&
            hotel.name &&
            hotel.status,
        );
        state.hotels = validData;
        state.loading = false;
      })
      .addCase(fetchAuditHotels.rejected, (state, action) => {
        state.loading = false;
        state.hotels = [];
        state.error = action.error.message || "加载审核酒店失败";
      })
      .addCase(approveHotel.fulfilled, (state, action) => {
        const { id, result } = action.payload;
        state.hotels = state.hotels.map((hotel) => {
          if (hotel.id !== id) return hotel;
          const transitioned = transitHotelAuditState(hotel, {
            type: "APPROVE",
          });
          return mergeDefined(transitioned, normalizeHotel(result.hotel));
        });
      })
      .addCase(rejectHotel.fulfilled, (state, action) => {
        const { id, reason, result } = action.payload;
        state.hotels = state.hotels.map((hotel) => {
          if (hotel.id !== id) return hotel;
          const transitioned = transitHotelAuditState(hotel, {
            type: "REJECT",
            reason,
          });
          return mergeDefined(transitioned, normalizeHotel(result.hotel));
        });
      })
      .addCase(toggleHotelOnlineStatus.fulfilled, (state, action) => {
        const { id, toActive, result } = action.payload;
        state.hotels = state.hotels.map((hotel) => {
          if (hotel.id !== id) return hotel;
          const transitioned = transitHotelAuditState(hotel, {
            type: toActive ? "RESTORE" : "OFFLINE",
          });
          return mergeDefined(transitioned, normalizeHotel(result.hotel));
        });
      });
  },
});

export const {
  setStatusFilter,
  setSearchText,
  openRejectModal,
  closeRejectModal,
  openDetailDrawer,
  closeDetailDrawer,
} = hotelAuditSlice.actions;

export default hotelAuditSlice.reducer;
