import { useCallback } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store/store";
import {
  deletePatient,
  createPatient,
  updatePatient,
} from "../../store/patientSlice";
import type { PatientFormData } from "../../types";

interface UsePatientActionsResult {
  handleDeleteConfirm: (id: number) => Promise<void>;
  handleSubmitForm: (
    data: PatientFormData,
    selectedPatientId: number | null
  ) => Promise<void>;
}

export const usePatientActions = (): UsePatientActionsResult => {
  const dispatch: AppDispatch = useDispatch<AppDispatch>();

  const handleDeleteConfirm = useCallback(
    async (id: number): Promise<void> => {
      await dispatch(deletePatient(id)).unwrap();
    },
    [dispatch]
  );

  const handleSubmitForm = useCallback(
    async (
      data: PatientFormData,
      selectedPatientId: number | null
    ): Promise<void> => {
      if (selectedPatientId) {
        await dispatch(
          updatePatient({ id: selectedPatientId, patientData: data })
        ).unwrap();
      } else {
        await dispatch(createPatient(data)).unwrap();
      }
    },
    [dispatch]
  );

  return { handleDeleteConfirm, handleSubmitForm };
};
