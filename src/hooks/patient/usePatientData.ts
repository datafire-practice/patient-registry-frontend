import { useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store/store";
import {
  fetchPatients,
  clearError,
  resetPatientsState,
  setSelectedPatient,
} from "../../store/patientSlice";
import { PAGINATION } from "../../utils/constants";
import type { Patient } from "../../types";

interface UsePatientDataResult {
  patients: Patient[];
  loading: boolean;
  error: string | null;
  totalElements: number;
  paginationError: boolean;
  selectedPatient: Patient | null;
  tableContainerRef: React.RefObject<HTMLDivElement | null>;
  handleRefresh: () => Promise<void>;
  handleCloseErrorSnackbar: () => void;
  handleRowClick: (patient: Patient) => void;
}

export const usePatientData = (): UsePatientDataResult => {
  const dispatch: AppDispatch = useDispatch<AppDispatch>();
  const {
    patients,
    loading,
    error,
    totalElements,
    paginationError,
    selectedPatient,
  } = useSelector((state: RootState) => state.patients);

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const hasMore: boolean = patients.length < totalElements;

  const calculateNextPageToLoad = useCallback((): number => {
    if (patients.length === 0) {
      return 0;
    }
    return Math.ceil(patients.length / PAGINATION.ADDITIONAL_PAGE_SIZE);
  }, [patients.length]);

  useEffect((): void => {
    dispatch(
      fetchPatients({
        page: 0,
        reset: true,
        initialLoad: true,
        size: PAGINATION.INITIAL_PAGE_SIZE,
      })
    );
  }, [dispatch]);

  const handleScroll = useCallback((): void => {
    if (!tableContainerRef.current || loading || !hasMore || paginationError) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = tableContainerRef.current;
    if (scrollHeight - scrollTop <= clientHeight + 100) {
      const nextPage: number = calculateNextPageToLoad();
      dispatch(
        fetchPatients({
          page: nextPage,
          reset: false,
          initialLoad: false,
          size: PAGINATION.ADDITIONAL_PAGE_SIZE,
        })
      );
    }
  }, [dispatch, loading, hasMore, paginationError, calculateNextPageToLoad]);

  useEffect((): (() => void) => {
    const container: HTMLDivElement | null = tableContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return (): void => {
        container.removeEventListener("scroll", handleScroll);
      };
    }
    return (): void => {};
  }, [handleScroll]);

  const handleRefresh = useCallback(async (): Promise<void> => {
    if (tableContainerRef.current && !paginationError) {
      tableContainerRef.current.scrollTop = 0;
    }

    if (paginationError) {
      const nextPage: number = calculateNextPageToLoad();
      await dispatch(
        fetchPatients({
          page: nextPage,
          reset: false,
          initialLoad: false,
          size: PAGINATION.ADDITIONAL_PAGE_SIZE,
        })
      ).unwrap();
    } else {
      dispatch(resetPatientsState());
      await dispatch(
        fetchPatients({
          page: 0,
          reset: true,
          initialLoad: true,
          size: PAGINATION.INITIAL_PAGE_SIZE,
        })
      ).unwrap();
    }
  }, [dispatch, paginationError, calculateNextPageToLoad]);

  const handleCloseErrorSnackbar = useCallback((): void => {
    dispatch(clearError());
  }, [dispatch]);

  const handleRowClick = useCallback(
    (patient: Patient): void => {
      dispatch(setSelectedPatient(patient));
    },
    [dispatch]
  );

  return {
    patients,
    loading,
    error,
    totalElements,
    paginationError,
    selectedPatient,
    tableContainerRef,
    handleRefresh,
    handleCloseErrorSnackbar,
    handleRowClick,
  };
};
