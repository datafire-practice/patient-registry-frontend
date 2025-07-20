import { useState, useCallback } from "react";
import axios from "axios";
import { API_ENDPOINTS, ERROR_MESSAGES } from "../../utils/constants";

interface ApiDiseaseRequest {
  patient: {
    id: number;
  };
  mkb10: { code: string; name: string };
  startDate: string;
  endDate: string | null;
  prescriptions: string;
  sickLeaveIssued: boolean;
}

interface UseDiseaseFormSubmitResult {
  submissionError: string | null;
  isSubmitting: boolean;
  handleFormSubmit: (
    data: ApiDiseaseRequest,
    patientId: number,
    mode: "add" | "edit",
    diseaseId?: number
  ) => Promise<void>;
  clearSubmissionError: () => void;
}

export const useDiseaseFormSubmit = (
  onSubmitSuccess: () => void,
  onCloseForm: () => void
): UseDiseaseFormSubmitResult => {
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleFormSubmit = useCallback(
    async (
      data: ApiDiseaseRequest,
      patientId: number,
      mode: "add" | "edit",
      diseaseId?: number
    ): Promise<void> => {
      setSubmissionError(null);
      setIsSubmitting(true);
      try {
        if (!patientId) {
          throw new Error("Patient ID is missing");
        }

        const requestData: ApiDiseaseRequest = {
          ...data,
          endDate: data.endDate === "" ? null : data.endDate,
        };

        if (mode === "edit" && diseaseId) {
          await axios.put(
            `${API_ENDPOINTS.DISEASE(patientId, diseaseId)}`,
            requestData
          );
        } else {
          await axios.post(
            API_ENDPOINTS.PATIENT_DISEASES(patientId),
            requestData
          );
        }
        onSubmitSuccess();
        onCloseForm();
      } catch (error) {
        console.error("Error saving disease:", error);
        if (axios.isAxiosError(error)) {
          if (!error.response && error.code === "ECONNABORTED") {
            setSubmissionError(ERROR_MESSAGES.SERVICE_UNAVAILABLE);
          } else if (!error.response) {
            setSubmissionError(ERROR_MESSAGES.SERVICE_UNAVAILABLE);
          } else {
            setSubmissionError(
              error.response?.data?.message || ERROR_MESSAGES.UNKNOWN_ERROR
            );
          }
        } else {
          setSubmissionError(ERROR_MESSAGES.UNKNOWN_ERROR);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmitSuccess, onCloseForm]
  );

  const clearSubmissionError = useCallback((): void => {
    setSubmissionError(null);
  }, []);

  return {
    submissionError,
    isSubmitting,
    handleFormSubmit,
    clearSubmissionError,
  };
};
