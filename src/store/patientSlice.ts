import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { Patient, PatientFormData } from "../types/patient";

const API_URL = "http://localhost:3000/patient";
const INITIAL_LIMIT = 15;
const PAGE_LIMIT = 5;

export interface PatientState {
  patients: Patient[];
  loading: boolean;
  error: string | null;
  nextStart: number;
  hasMore: boolean;
}

const initialState: PatientState = {
  patients: [],
  loading: false,
  error: null,
  nextStart: 0,
  hasMore: true,
};

export const fetchPatients = createAsyncThunk(
  "patients/fetchPatients",
  async (
    {
      isInitialLoad = false,
      resetBeforeFetch = false,
    }: { isInitialLoad?: boolean; resetBeforeFetch?: boolean },
    { dispatch, getState, rejectWithValue }
  ) => {
    try {
      if (resetBeforeFetch) {
        dispatch(patientSlice.actions.resetPatients());
      }

      const state = getState() as { patients: PatientState };
      const { nextStart } = state.patients;
      const limit = isInitialLoad ? INITIAL_LIMIT : PAGE_LIMIT;
      const start = resetBeforeFetch ? 0 : nextStart;

      const response = await axios.get<Patient[]>(
        `${API_URL}?_start=${start}&_limit=${limit}`
      );
      return {
        patients: response.data,
        isInitialLoad: resetBeforeFetch || isInitialLoad,
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Неизвестная ошибка при получении"
      );
    }
  }
);

export const deletePatient = createAsyncThunk(
  "patients/deletePatient",
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      dispatch(patientSlice.actions.deletePatientSuccess(id));
      await dispatch(
        fetchPatients({ isInitialLoad: true, resetBeforeFetch: true })
      );
      return id;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNABORTED" || error.response === undefined) {
          return rejectWithValue("Сервис временно недоступен");
        }
        return rejectWithValue(
          error.response?.data?.message || "Ошибка при удалении пациента"
        );
      }
      return rejectWithValue("Неизвестная ошибка при удалении пациента");
    }
  }
);

export const createPatient = createAsyncThunk(
  "patients/createPatient",
  async (patientData: PatientFormData, { dispatch, rejectWithValue }) => {
    try {
      await axios.post(API_URL, patientData);
      await dispatch(
        fetchPatients({ isInitialLoad: true, resetBeforeFetch: true })
      );
      return;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNABORTED" || error.response === undefined) {
          return rejectWithValue("Сервис временно недоступен");
        }
        return rejectWithValue(
          error.response?.data?.message || "Ошибка при создании пациента"
        );
      }
      return rejectWithValue("Неизвестная ошибка при создании пациента");
    }
  }
);

export const updatePatient = createAsyncThunk(
  "patients/updatePatient",
  async (
    { id, patientData }: { id: number; patientData: PatientFormData },
    { dispatch, rejectWithValue }
  ) => {
    try {
      await axios.put(`${API_URL}/${id}`, patientData);
      await dispatch(
        fetchPatients({ isInitialLoad: true, resetBeforeFetch: true })
      );
      return;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNABORTED" || error.response === undefined) {
          return rejectWithValue("Сервис временно недоступен");
        }
        return rejectWithValue(
          error.response?.data?.message || "Ошибка при обновлении пациента"
        );
      }
      return rejectWithValue("Неизвестная ошибка при обновлении пациента");
    }
  }
);

const patientSlice = createSlice({
  name: "patients",
  initialState,
  reducers: {
    resetPatients(state) {
      state.patients = [];
      state.loading = false;
      state.error = null;
      state.nextStart = 0;
      state.hasMore = true;
    },
    deletePatientSuccess(state, action: PayloadAction<number>) {
      state.patients = state.patients.filter(
        (patient) => patient.id !== action.payload
      );
      state.nextStart = state.patients.length;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        if (action.payload.isInitialLoad) {
          state.patients = action.payload.patients;
        } else {
          state.patients = [...state.patients, ...action.payload.patients];
        }
        state.nextStart = state.patients.length;
        state.hasMore = action.payload.patients.length > 0;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deletePatient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePatient.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(deletePatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createPatient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPatient.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(createPatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updatePatient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePatient.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updatePatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetPatients, deletePatientSuccess, clearError } =
  patientSlice.actions;

export default patientSlice.reducer;
