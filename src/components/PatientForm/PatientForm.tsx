import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { PatientFormData } from "../../types/patient";
import {
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { format, parseISO } from "date-fns";

interface PatientFormProps {
  onSubmit: (data: PatientFormData) => void;
  defaultValues?: PatientFormData;
}

const PatientForm: React.FC<PatientFormProps> = ({
  onSubmit,
  defaultValues,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<PatientFormData>({
    defaultValues: defaultValues || {
      lastName: "",
      firstName: "",
      middleName: "",
      gender: "М",
      birthDate: format(new Date(), "yyyy-MM-dd"),
      policyNumber: "",
    },
  });

  const [initialValues, setInitialValues] = useState<PatientFormData | null>(
    null
  );
  const [hasChanges, setHasChanges] = useState(false);

  useEffect((): void => {
    if (defaultValues) {
      setInitialValues(defaultValues);
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  useEffect((): (() => void) => {
    const subscription = watch((values): void => {
      if (initialValues) {
        const changed = Object.keys(values).some(
          (key) =>
            values[key as keyof PatientFormData] !==
            initialValues[key as keyof PatientFormData]
        );
        setHasChanges(changed);
      } else {
        setHasChanges(true);
      }
    });
    return (): void => subscription.unsubscribe();
  }, [watch, initialValues]);

  const handleDateChange = (date: Date | null): void => {
    if (date) {
      setValue("birthDate", format(date, "yyyy-MM-dd"), { shouldDirty: true });
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        p: 1,
        width: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          "& > *": {
            flex: "1 1 30%",
            minWidth: "200px",
          },
        }}
      >
        <TextField
          label="Фамилия*"
          fullWidth
          {...register("lastName", {
            required: "Обязательное поле",
            pattern: {
              value: /^[А-Яа-яёЁ\s-]+$/,
              message: "Только кириллица, дефис и пробел",
            },
          })}
          error={!!errors.lastName}
          helperText={errors.lastName?.message}
        />
        <TextField
          label="Имя*"
          fullWidth
          {...register("firstName", {
            required: "Обязательное поле",
            pattern: {
              value: /^[А-Яа-яёЁ\s-]+$/,
              message: "Только кириллица, дефис и пробел",
            },
          })}
          error={!!errors.firstName}
          helperText={errors.firstName?.message}
        />
        <TextField
          label="Отчество"
          fullWidth
          {...register("middleName", {
            pattern: {
              value: /^[А-Яа-яёЁ\s-]*$/,
              message: "Только кириллица, дефис и пробел",
            },
          })}
          error={!!errors.middleName}
          helperText={errors.middleName?.message}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          "& > *": {
            flex: "1 1 45%",
            minWidth: "200px",
          },
        }}
      >
        <FormControl fullWidth error={!!errors.gender}>
          <InputLabel>Пол*</InputLabel>
          <Select
            label="Пол*"
            {...register("gender", { required: "Обязательное поле" })}
            defaultValue="М"
          >
            <MenuItem value="М">Мужской</MenuItem>
            <MenuItem value="Ж">Женский</MenuItem>
          </Select>
          {errors.gender && (
            <FormHelperText>{errors.gender.message}</FormHelperText>
          )}
        </FormControl>

        <DatePicker
          label="Дата рождения*"
          value={watch("birthDate") ? parseISO(watch("birthDate")) : null}
          onChange={handleDateChange}
          maxDate={new Date()}
          slotProps={{
            textField: {
              fullWidth: true,
              error: !!errors.birthDate,
              helperText: errors.birthDate?.message,
            },
          }}
        />
      </Box>

      <TextField
        label="Номер полиса ОМС*"
        fullWidth
        {...register("policyNumber", {
          required: "Обязательное поле",
          pattern: {
            value: /^\d{16}$/,
            message: "Должно быть 16 цифр",
          },
        })}
        error={!!errors.policyNumber}
        helperText={errors.policyNumber?.message}
      />

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 2 }}
        disabled={!hasChanges}
      >
        Сохранить
      </Button>
    </Box>
  );
};

export default PatientForm;
