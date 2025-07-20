import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  TextField,
  Button,
  Box,
  FormControlLabel,
  Checkbox,
  Autocomplete,
  CircularProgress,
  Alert,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { format, parseISO, isFuture, isBefore, isValid } from "date-fns";
import type { Disease, Mkb10DictionaryItem } from "../../types";
import { useMkb10Search, useDiseaseFormSubmit } from "../../hooks/disease";

interface DiseaseFormProps {
  onSubmit: () => void;
  patientId: number;
  disease?: Disease;
  mode: "add" | "edit";
  onClose: () => void;
}

interface FormData {
  mkb10: Mkb10DictionaryItem;
  startDate: string;
  endDate: string | null;
  prescriptions: string;
  sickLeaveIssued: boolean;
}

export const DiseaseForm: React.FC<DiseaseFormProps> = ({
  onSubmit,
  patientId,
  disease,
  mode,
  onClose,
}) => {
  const {
    mkb10Options,
    loadingMkb10,
    mkb10Error,
    listboxRef,
    handleScroll,
    handleSearchChange,
    handleAutocompleteOpen,
    resetMkb10Search,
  } = useMkb10Search();

  const {
    submissionError,
    isSubmitting,
    handleFormSubmit: handleActualFormSubmit,
    clearSubmissionError,
  } = useDiseaseFormSubmit(onSubmit, onClose);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isDirty, isValid: formIsValid },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      mkb10: disease?.mkb10 || { code: "", name: "" },
      startDate: disease?.startDate || format(new Date(), "yyyy-MM-dd"),
      endDate: disease?.endDate ?? null,
      prescriptions: disease?.prescriptions || "",
      sickLeaveIssued: disease?.sickLeaveIssued || false,
    },
    mode: "onBlur",
  });

  useEffect((): void => {
    if (disease) {
      reset({
        mkb10: disease.mkb10,
        startDate: disease.startDate,
        endDate: disease.endDate ?? null,
        prescriptions: disease.prescriptions,
        sickLeaveIssued: disease.sickLeaveIssued,
      });
      resetMkb10Search();
    } else {
      reset({
        mkb10: { code: "", name: "" },
        startDate: format(new Date(), "yyyy-MM-dd"),
        endDate: null,
        prescriptions: "",
        sickLeaveIssued: false,
      });
      resetMkb10Search();
    }
    clearSubmissionError();
  }, [disease, reset, resetMkb10Search, clearSubmissionError]);

  const values = watch();

  return (
    <Box
      component="form"
      onSubmit={handleSubmit((data) =>
        handleActualFormSubmit(
          { ...data, patient: { id: patientId } },
          patientId,
          mode,
          disease?.id
        )
      )}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        p: { xs: 1, lg: 2 },
        width: "100%",
        "& .MuiOutlinedInput-root": {
          borderRadius: 2,
          fontSize: { xs: "0.875rem", lg: "1rem" },
        },
        "& .MuiButton-root": {
          borderRadius: 2,
          fontSize: { xs: "0.875rem", lg: "1rem" },
        },
        "& .MuiAlert-root": {
          borderRadius: 2,
          fontSize: { xs: "0.875rem", lg: "1rem" },
        },
      }}
    >
      {(mkb10Error || submissionError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {mkb10Error || submissionError}
        </Alert>
      )}

      <Controller
        name="mkb10"
        control={control}
        rules={{ required: "Заболевание обязательно" }}
        render={({ field }) => (
          <Autocomplete
            {...field}
            options={mkb10Options}
            getOptionLabel={(option) => `${option.code} - ${option.name}`}
            isOptionEqualToValue={(option, value) => option.code === value.code}
            loading={loadingMkb10}
            onInputChange={handleSearchChange}
            onOpen={handleAutocompleteOpen}
            onChange={(_, newValue) => {
              field.onChange(newValue);
            }}
            value={field.value || null}
            ListboxProps={{
              onScroll: handleScroll,
              ref: listboxRef,
              style: { maxHeight: 200, overflow: "auto" },
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Заболевание*"
                fullWidth
                required
                error={!!errors.mkb10}
                helperText={errors.mkb10?.message}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingMkb10 ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                sx={{ fontSize: { xs: "0.875rem", lg: "1rem" } }}
              />
            )}
          />
        )}
      />

      <Controller
        name="startDate"
        control={control}
        rules={{
          required: "Дата начала болезни обязательна",
          validate: (value) => {
            const startDate = value ? parseISO(value) : null;
            if (!startDate || !isValid(startDate)) {
              return "Некорректная дата начала болезни";
            }
            if (isFuture(startDate)) {
              return "Дата начала болезни не может быть в будущем";
            }
            const endDate = values.endDate ? parseISO(values.endDate) : null;
            if (endDate && isValid(endDate) && isBefore(endDate, startDate)) {
              return "Дата начала болезни не может быть позже даты окончания";
            }
            return true;
          },
        }}
        render={({ field }) => (
          <DatePicker
            label="Дата начала болезни*"
            value={field.value ? parseISO(field.value) : null}
            onChange={(date) => {
              field.onChange(date ? format(date, "yyyy-MM-dd") : "");
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                required: true,
                error: !!errors.startDate,
                helperText: errors.startDate?.message,
                sx: { fontSize: { xs: "0.875rem", lg: "1rem" } },
              },
            }}
          />
        )}
      />

      <Controller
        name="endDate"
        control={control}
        rules={{
          validate: (value) => {
            const endDate = value ? parseISO(value) : null;
            if (endDate && !isValid(endDate)) {
              return "Некорректная дата окончания болезни";
            }
            if (endDate && isFuture(endDate)) {
              return "Дата окончания болезни не может быть в будущем";
            }
            const startDate = values.startDate
              ? parseISO(values.startDate)
              : null;
            if (
              startDate &&
              isValid(startDate) &&
              endDate &&
              isBefore(endDate, startDate)
            ) {
              return "Дата окончания болезни не может быть раньше даты начала";
            }
            return true;
          },
        }}
        render={({ field }) => (
          <DatePicker
            label="Дата окончания болезни"
            value={field.value ? parseISO(field.value) : null}
            onChange={(date) => {
              field.onChange(date ? format(date, "yyyy-MM-dd") : null);
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                error: !!errors.endDate,
                helperText: errors.endDate?.message,
                sx: { fontSize: { xs: "0.875rem", lg: "1rem" } },
              },
            }}
          />
        )}
      />

      <TextField
        label="Назначения*"
        fullWidth
        multiline
        rows={3}
        {...register("prescriptions", {
          required: "Назначения обязательны",
          maxLength: {
            value: 1024,
            message: "Максимум 1024 символа",
          },
        })}
        error={!!errors.prescriptions}
        helperText={errors.prescriptions?.message}
        sx={{ fontSize: { xs: "0.875rem", lg: "1rem" } }}
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={values.sickLeaveIssued}
            {...register("sickLeaveIssued")}
            onChange={(e) =>
              setValue("sickLeaveIssued", e.target.checked, {
                shouldDirty: true,
              })
            }
            sx={{
              "& .MuiSvgIcon-root": {
                borderRadius: 1,
                fontSize: { xs: "1rem", lg: "1.25rem" },
              },
            }}
          />
        }
        label="Выдан лист нетрудоспособности"
        sx={{ fontSize: { xs: "0.875rem", lg: "1rem" } }}
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 2, fontSize: { xs: "0.875rem", lg: "1rem" } }}
        disabled={isSubmitting || !isDirty || !formIsValid}
      >
        {isSubmitting ? <CircularProgress size={24} /> : "Сохранить"}
      </Button>
    </Box>
  );
};
