import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import type {
  Disease,
  DiseasesApiResponse,
  DiseaseFormData,
} from "../types/patient";
import type { AppDispatch } from "../store/store";
import { API_ENDPOINTS, ERROR_MESSAGES, PAGINATION } from "../utils/constants";

export interface DiseaseState {
  patientDiseases: Disease[];
  diseasesLoading: boolean;
  diseasesError: string | null;
  diseasesCurrentPage: number;
  diseasesTotalPages: number;
  diseasesTotalElements: number;
  lastLoadedDiseases: number[];
  paginationError: boolean;
}

const initialState: DiseaseState = {
  patientDiseases: [],
  diseasesLoading: false,
  diseasesError: null,
  diseasesCurrentPage: -1,
  diseasesTotalPages: 0,
  diseasesTotalElements: 0,
  lastLoadedDiseases: [],
  paginationError: false,
};

export const fetchPatientDiseases = createAsyncThunk<
  DiseasesApiResponse,
  { patientId: number; page: number; reset?: boolean },
  { rejectValue: string }
>(
  "diseases/fetchPatientDiseases",
  async ({ patientId, page }, { rejectWithValue }) => {
    try {
      const response = await axios.get<DiseasesApiResponse>(
        `${API_ENDPOINTS.PATIENT_DISEASES(patientId)}?page=${page}&size=${
          PAGINATION.DISEASES_PAGE_SIZE
        }&sort=startDate,desc`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (!error.response || error.code === "ECONNABORTED") {
          return rejectWithValue(ERROR_MESSAGES.SERVICE_UNAVAILABLE);
        }
        return rejectWithValue(
          error.response?.data?.message || ERROR_MESSAGES.FETCH_DISEASES_ERROR
        );
      }
      return rejectWithValue(ERROR_MESSAGES.UNKNOWN_ERROR);
    }
  }
);

export const createDisease = createAsyncThunk<
  Disease,
  { patientId: number; diseaseData: DiseaseFormData },
  { rejectValue: string }
>(
  "diseases/createDisease",
  async ({ patientId, diseaseData }, { rejectWithValue }) => {
    try {
      const response = await axios.post<Disease>(
        API_ENDPOINTS.PATIENT_DISEASES(patientId),
        diseaseData
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (!error.response || error.code === "ECONNABORTED") {
          return rejectWithValue(ERROR_MESSAGES.SERVICE_UNAVAILABLE);
        }
        return rejectWithValue(
          error.response?.data?.message || ERROR_MESSAGES.CREATE_DISEASE_ERROR
        );
      }
      return rejectWithValue(ERROR_MESSAGES.UNKNOWN_ERROR);
    }
  }
);

export const deleteDisease = createAsyncThunk<
  number,
  { patientId: number; diseaseId: number },
  { rejectValue: string; dispatch: AppDispatch }
>(
  "diseases/deleteDisease",
  async ({ patientId, diseaseId }, { rejectWithValue }) => {
    try {
      await axios.delete(API_ENDPOINTS.DISEASE(patientId, diseaseId));
      return diseaseId;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (!error.response || error.code === "ECONNABORTED") {
          return rejectWithValue(ERROR_MESSAGES.SERVICE_UNAVAILABLE);
        }
        return rejectWithValue(
          error.response?.data?.message || ERROR_MESSAGES.DELETE_DISEASE_ERROR
        );
      }
      return rejectWithValue(ERROR_MESSAGES.UNKNOWN_ERROR);
    }
  }
);

const diseaseSlice = createSlice({
  name: "diseases",
  initialState,
  reducers: {
    resetState: () => {
      return initialState;
    },
    clearDiseasesError(state: DiseaseState): void {
      state.diseasesError = null;
      state.paginationError = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatientDiseases.pending, (state: DiseaseState) => {
        state.diseasesLoading = true;
        state.diseasesError = null;
      })
      .addCase(
        fetchPatientDiseases.fulfilled,
        (state: DiseaseState, action) => {
          const { content, number, totalPages, totalElements } = action.payload;

          if (action.meta.arg.reset) {
            state.patientDiseases = content;
            state.diseasesCurrentPage = number;
          } else {
            const newDiseases = content.filter(
              (d) => !state.patientDiseases.some((pd) => pd.id === d.id)
            );
            state.patientDiseases.push(...newDiseases);
            state.diseasesCurrentPage = number;
          }

          state.diseasesTotalPages = totalPages;
          state.diseasesTotalElements = totalElements;
          state.diseasesLoading = false;
          state.diseasesError = null;
          state.paginationError = false;
        }
      )
      .addCase(fetchPatientDiseases.rejected, (state: DiseaseState, action) => {
        state.diseasesLoading = false;
        state.diseasesError = action.payload as string;
        state.paginationError = state.patientDiseases.length > 0;
      })
      .addCase(createDisease.pending, (state: DiseaseState) => {
        state.diseasesLoading = true;
        state.diseasesError = null;
      })
      .addCase(createDisease.fulfilled, (state: DiseaseState) => {
        state.diseasesLoading = false;
        state.diseasesError = null;
      })
      .addCase(createDisease.rejected, (state: DiseaseState, action) => {
        state.diseasesLoading = false;
        state.diseasesError = action.payload as string;
      })
      .addCase(deleteDisease.pending, (state: DiseaseState) => {
        state.diseasesLoading = true;
        state.diseasesError = null;
      })
      .addCase(deleteDisease.fulfilled, (state: DiseaseState, action) => {
        state.patientDiseases = state.patientDiseases.filter(
          (d) => d.id !== action.payload
        );
        state.diseasesTotalElements = state.diseasesTotalElements - 1;
        state.diseasesLoading = false;
      })
      .addCase(deleteDisease.rejected, (state: DiseaseState, action) => {
        state.diseasesLoading = false;
        state.diseasesError = action.payload as string;
      });
  },
});

export const { resetState } = diseaseSlice.actions;
export default diseaseSlice.reducer;
