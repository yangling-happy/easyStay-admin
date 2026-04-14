import { configureStore } from "@reduxjs/toolkit";
import hotelAuditReducer from "./hotelAuditSlice";

export const store = configureStore({
  reducer: {
    hotelAudit: hotelAuditReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
