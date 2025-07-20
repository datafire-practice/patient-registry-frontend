import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../store/store";
import {
  fetchPatients,
  deletePatient,
  createPatient,
  updatePatient,
  clearError,
  resetPatientsState,
  setSelectedPatient,
} from "../store/patientSlice";
import {
  Table,
  TableCell,
  TableBody,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Container,
  Snackbar,
  Alert,
  CircularProgress,
  Box,
  Link,
  TableContainer,
  Paper,
  Fab,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { DeleteDialog, PatientModalForm, PatientDetailsModal } from ".";
import type { PatientFormData, Patient } from "../types";
import { PAGINATION } from "../utils/constants";

export const PatientTable: React.FC = () => {
  const dispatch: AppDispatch = useDispatch<AppDispatch>();
  const {
    patients,
    loading,
    error,
    totalElements,
    paginationError,
    selectedPatient,
  } = useSelector((state: RootState) => state.patients);

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
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const hasMore = patients.length < totalElements;

  const calculateNextPageToLoad = useCallback((): number => {
    if (patients.length === 0) {
      return 0;
    }
    return Math.ceil(patients.length / PAGINATION.ADDITIONAL_PAGE_SIZE);
  }, [patients.length]);

  useEffect((): void => {
    dispatch(
      fetchPatients({
        page: 0,
        reset: true,
        initialLoad: true,
        size: PAGINATION.INITIAL_PAGE_SIZE,
      })
    );
  }, [dispatch]);

  const handleScroll = useCallback((): void => {
    if (!tableContainerRef.current || loading || !hasMore || paginationError)
      return;

    const { scrollTop, scrollHeight, clientHeight } = tableContainerRef.current;
    if (scrollHeight - scrollTop <= clientHeight + 100) {
      const nextPage = calculateNextPageToLoad();
      dispatch(
        fetchPatients({
          page: nextPage,
          reset: false,
          initialLoad: false,
          size: PAGINATION.ADDITIONAL_PAGE_SIZE,
        })
      );
    }
  }, [dispatch, loading, hasMore, paginationError, calculateNextPageToLoad]);

  useEffect((): (() => void) => {
    const container = tableContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return (): void => {
        container.removeEventListener("scroll", handleScroll);
      };
    }
    return (): void => {};
  }, [handleScroll]);

  const handleDeleteClick = (id: number): void => {
    setSelectedPatientId(id);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (selectedPatientId) {
      try {
        await dispatch(deletePatient(selectedPatientId)).unwrap();
        setOpenDeleteDialog(false);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        setOpenDeleteDialog(false);
      }
    }
  };

  const handleEditClick = (patient: Patient): void => {
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
  };

  const handleCreateClick = (): void => {
    setPatientFormDataForEdit(null);
    setSelectedPatientId(null);
    setOpenCreateDialog(true);
  };

  const handleRefresh = async (): Promise<void> => {
    setIsRefreshing(true);
    if (tableContainerRef.current && !paginationError) {
      tableContainerRef.current.scrollTop = 0;
    }

    if (paginationError) {
      const nextPage = calculateNextPageToLoad();
      await dispatch(
        fetchPatients({
          page: nextPage,
          reset: false,
          initialLoad: false,
          size: PAGINATION.ADDITIONAL_PAGE_SIZE,
        })
      ).unwrap();
    } else {
      dispatch(resetPatientsState());
      await dispatch(
        fetchPatients({
          page: 0,
          reset: true,
          initialLoad: true,
          size: PAGINATION.INITIAL_PAGE_SIZE,
        })
      ).unwrap();
    }
    setIsRefreshing(false);
  };

  const handleSubmitForm = async (data: PatientFormData): Promise<void> => {
    try {
      if (selectedPatientId) {
        await dispatch(
          updatePatient({ id: selectedPatientId, patientData: data })
        ).unwrap();
      } else {
        await dispatch(createPatient(data)).unwrap();
      }
    } finally {
      setOpenEditDialog(false);
      setOpenCreateDialog(false);
    }
  };

  const handleCloseErrorSnackbar = (): void => {
    dispatch(clearError());
  };

  const handleRowClick = (patient: Patient): void => {
    dispatch(setSelectedPatient(patient));
    setOpenDetailsModal(true);
  };

  const handleCloseDetailsModal = (): void => {
    setOpenDetailsModal(false);
    dispatch(setSelectedPatient(null));
  };

  if (error && (patients.length === 0 || paginationError) && !loading) {
    return (
      <Container
        maxWidth={false}
        sx={{
          py: 3,
          width: { xs: "100%", lg: "1440px", xl: "1920px" },
          px: { xs: 2, lg: 3 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "200px",
            gap: "16px",
          }}
        >
          <Typography
            variant="h6"
            color="error"
            sx={{ fontSize: { xs: "1rem", lg: "1.25rem" } }}
          >
            {error.split("Обновить")[0]}
            <Link
              component="button"
              variant="h6"
              onClick={handleRefresh}
              sx={{
                color: "error.main",
                textDecoration: "underline",
                fontSize: { xs: "1rem", lg: "1.25rem" },
              }}
            >
              Обновить
            </Link>
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container
      maxWidth={false}
      sx={{
        py: 3,
        width: { xs: "100%", lg: "1440px", xl: "1920px" },
        px: { xs: 2, lg: 3 },
        position: "relative",
      }}
    >
      {loading && patients.length === 0 && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.1)",
            zIndex: 9999,
          }}
        >
          <CircularProgress size={60} />
        </Box>
      )}

      <Snackbar
        open={!!error && !paginationError && patients.length > 0}
        autoHideDuration={3000}
        onClose={handleCloseErrorSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseErrorSnackbar}
          severity="error"
          variant="filled"
          sx={{ width: "100%", fontSize: { xs: "0.875rem", lg: "1rem" } }}
        >
          {error}
        </Alert>
      </Snackbar>

      <Paper
        elevation={3}
        sx={{
          borderRadius: 4,
          width: "100%",
          maxWidth: { xs: "100%", lg: "1440px", xl: "1920px" },
          mx: "auto",
        }}
      >
        <TableContainer
          ref={tableContainerRef}
          sx={{
            overflow: "auto",
            borderRadius: "8px",
            maxHeight: { xs: "calc(100vh - 150px)", lg: "calc(100vh - 120px)" },
            scrollBehavior: "smooth",
            "&::-webkit-scrollbar": { width: "6px" },
            "&::-webkit-scrollbar-track": { background: "#f1f1f1" },
            "&::-webkit-scrollbar-thumb": {
              background: "#888",
              borderRadius: "6px",
            },
            "&::-webkit-scrollbar-thumb:hover": { background: "#555" },
          }}
        >
          <Table stickyHeader size="medium">
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
            <TableBody>
              {patients.length === 0 && !loading && !error ? (
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
              ) : (
                patients.map((patient: Patient) => (
                  <TableRow
                    key={patient.id}
                    hover
                    onClick={() => handleRowClick(patient)}
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
                      {`${patient.lastName} ${patient.firstName} ${
                        patient.middleName || ""
                      }`}
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
                      {format(new Date(patient.birthDate), "dd MMMM yyyy", {
                        locale: ru,
                      })}
                    </TableCell>
                    <TableCell
                      onClick={(e) => e.stopPropagation()}
                      sx={{
                        padding: { xs: "8px 12px", lg: "12px 16px" },
                      }}
                    >
                      <IconButton
                        onClick={(): void => handleEditClick(patient)}
                        aria-label={`Редактировать пациента ${patient.lastName}`}
                        size="small"
                      >
                        <EditIcon color="primary" fontSize="small" />
                      </IconButton>
                      <IconButton
                        onClick={(): void => handleDeleteClick(patient.id)}
                        aria-label={`Удалить пациента ${patient.lastName}`}
                        size="small"
                      >
                        <DeleteIcon color="error" fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {loading && patients.length > 0 && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress size={40} />
            </Box>
          )}
        </TableContainer>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: { xs: "16px", lg: "20px" },
            backgroundColor: "#f5f5f5",
            borderBottomLeftRadius: "4px",
            borderBottomRightRadius: "4px",
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: "0.9rem", lg: "1.1rem" },
              fontWeight: 500,
              color: "rgba(0, 0, 0, 0.6)",
            }}
          >
            Показано записей: {patients.length} из {totalElements}
          </Typography>
        </Box>
      </Paper>

      <Box
        sx={{
          position: "fixed",
          bottom: { xs: "16px", lg: "24px" },
          right: { xs: "16px", lg: "24px" },
          zIndex: 1000,
          display: "flex",
          gap: { xs: "12px", lg: "16px" },
        }}
      >
        <Fab
          color="primary"
          aria-label="Обновить список пациентов"
          onClick={handleRefresh}
          disabled={isRefreshing || loading}
          size="medium"
          sx={{
            boxShadow:
              "0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)",
          }}
        >
          {isRefreshing ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <RefreshIcon fontSize="medium" />
          )}
        </Fab>
        <Fab
          color="primary"
          aria-label="Добавить нового пациента"
          onClick={handleCreateClick}
          size="medium"
          sx={{
            boxShadow:
              "0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)",
          }}
        >
          <AddIcon fontSize="medium" />
        </Fab>
      </Box>

      <DeleteDialog
        open={openDeleteDialog}
        onClose={(): void => setOpenDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
      />
      <PatientModalForm
        open={openEditDialog}
        onClose={(): void => setOpenEditDialog(false)}
        onSubmit={handleSubmitForm}
        defaultValues={patientFormDataForEdit}
        title="Редактирование пациента"
      />
      <PatientModalForm
        open={openCreateDialog}
        onClose={(): void => setOpenCreateDialog(false)}
        onSubmit={handleSubmitForm}
        title="Добавление нового пациента"
      />
      <PatientDetailsModal
        open={openDetailsModal}
        onClose={handleCloseDetailsModal}
        patient={selectedPatient}
      />
    </Container>
  );
};
