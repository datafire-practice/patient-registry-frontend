import { useState, useCallback } from "react";
import type { Disease } from "../../types";

interface UsePatientDiseaseDialogsResult {
  openDeleteDialog: boolean;
  openEditDialog: boolean;
  openAddDialog: boolean;
  selectedDiseaseId: number | null;
  selectedDisease: Disease | null;
  setOpenDeleteDialog: (open: boolean) => void;
  setOpenEditDialog: (open: boolean) => void;
  setOpenAddDialog: (open: boolean) => void;
  handleDeleteClick: (diseaseId: number) => void;
  handleEditClick: (disease: Disease) => void;
  handleAddClick: () => void;
  handleDiseaseFormSubmitCallback: () => void;
}

export const usePatientDiseaseDialogs = (
  onDiseaseActionSuccess: () => void
): UsePatientDiseaseDialogsResult => {
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
  const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
  const [selectedDiseaseId, setSelectedDiseaseId] = useState<number | null>(
    null
  );
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);

  const handleDeleteClick = useCallback((diseaseId: number): void => {
    setSelectedDiseaseId(diseaseId);
    setOpenDeleteDialog(true);
  }, []);

  const handleEditClick = useCallback((disease: Disease): void => {
    setSelectedDisease(disease);
    setOpenEditDialog(true);
  }, []);

  const handleAddClick = useCallback((): void => {
    setSelectedDisease(null);
    setOpenAddDialog(true);
  }, []);

  const handleDiseaseFormSubmitCallback = useCallback((): void => {
    onDiseaseActionSuccess();
    setOpenEditDialog(false);
    setOpenAddDialog(false);
  }, [onDiseaseActionSuccess]);

  return {
    openDeleteDialog,
    openEditDialog,
    openAddDialog,
    selectedDiseaseId,
    selectedDisease,
    setOpenDeleteDialog,
    setOpenEditDialog,
    setOpenAddDialog,
    handleDeleteClick,
    handleEditClick,
    handleAddClick,
    handleDiseaseFormSubmitCallback,
  };
};
