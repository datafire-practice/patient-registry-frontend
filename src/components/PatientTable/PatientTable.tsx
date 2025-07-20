import React from "react";
import {
  Table,
  TableContainer,
  Paper,
  Container,
  Snackbar,
  Alert,
  Typography,
  Box,
  Fab,
  CircularProgress,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";

import {
  usePatientData,
  usePatientActions,
  usePatientDialog,
} from "../../hooks/patient";
import type { Patient, PatientFormData } from "../../types";
import {
  DeleteDialog,
  PatientModalForm,
  PatientDetailsModal,
} from "../../components";
import {
  PatientTableHead,
  PatientTableBodyContent,
  PatientTableErrorState,
  GlobalLoadingIndicator,
} from "../PatientTable";

export const PatientTable: React.FC = () => {
  const {
    patients,
    loading,
    error,
    totalElements,
    paginationError,
    selectedPatient,
    tableContainerRef,
    handleRefresh: handleDataRefresh,
    handleCloseErrorSnackbar,
    handleRowClick: handlePatientRowClick,
  } = usePatientData();

  const { handleDeleteConfirm, handleSubmitForm } = usePatientActions();

  const {
    openDeleteDialog,
    setOpenDeleteDialog,
    openEditDialog,
    setOpenEditDialog,
    openCreateDialog,
    setOpenCreateDialog,
    openDetailsModal,
    setOpenDetailsModal,
    selectedPatientId,
    patientFormDataForEdit,
    isRefreshing,
    setIsRefreshing,
    handleDeleteClick: handleDialogDeleteClick,
    handleEditClick: handleDialogEditClick,
    handleCreateClick: handleDialogCreateClick,
    handleCloseDetailsModal: handleDialogCloseDetailsModal,
  } = usePatientDialog();

  const handleRefreshClick = async (): Promise<void> => {
    setIsRefreshing(true);
    await handleDataRefresh();
    setIsRefreshing(false);
  };

  const handleDeleteConfirmAndCloseDialog = async (): Promise<void> => {
    if (selectedPatientId) {
      try {
        await handleDeleteConfirm(selectedPatientId);
        setOpenDeleteDialog(false);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        setOpenDeleteDialog(false);
      }
    }
  };

  const handleSubmitFormAndCloseDialog = async (
    data: PatientFormData
  ): Promise<void> => {
    try {
      await handleSubmitForm(data, selectedPatientId);
    } finally {
      setOpenEditDialog(false);
      setOpenCreateDialog(false);
    }
  };

  const handleCombinedRowClick = (patient: Patient): void => {
    handlePatientRowClick(patient);
    setOpenDetailsModal(true);
  };

  const handleCombinedCloseDetailsModal = (): void => {
    handleDialogCloseDetailsModal();
  };

  if (error && (patients.length === 0 || paginationError) && !loading) {
    return (
      <PatientTableErrorState error={error} onRefresh={handleRefreshClick} />
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
      <GlobalLoadingIndicator loading={loading && patients.length === 0} />

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
            <PatientTableHead />
            <PatientTableBodyContent
              patients={patients}
              loading={loading}
              error={error}
              onRowClick={handleCombinedRowClick}
              onEditClick={handleDialogEditClick}
              onDeleteClick={handleDialogDeleteClick}
            />
          </Table>
        </TableContainer>
        <Typography
          sx={{
            fontSize: { xs: "0.9rem", lg: "1.1rem" },
            fontWeight: 500,
            color: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: { xs: "16px", lg: "20px" },
            backgroundColor: "#f5f5f5",
            borderBottomLeftRadius: "4px",
            borderBottomRightRadius: "4px",
          }}
        >
          Показано записей: {patients.length} из {totalElements}
        </Typography>
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
          onClick={handleRefreshClick}
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
          onClick={handleDialogCreateClick}
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
        onConfirm={handleDeleteConfirmAndCloseDialog}
      />
      <PatientModalForm
        open={openEditDialog}
        onClose={(): void => setOpenEditDialog(false)}
        onSubmit={handleSubmitFormAndCloseDialog}
        defaultValues={patientFormDataForEdit}
        title="Редактирование пациента"
      />
      <PatientModalForm
        open={openCreateDialog}
        onClose={(): void => setOpenCreateDialog(false)}
        onSubmit={handleSubmitFormAndCloseDialog}
        title="Добавление нового пациента"
      />
      <PatientDetailsModal
        open={openDetailsModal}
        onClose={handleCombinedCloseDetailsModal}
        patient={selectedPatient}
      />
    </Container>
  );
};
