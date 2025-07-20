import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import type { Disease } from "../../types/patient";
import DiseaseForm from "../DiseaseForm/DiseaseForm";

interface DiseaseModalFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  patientId: number;
  disease?: Disease;
  mode: "add" | "edit";
}

const DiseaseModalForm: React.FC<DiseaseModalFormProps> = ({
  open,
  onClose,
  onSubmit,
  patientId,
  disease,
  mode,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {mode === "add"
          ? "Добавление заболевания"
          : "Редактирование заболевания"}
      </DialogTitle>
      <DialogContent>
        <DiseaseForm
          onSubmit={onSubmit}
          patientId={patientId}
          disease={disease}
          mode={mode}
          onClose={onClose}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DiseaseModalForm;
