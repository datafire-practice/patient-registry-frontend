import React from "react";
import { TableRow, TableCell, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import type { Patient } from "../../types";

interface PatientTableRowProps {
  patient: Patient;
  onRowClick: (patient: Patient) => void;
  onEditClick: (patient: Patient) => void;
  onDeleteClick: (id: number) => void;
}

export const PatientTableRow: React.FC<PatientTableRowProps> = ({
  patient,
  onRowClick,
  onEditClick,
  onDeleteClick,
}) => {
  return (
    <TableRow
      hover
      onClick={() => onRowClick(patient)}
      sx={{ cursor: "pointer" }}
    >
      <TableCell
        sx={{
          maxWidth: { xs: "200px", lg: "300px" },
          wordBreak: "break-word",
          whiteSpace: "normal",
          overflowWrap: "break-word",
          padding: { xs: "8px 12px", lg: "12px 16px" },
          fontSize: { xs: "0.85rem", lg: "0.95rem" },
        }}
      >
        {`${patient.lastName} ${patient.firstName} ${patient.middleName || ""}`}
      </TableCell>
      <TableCell
        sx={{
          padding: { xs: "8px 12px", lg: "12px 16px" },
          fontSize: { xs: "0.85rem", lg: "0.95rem" },
        }}
      >
        {patient.insuranceNumber}
      </TableCell>
      <TableCell
        sx={{
          padding: { xs: "8px 12px", lg: "12px 16px" },
          fontSize: { xs: "0.85rem", lg: "0.95rem" },
        }}
      >
        {patient.gender === "М" ? "Мужской" : "Женский"}
      </TableCell>
      <TableCell
        sx={{
          padding: { xs: "8px 12px", lg: "12px 16px" },
          fontSize: { xs: "0.85rem", lg: "0.95rem" },
        }}
      >
        {format(new Date(patient.birthDate), "dd MMMM yyyy", { locale: ru })}
      </TableCell>
      <TableCell
        onClick={(e) => e.stopPropagation()}
        sx={{
          padding: { xs: "8px 12px", lg: "12px 16px" },
        }}
      >
        <IconButton
          onClick={(): void => onEditClick(patient)}
          aria-label={`Редактировать пациента ${patient.lastName}`}
          size="small"
        >
          <EditIcon color="primary" fontSize="small" />
        </IconButton>
        <IconButton
          onClick={(): void => onDeleteClick(patient.id)}
          aria-label={`Удалить пациента ${patient.lastName}`}
          size="small"
        >
          <DeleteIcon color="error" fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};
