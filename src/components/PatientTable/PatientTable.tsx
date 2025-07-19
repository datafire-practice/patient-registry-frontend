import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store/store";
import {
  fetchPatients,
  deletePatient,
  createPatient,
  updatePatient,
  clearError,
  resetPatientsState,
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
  Snackbar,
  Alert,
  CircularProgress,
  Box,
  Link,
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

import { PAGINATION } from "../../utils/constants";

const PatientTable: React.FC = () => {
  const dispatch: AppDispatch = useDispatch<AppDispatch>();
  const { patients, loading, error, totalElements, paginationError } =
    useSelector((state: RootState) => state.patients);

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
    setSelectedPatient({
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
    setSelectedPatient(null);
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

  if (error && (patients.length === 0 || paginationError) && !loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <ErrorContainer>
          <Typography variant="h6" color="error">
            {error.split("Обновить")[0]}
            <Link
              component="button"
              variant="h6"
              onClick={handleRefresh}
              sx={{ color: "error.main", textDecoration: "underline" }}
            >
              Обновить
            </Link>
          </Typography>
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
        open={!!error && !paginationError && patients.length > 0}
        autoHideDuration={3000}
        onClose={handleCloseErrorSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseErrorSnackbar}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {error}
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
                patients.map((patient: Patient) => (
                  <TableRow key={patient.id} hover>
                    <NameTableCell>
                      {`${patient.lastName} ${patient.firstName} ${
                        patient.middleName || ""
                      }`}
                    </NameTableCell>
                    <BodyTableCell>{patient.insuranceNumber}</BodyTableCell>
                    <BodyTableCell>
                      {patient.gender === "М" ? "Мужской" : "Женский"}
                    </BodyTableCell>
                    <BodyTableCell>
                      {format(new Date(patient.birthDate), "dd MMMM yyyy", {
                        locale: ru,
                      })}
                    </BodyTableCell>
                    <BodyTableCell>
                      <IconButton
                        onClick={(): void => handleEditClick(patient)}
                        aria-label={`Редактировать пациента ${patient.lastName}`}
                      >
                        <EditIcon color="primary" />
                      </IconButton>
                      <IconButton
                        onClick={(): void => handleDeleteClick(patient.id)}
                        aria-label={`Удалить пациента ${patient.lastName}`}
                      >
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
          <RecordsCounter>
            Показано записей: {patients.length} из {totalElements}
          </RecordsCounter>
        </FooterContainer>
      </StyledPaper>

      <FabContainer>
        <StyledFab
          color="primary"
          aria-label="Обновить список пациентов"
          onClick={handleRefresh}
          disabled={isRefreshing || loading}
        >
          {isRefreshing ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <RefreshIcon />
          )}
        </StyledFab>
        <StyledFab
          color="primary"
          aria-label="Добавить нового пациента"
          onClick={handleCreateClick}
        >
          <AddIcon />
        </StyledFab>
      </FabContainer>

      <DeleteDialog
        open={openDeleteDialog}
        onClose={(): void => setOpenDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
      />
      <PatientModalForm
        open={openEditDialog}
        onClose={(): void => setOpenEditDialog(false)}
        onSubmit={handleSubmitForm}
        defaultValues={selectedPatient}
        title="Редактирование пациента"
      />
      <PatientModalForm
        open={openCreateDialog}
        onClose={(): void => setOpenCreateDialog(false)}
        onSubmit={handleSubmitForm}
        title="Добавление нового пациента"
      />
    </Container>
  );
};

export default PatientTable;
