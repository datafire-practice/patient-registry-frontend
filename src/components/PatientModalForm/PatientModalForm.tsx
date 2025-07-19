import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import PatientForm from "../PatientForm/PatientForm";
import type { PatientFormData } from "../../types/patient";

interface PatientModalFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PatientFormData) => Promise<void>;
  defaultValues?: PatientFormData | null;
  title: string;
}

const PatientModalForm: React.FC<PatientModalFormProps> = ({
  open,
  onClose,
  onSubmit,
  defaultValues,
  title,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <PatientForm
          onSubmit={async (data) => {
            await onSubmit(data);
          }}
          defaultValues={defaultValues || undefined}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PatientModalForm;
