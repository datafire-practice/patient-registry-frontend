import { useState, useCallback } from "react";
import type { Patient, PatientFormData } from "../../types";

interface UsePatientDialogResult {
  openDeleteDialog: boolean;
  openEditDialog: boolean;
  openCreateDialog: boolean;
  openDetailsModal: boolean;
  selectedPatientId: number | null;
  patientFormDataForEdit: PatientFormData | null;
  isRefreshing: boolean;
  setOpenDeleteDialog: (open: boolean) => void;
  setOpenEditDialog: (open: boolean) => void;
  setOpenCreateDialog: (open: boolean) => void;
  setOpenDetailsModal: (open: boolean) => void;
  setSelectedPatientId: (id: number | null) => void;
  setPatientFormDataForEdit: (data: PatientFormData | null) => void;
  setIsRefreshing: (refreshing: boolean) => void;
  handleDeleteClick: (id: number) => void;
  handleEditClick: (patient: Patient) => void;
  handleCreateClick: () => void;
  handleCloseDetailsModal: () => void;
}

export const usePatientDialog = (): UsePatientDialogResult => {
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
  const [openCreateDialog, setOpenCreateDialog] = useState<boolean>(false);
  const [openDetailsModal, setOpenDetailsModal] = useState<boolean>(false);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    null
  );
  const [patientFormDataForEdit, setPatientFormDataForEdit] =
    useState<PatientFormData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleDeleteClick = useCallback((id: number): void => {
    setSelectedPatientId(id);
    setOpenDeleteDialog(true);
  }, []);

  const handleEditClick = useCallback((patient: Patient): void => {
    setPatientFormDataForEdit({
      lastName: patient.lastName,
      firstName: patient.firstName,
      middleName: patient.middleName || "",
      gender: patient.gender,
      birthDate: patient.birthDate,
      insuranceNumber: patient.insuranceNumber,
    });
    setSelectedPatientId(patient.id);
    setOpenEditDialog(true);
  }, []);

  const handleCreateClick = useCallback((): void => {
    setPatientFormDataForEdit(null);
    setSelectedPatientId(null);
    setOpenCreateDialog(true);
  }, []);

  const handleCloseDetailsModal = useCallback((): void => {
    setOpenDetailsModal(false);
  }, []);

  return {
    openDeleteDialog,
    openEditDialog,
    openCreateDialog,
    openDetailsModal,
    selectedPatientId,
    patientFormDataForEdit,
    isRefreshing,
    setOpenDeleteDialog,
    setOpenEditDialog,
    setOpenCreateDialog,
    setOpenDetailsModal,
    setSelectedPatientId,
    setPatientFormDataForEdit,
    setIsRefreshing,
    handleDeleteClick,
    handleEditClick,
    handleCreateClick,
    handleCloseDetailsModal,
  };
};
