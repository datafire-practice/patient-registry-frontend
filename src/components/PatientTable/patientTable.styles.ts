// components/PatientTable/patientTable.styles.ts
import { styled } from "@mui/material/styles";
import {
  TableContainer,
  TableCell,
  Box,
  Typography,
  Paper,
  Fab,
} from "@mui/material";

export const StyledTableContainer = styled(TableContainer)(() => ({
  overflow: "auto",
  borderRadius: "8px",
  maxHeight: "calc(100vh - 120px)",
  scrollBehavior: "smooth",
  "&::-webkit-scrollbar": { width: "6px" },
  "&::-webkit-scrollbar-track": { background: "#f1f1f1" },
  "&::-webkit-scrollbar-thumb": { background: "#888", borderRadius: "6px" },
  "&::-webkit-scrollbar-thumb:hover": { background: "#555" },
}));

export const HeaderTableCell = styled(TableCell)(({ theme }) => ({
  background: "#f5f5f5",
  fontWeight: "bold",
  fontSize: "0.95rem",
  padding: theme.spacing(1.8, 2),
  borderBottom: "2px solid #ddd",
}));

export const FooterContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: theme.spacing(2.5),
  backgroundColor: theme.palette.grey[100],
  borderBottomLeftRadius: theme.shape.borderRadius,
  borderBottomRightRadius: theme.shape.borderRadius,
}));

export const RecordsCounter = styled(Typography)(({ theme }) => ({
  fontSize: "1.1rem",
  fontWeight: 500,
  color: theme.palette.text.secondary,
}));

export const FabContainer = styled("div")(() => ({
  position: "fixed",
  bottom: "24px",
  right: "24px",
  zIndex: 1000,
  display: "flex",
  gap: "16px",
}));

export const NameTableCell = styled(TableCell)(({ theme }) => ({
  maxWidth: "300px",
  wordBreak: "break-word",
  whiteSpace: "normal",
  overflowWrap: "break-word",
  padding: theme.spacing(1.5, 2),
}));

export const BodyTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
}));

export const ErrorContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "200px",
  gap: theme.spacing(2),
}));

export const EmptyStateContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100px",
  padding: theme.spacing(4),
}));

export const StyledPaper = styled(Paper)(() => ({
  borderRadius: 4,
}));

export const StyledFab = styled(Fab)(({ theme }) => ({
  boxShadow: theme.shadows[6],
}));
