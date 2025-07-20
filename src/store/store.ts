import { configureStore } from "@reduxjs/toolkit";
import patientReducer from "./patientSlice";
import diseaseReducer from "./diseaseSlice";

export const store = configureStore({
  reducer: {
    patients: patientReducer,
    diseases: diseaseReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
