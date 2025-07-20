import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: "8px",
          maxWidth: { xs: "100%", lg: "500px" },
          mx: "auto",
        },
      }}
    >
      <DialogTitle sx={{ fontSize: { xs: "1.1rem", lg: "1.25rem" } }}>
        Подтверждение удаления
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ fontSize: { xs: "0.875rem", lg: "1rem" } }}>
          Вы уверены, что хотите удалить этого пациента? Это действие нельзя
          отменить.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          color="primary"
          sx={{ fontSize: { xs: "0.875rem", lg: "1rem" } }}
        >
          Отмена
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          autoFocus
          sx={{ fontSize: { xs: "0.875rem", lg: "1rem" } }}
        >
          Удалить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDialog;
