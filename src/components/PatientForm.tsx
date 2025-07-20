import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { PatientFormData } from "../types";
import {
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  SelectChangeEvent,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { format, parseISO } from "date-fns";

interface PatientFormProps {
  onSubmit: (data: PatientFormData) => void;
  defaultValues?: PatientFormData;
}

export const PatientForm: React.FC<PatientFormProps> = ({
  onSubmit,
  defaultValues,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty, isValid },
    reset,
  } = useForm<PatientFormData>({
    defaultValues: defaultValues || {
      lastName: "",
      firstName: "",
      middleName: "",
      gender: "М",
      birthDate: format(new Date(), "yyyy-MM-dd"),
      insuranceNumber: "",
    },
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  useEffect((): void => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  const handleDateChange = (date: Date | null): void => {
    if (date) {
      setValue("birthDate", format(date, "yyyy-MM-dd"), {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  const birthDateValue = watch("birthDate");

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
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
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          "& > *": {
            flex: { xs: "1 1 100%", lg: "1 1 30%" },
            minWidth: { xs: "100%", lg: "200px" },
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
          sx={{ fontSize: { xs: "0.875rem", lg: "1rem" } }}
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
          sx={{ fontSize: { xs: "0.875rem", lg: "1rem" } }}
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
          sx={{ fontSize: { xs: "0.875rem", lg: "1rem" } }}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          "& > *": {
            flex: { xs: "1 1 100%", lg: "1 1 45%" },
            minWidth: { xs: "100%", lg: "200px" },
          },
        }}
      >
        <FormControl
          fullWidth
          error={!!errors.gender}
          sx={{ fontSize: { xs: "0.875rem", lg: "1rem" } }}
        >
          <InputLabel>Пол*</InputLabel>
          <Select
            label="Пол*"
            {...register("gender", { required: "Обязательное поле" })}
            defaultValue={defaultValues?.gender || "М"}
            onChange={(e: SelectChangeEvent<"М" | "Ж">): void => {
              setValue("gender", e.target.value as "М" | "Ж", {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
            sx={{ fontSize: { xs: "0.875rem", lg: "1rem" } }}
          >
            <MenuItem value="М">Мужской</MenuItem>
            <MenuItem value="Ж">Женский</MenuItem>
          </Select>
          {errors.gender && (
            <FormHelperText
              sx={{ fontSize: { xs: "0.75rem", lg: "0.875rem" } }}
            >
              {errors.gender.message}
            </FormHelperText>
          )}
        </FormControl>

        <DatePicker
          label="Дата рождения*"
          value={birthDateValue ? parseISO(birthDateValue) : null}
          onChange={handleDateChange}
          maxDate={new Date()}
          slotProps={{
            textField: {
              fullWidth: true,
              error: !!errors.birthDate,
              helperText: errors.birthDate?.message,
              sx: { fontSize: { xs: "0.875rem", lg: "1rem" } },
            },
          }}
        />
      </Box>

      <TextField
        label="Номер полиса ОМС*"
        fullWidth
        {...register("insuranceNumber", {
          required: "Обязательное поле",
          pattern: {
            value: /^\d{16}$/,
            message: "Должно быть 16 цифр",
          },
        })}
        error={!!errors.insuranceNumber}
        helperText={errors.insuranceNumber?.message}
        sx={{ fontSize: { xs: "0.875rem", lg: "1rem" } }}
      />

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 2, fontSize: { xs: "0.875rem", lg: "1rem" } }}
        disabled={!isDirty || !isValid}
      >
        Сохранить
      </Button>
    </Box>
  );
};
