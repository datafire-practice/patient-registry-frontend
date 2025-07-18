import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store/store";
import {
  fetchPatients,
  deletePatient,
  createPatient,
  updatePatient,
  clearError,
} from "../../store/patientSlice";
import {
  Table,
  TableCell,
  TableBody,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Container,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import DeleteDialog from "../DeleteDialog/DeleteDialog";
import PatientModalForm from "../PatientModalForm/PatientModalForm";
import type { PatientFormData, Patient } from "../../types/patient";
import {
  StyledTableContainer,
  HeaderTableCell,
  FooterContainer,
  RecordsCounter,
  FabContainer,
  NameTableCell,
  BodyTableCell,
  ErrorContainer,
  EmptyStateContainer,
  StyledPaper,
  StyledFab,
} from "./patientTable.styles";

const PatientTable: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { patients, loading, error, hasMore } = useSelector(
    (state: RootState) => state.patients
  );
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
  const [openCreateDialog, setOpenCreateDialog] = useState<boolean>(false);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    null
  );
  const [selectedPatient, setSelectedPatient] =
    useState<PatientFormData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const [allowScrollLoad, setAllowScrollLoad] = useState(true);

  useEffect((): void => {
    dispatch(fetchPatients({ isInitialLoad: true, resetBeforeFetch: true }));
    setAllowScrollLoad(true);
  }, [dispatch]);

  const handleScroll = useCallback((): void => {
    if (!tableContainerRef.current || loading || !hasMore || !allowScrollLoad)
      return;

    const { scrollTop, scrollHeight, clientHeight } = tableContainerRef.current;
    if (scrollHeight - scrollTop <= clientHeight + 100) {
      dispatch(fetchPatients({ isInitialLoad: false }));
    }
  }, [dispatch, loading, hasMore, allowScrollLoad]);

  useEffect((): (() => void) => {
    const container = tableContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return (): void => container.removeEventListener("scroll", handleScroll);
    }
    return (): void => {};
  }, [handleScroll]);

  const handleDeleteClick = (id: number): void => {
    setSelectedPatientId(id);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!selectedPatientId) {
      setOpenDeleteDialog(false);
      return;
    }
    setOpenDeleteDialog(false);
    try {
      setAllowScrollLoad(false);
      await dispatch(deletePatient(selectedPatientId)).unwrap();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      // Ошибка будет обработана в Redux и записана в state.patients.error
    } finally {
      setAllowScrollLoad(true);
    }
  };

  const handleEditClick = (patient: Patient): void => {
    setSelectedPatient({
      lastName: patient.lastName,
      firstName: patient.firstName,
      middleName: patient.middleName || "",
      gender: patient.gender,
      birthDate: patient.birthDate,
      policyNumber: patient.policyNumber,
    });
    setSelectedPatientId(patient.id);
    setOpenEditDialog(true);
  };

  const handleCreateClick = (): void => {
    setSelectedPatient(null);
    setSelectedPatientId(null);
    setOpenCreateDialog(true);
  };

  const handleRefresh = async (): Promise<void> => {
    setIsRefreshing(true);
    setAllowScrollLoad(false);
    try {
      await dispatch(
        fetchPatients({ isInitialLoad: true, resetBeforeFetch: true })
      );
    } finally {
      setIsRefreshing(false);
      setAllowScrollLoad(true);
    }
  };

  const handleErrorRefresh = async (): Promise<void> => {
    setAllowScrollLoad(false);
    try {
      await dispatch(
        fetchPatients({
          isInitialLoad: patients.length === 0,
          resetBeforeFetch: false,
        })
      );
    } finally {
      setAllowScrollLoad(true);
    }
  };

  const handleSubmitForm = async (data: PatientFormData): Promise<void> => {
    setAllowScrollLoad(false);
    try {
      if (selectedPatientId) {
        await dispatch(
          updatePatient({ id: selectedPatientId, patientData: data })
        ).unwrap();
      } else {
        await dispatch(createPatient(data)).unwrap();
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      // Ошибка будет обработана в Redux и записана в state.patients.error
    } finally {
      setAllowScrollLoad(true);
    }
  };

  const handleCloseErrorSnackbar = (): void => {
    dispatch(clearError());
  };

  const snackbarError = error;

  if (error && patients.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <ErrorContainer>
          <Typography variant="h6" color="error">
            При получении реестра произошла ошибка.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleErrorRefresh}
          >
            Обновить
          </Button>
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3, position: "relative" }}>
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
        open={!!snackbarError}
        autoHideDuration={6000}
        onClose={handleCloseErrorSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseErrorSnackbar}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarError}
        </Alert>
      </Snackbar>

      <StyledPaper elevation={3}>
        <StyledTableContainer ref={tableContainerRef}>
          <Table stickyHeader size="medium">
            <TableHead>
              <TableRow>
                <HeaderTableCell>ФИО</HeaderTableCell>
                <HeaderTableCell>Номер полиса</HeaderTableCell>
                <HeaderTableCell>Пол</HeaderTableCell>
                <HeaderTableCell>Дата рождения</HeaderTableCell>
                <HeaderTableCell>Действия</HeaderTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {patients.length === 0 && !loading && !error ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <EmptyStateContainer>
                      <Typography variant="h6">
                        В реестре нет записей
                      </Typography>
                    </EmptyStateContainer>
                  </TableCell>
                </TableRow>
              ) : (
                patients.map((patient) => (
                  <TableRow key={patient.id} hover>
                    <NameTableCell>
                      {`${patient.lastName} ${patient.firstName} ${
                        patient.middleName || ""
                      }`}
                    </NameTableCell>
                    <BodyTableCell>{patient.policyNumber}</BodyTableCell>
                    <BodyTableCell>
                      {patient.gender === "М" ? "Мужской" : "Женский"}
                    </BodyTableCell>
                    <BodyTableCell>
                      {format(new Date(patient.birthDate), "dd MMMM yyyy", {
                        locale: ru,
                      })}
                    </BodyTableCell>
                    <BodyTableCell>
                      <IconButton onClick={() => handleEditClick(patient)}>
                        <EditIcon color="primary" />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteClick(patient.id)}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    </BodyTableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {loading && patients.length > 0 && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress />
            </Box>
          )}
        </StyledTableContainer>
        <FooterContainer>
          <RecordsCounter>Показано записей: {patients.length}</RecordsCounter>
        </FooterContainer>
      </StyledPaper>

      <FabContainer>
        <StyledFab
          color="primary"
          aria-label="refresh"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <RefreshIcon />
          )}
        </StyledFab>
        <StyledFab color="primary" aria-label="add" onClick={handleCreateClick}>
          <AddIcon />
        </StyledFab>
      </FabContainer>

      <DeleteDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
      />
      <PatientModalForm
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        onSubmit={handleSubmitForm}
        defaultValues={selectedPatient}
        title="Редактирование пациента"
      />
      <PatientModalForm
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        onSubmit={handleSubmitForm}
        title="Добавление нового пациента"
      />
    </Container>
  );
};

export default PatientTable;
