import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type {
  Patient,
  PatientFormData,
  PatientsApiResponse,
} from "../types/patient";
import type { AppDispatch } from "../store/store";
import { API_ENDPOINTS, PAGINATION, ERROR_MESSAGES } from "../utils/constants";

export interface PatientState {
  patients: Patient[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  lastLoadedPageSize: number;
  paginationError: boolean;
  nextPageToLoad: number;
}

const initialState: PatientState = {
  patients: [],
  loading: false,
  error: null,
  currentPage: -1,
  totalPages: 0,
  totalElements: 0,
  lastLoadedPageSize: 0,
  paginationError: false,
  nextPageToLoad: 0,
};

export const fetchPatients = createAsyncThunk<
  PatientsApiResponse,
  { page: number; reset?: boolean; initialLoad?: boolean; size?: number },
  { rejectValue: string; dispatch: AppDispatch }
>(
  "patients/fetchPatients",
  async (
    { page, initialLoad = false, size, reset = false },
    { dispatch, rejectWithValue }
  ) => {
    try {
      if (reset) {
        dispatch(resetPatientsState());
      }
      const fetchSize =
        size ||
        (initialLoad
          ? PAGINATION.INITIAL_PAGE_SIZE
          : PAGINATION.ADDITIONAL_PAGE_SIZE);
      const response = await axios.get<PatientsApiResponse>(
        `${API_ENDPOINTS.PATIENTS}?page=${page}&size=${fetchSize}&sort=id,asc`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || ERROR_MESSAGES.FETCH_ERROR
        );
      }
      return rejectWithValue(ERROR_MESSAGES.UNKNOWN_ERROR);
    }
  }
);

export const deletePatient = createAsyncThunk<
  number,
  number,
  { dispatch: AppDispatch; rejectValue: string }
>("patients/deletePatient", async (id, { dispatch, rejectWithValue }) => {
  try {
    await axios.delete(`${API_ENDPOINTS.PATIENTS}/${id}`);
    await dispatch(fetchPatients({ page: 0, reset: true, initialLoad: true }));
    return id;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response && error.code === "ECONNABORTED") {
        return rejectWithValue(ERROR_MESSAGES.SERVICE_UNAVAILABLE);
      }
      if (!error.response) {
        return rejectWithValue(ERROR_MESSAGES.SERVICE_UNAVAILABLE);
      }
      return rejectWithValue(
        error.response?.data?.message || ERROR_MESSAGES.DELETE_ERROR
      );
    }
    return rejectWithValue(ERROR_MESSAGES.SERVICE_UNAVAILABLE);
  }
});

export const createPatient = createAsyncThunk<
  Patient,
  PatientFormData,
  { dispatch: AppDispatch; rejectValue: string }
>(
  "patients/createPatient",
  async (patientData, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.post<Patient>(
        API_ENDPOINTS.PATIENTS,
        patientData
      );
      await dispatch(
        fetchPatients({ page: 0, reset: true, initialLoad: true })
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (!error.response && error.code === "ECONNABORTED") {
          return rejectWithValue(ERROR_MESSAGES.SERVICE_UNAVAILABLE);
        }
        if (!error.response) {
          return rejectWithValue(ERROR_MESSAGES.SERVICE_UNAVAILABLE);
        }
        return rejectWithValue(
          error.response?.data?.message || ERROR_MESSAGES.CREATE_ERROR
        );
      }
      return rejectWithValue(ERROR_MESSAGES.SERVICE_UNAVAILABLE);
    }
  }
);

export const updatePatient = createAsyncThunk<
  Patient,
  { id: number; patientData: PatientFormData },
  { dispatch: AppDispatch; rejectValue: string }
>(
  "patients/updatePatient",
  async ({ id, patientData }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.put<Patient>(
        `${API_ENDPOINTS.PATIENTS}/${id}`,
        patientData
      );
      await dispatch(
        fetchPatients({ page: 0, reset: true, initialLoad: true })
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (!error.response && error.code === "ECONNABORTED") {
          return rejectWithValue(ERROR_MESSAGES.SERVICE_UNAVAILABLE);
        }
        if (!error.response) {
          return rejectWithValue(ERROR_MESSAGES.SERVICE_UNAVAILABLE);
        }
        return rejectWithValue(
          error.response?.data?.message || ERROR_MESSAGES.UPDATE_ERROR
        );
      }
      return rejectWithValue(ERROR_MESSAGES.SERVICE_UNAVAILABLE);
    }
  }
);

const patientSlice = createSlice({
  name: "patients",
  initialState,
  reducers: {
    clearError(state: PatientState): void {
      state.error = null;
    },
    resetPatientsState(state: PatientState): void {
      state.patients = [];
      state.currentPage = -1;
      state.totalElements = 0;
      state.totalPages = 0;
      state.lastLoadedPageSize = 0;
      state.paginationError = false;
      state.nextPageToLoad = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatients.pending, (state: PatientState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state: PatientState, action) => {
        if (action.meta.arg.reset) {
          state.patients = action.payload.content;
        } else {
          const newPatients = action.payload.content.filter(
            (p) => !state.patients.some((sp) => sp.id === p.id)
          );
          state.patients.push(...newPatients);
        }
        state.currentPage = action.payload.page.number;
        state.totalPages = action.payload.page.totalPages;
        state.totalElements = action.payload.page.totalElements;
        state.lastLoadedPageSize = action.payload.content.length;
        state.loading = false;
        state.error = null;
        state.paginationError = false;
        state.nextPageToLoad = state.currentPage + 1;
      })
      .addCase(fetchPatients.rejected, (state: PatientState, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.paginationError =
          state.patients.length > 0 && !action.meta.arg.reset;
        state.error = ERROR_MESSAGES.FETCH_ERROR;
        if (!state.paginationError && state.patients.length === 0) {
          state.nextPageToLoad = 0;
          state.patients = [];
        }
      })
      .addMatcher(
        (action) =>
          [
            deletePatient.pending.type,
            createPatient.pending.type,
            updatePatient.pending.type,
          ].includes(action.type),
        (state: PatientState) => {
          state.loading = true;
          state.error = null;
          state.paginationError = false;
        }
      )
      .addMatcher(
        (action) =>
          [
            deletePatient.rejected.type,
            createPatient.rejected.type,
            updatePatient.rejected.type,
          ].includes(action.type),
        (state: PatientState, action: PayloadAction<string>) => {
          state.loading = false;
          state.error = action.payload;
          state.paginationError = false;
        }
      )
      .addMatcher(
        (action) =>
          [
            deletePatient.fulfilled.type,
            createPatient.fulfilled.type,
            updatePatient.fulfilled.type,
          ].includes(action.type),
        (state: PatientState) => {
          state.loading = false;
          state.paginationError = false;
        }
      );
  },
});

export const { clearError, resetPatientsState } = patientSlice.actions;
export default patientSlice.reducer;
