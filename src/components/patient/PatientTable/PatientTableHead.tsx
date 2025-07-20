import React from "react";
import { TableHead, TableRow, TableCell } from "@mui/material";

export const PatientTableHead: React.FC = () => {
  return (
    <TableHead>
      <TableRow>
        <TableCell
          sx={{
            background: "#f5f5f5",
            fontWeight: "bold",
            fontSize: { xs: "0.85rem", lg: "0.95rem" },
            padding: { xs: "10px 12px", lg: "14.4px 16px" },
            borderBottom: "2px solid #ddd",
          }}
        >
          ФИО
        </TableCell>
        <TableCell
          sx={{
            background: "#f5f5f5",
            fontWeight: "bold",
            fontSize: { xs: "0.85rem", lg: "0.95rem" },
            padding: { xs: "10px 12px", lg: "14.4px 16px" },
            borderBottom: "2px solid #ddd",
          }}
        >
          Номер полиса
        </TableCell>
        <TableCell
          sx={{
            background: "#f5f5f5",
            fontWeight: "bold",
            fontSize: { xs: "0.85rem", lg: "0.95rem" },
            padding: { xs: "10px 12px", lg: "14.4px 16px" },
            borderBottom: "2px solid #ddd",
          }}
        >
          Пол
        </TableCell>
        <TableCell
          sx={{
            background: "#f5f5f5",
            fontWeight: "bold",
            fontSize: { xs: "0.85rem", lg: "0.95rem" },
            padding: { xs: "10px 12px", lg: "14.4px 16px" },
            borderBottom: "2px solid #ddd",
          }}
        >
          Дата рождения
        </TableCell>
        <TableCell
          sx={{
            background: "#f5f5f5",
            fontWeight: "bold",
            fontSize: { xs: "0.85rem", lg: "0.95rem" },
            padding: { xs: "10px 12px", lg: "14.4px 16px" },
            borderBottom: "2px solid #ddd",
          }}
        >
          Действия
        </TableCell>
      </TableRow>
    </TableHead>
  );
};
