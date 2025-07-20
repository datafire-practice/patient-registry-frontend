import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import { fetchPatientDiseases, deleteDisease } from "../../store/diseaseSlice";
import type { Disease } from "../../types";

interface UsePatientDiseasesDataResult {
  patientDiseases: Disease[];
  diseasesLoading: boolean;
  diseasesError: string | null;
  diseasesCurrentPage: number;
  diseasesTotalPages: number;
  paginationError: boolean | null;
  handleLoadMoreDiseases: () => void;
  handleRefreshDiseases: () => Promise<void>;
  handleDeleteDisease: (diseaseId: number) => Promise<void>;
}

export const usePatientDiseasesData = (
  patientId: number | undefined,
  isOpen: boolean
): UsePatientDiseasesDataResult => {
  const dispatch: AppDispatch = useDispatch<AppDispatch>();
  const {
    patientDiseases,
    diseasesLoading,
    diseasesError,
    diseasesCurrentPage,
    diseasesTotalPages,
    paginationError,
  } = useSelector((state: RootState) => state.diseases);

  useEffect((): void => {
    if (isOpen && patientId) {
      dispatch(
        fetchPatientDiseases({
          patientId: patientId,
          page: 0,
          reset: true,
        })
      );
    } else if (!isOpen) {
      dispatch({ type: "diseases/resetState" });
    }
  }, [isOpen, patientId, dispatch]);

  const handleLoadMoreDiseases = useCallback((): void => {
    if (
      patientId &&
      diseasesCurrentPage < diseasesTotalPages - 1 &&
      !diseasesLoading
    ) {
      dispatch(
        fetchPatientDiseases({
          patientId: patientId,
          page: diseasesCurrentPage + 1,
          reset: false,
        })
      );
    }
  }, [
    patientId,
    diseasesCurrentPage,
    diseasesTotalPages,
    diseasesLoading,
    dispatch,
  ]);

  const handleRefreshDiseases = useCallback(async (): Promise<void> => {
    if (patientId) {
      try {
        if (paginationError) {
          await dispatch(
            fetchPatientDiseases({
              patientId: patientId,
              page: diseasesCurrentPage + 1,
              reset: false,
            })
          ).unwrap();
        } else {
          await dispatch(
            fetchPatientDiseases({
              patientId: patientId,
              page: 0,
              reset: true,
            })
          ).unwrap();
        }
      } catch (error) {
        console.error("Error refreshing diseases:", error);
      }
    }
  }, [patientId, paginationError, diseasesCurrentPage, dispatch]);

  const handleDeleteDisease = useCallback(
    async (diseaseId: number): Promise<void> => {
      if (patientId) {
        try {
          await dispatch(
            deleteDisease({ patientId: patientId, diseaseId: diseaseId })
          ).unwrap();
          await dispatch(
            fetchPatientDiseases({
              patientId: patientId,
              page: 0,
              reset: true,
            })
          ).unwrap();
        } catch (error) {
          console.error("Error deleting disease:", error);
        }
      }
    },
    [patientId, dispatch]
  );

  return {
    patientDiseases,
    diseasesLoading,
    diseasesError,
    diseasesCurrentPage,
    diseasesTotalPages,
    paginationError,
    handleLoadMoreDiseases,
    handleRefreshDiseases,
    handleDeleteDisease,
  };
};
