import React from "react";
import {
  TableBody,
  Box,
  Typography,
  CircularProgress,
  TableRow,
  TableCell,
} from "@mui/material";
import type { Patient } from "../../../types";
import { PatientTableRow } from "./PatientTableRow";

interface PatientTableBodyContentProps {
  patients: Patient[];
  loading: boolean;
  error: string | null;
  onRowClick: (patient: Patient) => void;
  onEditClick: (patient: Patient) => void;
  onDeleteClick: (id: number) => void;
}

export const PatientTableBodyContent: React.FC<
  PatientTableBodyContentProps
> = ({ patients, loading, error, onRowClick, onEditClick, onDeleteClick }) => {
  if (patients.length === 0 && !loading && !error) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={5}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100px",
                padding: { xs: "24px", lg: "32px" },
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontSize: { xs: "1rem", lg: "1.25rem" } }}
              >
                В реестре нет записей
              </Typography>
            </Box>
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {patients.map((patient: Patient) => (
        <PatientTableRow
          key={patient.id}
          patient={patient}
          onRowClick={onRowClick}
          onEditClick={onEditClick}
          onDeleteClick={onDeleteClick}
        />
      ))}
      {loading && patients.length > 0 && (
        <TableRow>
          <TableCell colSpan={5}>
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress size={40} />
            </Box>
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );
};
