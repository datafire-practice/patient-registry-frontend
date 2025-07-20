import React, { useEffect } from "react";
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
  SelectChangeEvent,
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
        p: 1,
        width: "100%",
        "& .MuiOutlinedInput-root": {
          borderRadius: 2,
        },
        "& .MuiButton-root": {
          borderRadius: 2,
        },
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
            defaultValue={defaultValues?.gender || "М"}
            onChange={(e: SelectChangeEvent<"М" | "Ж">): void => {
              setValue("gender", e.target.value as "М" | "Ж", {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
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
          value={birthDateValue ? parseISO(birthDateValue) : null}
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
        {...register("insuranceNumber", {
          required: "Обязательное поле",
          pattern: {
            value: /^\d{16}$/,
            message: "Должно быть 16 цифр",
          },
        })}
        error={!!errors.insuranceNumber}
        helperText={errors.insuranceNumber?.message}
      />

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 2 }}
        disabled={!isDirty || !isValid}
      >
        Сохранить
      </Button>
    </Box>
  );
};

export default PatientForm;
