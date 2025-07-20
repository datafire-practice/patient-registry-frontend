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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxWidth: { xs: "100%", lg: "900px", xl: "1200px" },
          mx: "auto",
        },
      }}
    >
      <DialogTitle sx={{ pb: 2, fontSize: { xs: "1.1rem", lg: "1.25rem" } }}>
        {mode === "add"
          ? "Добавление заболевания"
          : "Редактирование заболевания"}
      </DialogTitle>
      <DialogContent
        dividers
        sx={{ borderColor: "divider", p: { xs: 2, lg: 3 } }}
      >
        <DiseaseForm
          onSubmit={onSubmit}
          patientId={patientId}
          disease={disease}
          mode={mode}
          onClose={onClose}
        />
      </DialogContent>
      <DialogActions sx={{ pt: 2, pr: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderRadius: 2, fontSize: { xs: "0.875rem", lg: "1rem" } }}
        >
          Отмена
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DiseaseModalForm;
