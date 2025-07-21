import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Link,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import type { Disease, Patient } from "../../types";
import { DeleteDialog, DiseaseModalForm } from "../../components";
import { ERROR_MESSAGES } from "../../utils/constants";
import { usePatientDiseasesData, usePatientDiseaseDialogs } from "../../hooks";

interface PatientDetailsModalProps {
  open: boolean;
  onClose: () => void;
  patient: Patient | null;
}

export const PatientDetailsModal: React.FC<PatientDetailsModalProps> = ({
  open,
  onClose,
  patient,
}) => {
  const {
    patientDiseases,
    diseasesLoading,
    diseasesError,
    diseasesCurrentPage,
    diseasesTotalPages,
    handleLoadMoreDiseases,
    handleRefreshDiseases,
    handleDeleteDisease,
  } = usePatientDiseasesData(patient?.id, open);

  const {
    openDeleteDialog,
    setOpenDeleteDialog,
    openEditDialog,
    setOpenEditDialog,
    openAddDialog,
    setOpenAddDialog,
    selectedDiseaseId,
    selectedDisease,
    handleDeleteClick,
    handleEditClick,
    handleAddClick,
    handleDiseaseFormSubmitCallback,
  } = usePatientDiseaseDialogs(handleRefreshDiseases);

  const handleDeleteConfirmAndCloseDialog = async (): Promise<void> => {
    if (selectedDiseaseId) {
      await handleDeleteDisease(selectedDiseaseId);
      setOpenDeleteDialog(false);
    }
  };

  if (!patient) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxWidth: { xs: "100%", lg: "900px", xl: "1200px" },
          mx: "auto",
        },
      }}
    >
      <DialogTitle sx={{ pb: 2, fontSize: { xs: "1.1rem", lg: "1.25rem" } }}>
        Детальная информация о пациенте
      </DialogTitle>
      <DialogContent
        dividers
        sx={{ borderColor: "divider", p: { xs: 2, lg: 3 } }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontSize: { xs: "1rem", lg: "1.1rem" } }}
          >
            ФИО:{" "}
            <Typography
              component="span"
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.9rem", lg: "1rem" } }}
            >
              {`${patient.lastName} ${patient.firstName} ${
                patient.middleName || ""
              }`}
            </Typography>
          </Typography>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontSize: { xs: "1rem", lg: "1.1rem" } }}
          >
            Пол:{" "}
            <Typography
              component="span"
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.9rem", lg: "1rem" } }}
            >
              {patient.gender === "М" ? "Мужской" : "Женский"}
            </Typography>
          </Typography>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontSize: { xs: "1rem", lg: "1.1rem" } }}
          >
            Дата рождения:{" "}
            <Typography
              component="span"
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.9rem", lg: "1rem" } }}
            >
              {format(new Date(patient.birthDate), "dd MMMM yyyy", {
                locale: ru,
              })}
            </Typography>
          </Typography>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontSize: { xs: "1rem", lg: "1.1rem" } }}
          >
            Номер полиса ОМС:{" "}
            <Typography
              component="span"
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.9rem", lg: "1rem" } }}
            >
              {patient.insuranceNumber}
            </Typography>
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              fontSize: { xs: "1.1rem", lg: "1.25rem" },
            }}
          >
            Заболевания:
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
            sx={{ borderRadius: 2, fontSize: { xs: "0.875rem", lg: "1rem" } }}
          >
            Добавить заболевание
          </Button>
        </Box>

        {diseasesLoading && patientDiseases.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <CircularProgress size={40} />
          </Box>
        ) : diseasesError ? (
          <Box sx={{ textAlign: "center", py: 2 }}>
            <Typography
              color="error"
              sx={{ fontSize: { xs: "0.875rem", lg: "1rem" } }}
            >
              {diseasesError.split("Обновить")[0]}
              <Link
                component="button"
                onClick={handleRefreshDiseases}
                sx={{
                  ml: 1,
                  textDecoration: "underline",
                  fontSize: { xs: "0.875rem", lg: "1rem" },
                }}
              >
                Обновить
              </Link>
            </Typography>
          </Box>
        ) : patientDiseases.length === 0 ? (
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ py: 2, fontSize: { xs: "0.875rem", lg: "1rem" } }}
          >
            {ERROR_MESSAGES.NO_DISEASES}
          </Typography>
        ) : (
          <>
            {patientDiseases.map((disease: Disease) => (
              <Accordion key={disease.id} sx={{ mb: 1, borderRadius: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                      alignItems: "center",
                      pr: 1,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{ fontSize: { xs: "0.9rem", lg: "1rem" } }}
                    >
                      {disease.mkb10.name} ({disease.mkb10.code})
                    </Typography>
                    <Box onClick={(e) => e.stopPropagation()}>
                      <IconButton
                        onClick={() => handleEditClick(disease)}
                        aria-label="Редактировать заболевание"
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteClick(disease.id)}
                        aria-label="Удалить заболевание"
                        size="small"
                      >
                        <DeleteIcon fontSize="small" color="error" />
                      </IconButton>
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ borderTop: "1px dashed #e0e0e0" }}>
                  <Typography
                    variant="body2"
                    sx={{ mb: 0.5, fontSize: { xs: "0.85rem", lg: "0.95rem" } }}
                  >
                    <strong>Дата начала болезни:</strong>{" "}
                    {format(new Date(disease.startDate), "dd MMMM yyyy", {
                      locale: ru,
                    })}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ mb: 0.5, fontSize: { xs: "0.85rem", lg: "0.95rem" } }}
                  >
                    <strong>Дата окончания болезни:</strong>{" "}
                    {disease.endDate
                      ? format(new Date(disease.endDate), "dd MMMM yyyy", {
                          locale: ru,
                        })
                      : "Не указана"}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ mb: 0.5, fontSize: { xs: "0.85rem", lg: "0.95rem" } }}
                  >
                    <strong>Назначения:</strong>{" "}
                    {disease.prescriptions || "Нет назначений"}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontSize: { xs: "0.85rem", lg: "0.95rem" } }}
                  >
                    <strong>Выдан лист нетрудоспособности:</strong>{" "}
                    {disease.sickLeaveIssued ? "Да" : "Нет"}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
            {diseasesCurrentPage < diseasesTotalPages - 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleLoadMoreDiseases}
                  disabled={diseasesLoading}
                  sx={{
                    borderRadius: 2,
                    fontSize: { xs: "0.875rem", lg: "1rem" },
                  }}
                >
                  {diseasesLoading ? (
                    <CircularProgress size={24} />
                  ) : (
                    "Показать еще"
                  )}
                </Button>
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ pt: 2, pr: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderRadius: 2, fontSize: { xs: "0.875rem", lg: "1rem" } }}
        >
          Закрыть
        </Button>
      </DialogActions>
      <DeleteDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={handleDeleteConfirmAndCloseDialog}
      />
      {selectedDisease && patient?.id && (
        <DiseaseModalForm
          open={openEditDialog}
          onClose={() => setOpenEditDialog(false)}
          onSubmit={handleDiseaseFormSubmitCallback}
          patientId={patient.id}
          disease={selectedDisease}
          mode="edit"
        />
      )}
      {patient?.id && (
        <DiseaseModalForm
          open={openAddDialog}
          onClose={() => setOpenAddDialog(false)}
          onSubmit={handleDiseaseFormSubmitCallback}
          patientId={patient.id}
          mode="add"
        />
      )}
    </Dialog>
  );
};
