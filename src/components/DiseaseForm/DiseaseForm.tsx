import React, { useEffect, useState, useCallback, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
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
import {
  API_ENDPOINTS,
  PAGINATION,
  ERROR_MESSAGES,
} from "../../utils/constants"; // Добавлено ERROR_MESSAGES
import { Disease, Mkb10DictionaryItem } from "../../types/patient";

interface DiseaseFormProps {
  onSubmit: () => void;
  patientId: number;
  disease?: Disease;
  mode: "add" | "edit";
  onClose: () => void;
}

interface ApiDiseaseRequest {
  patient: {
    id: number;
  };
  mkb10: Mkb10DictionaryItem;
  startDate: string;
  endDate: string | null;
  prescriptions: string;
  sickLeaveIssued: boolean;
}

const DiseaseForm: React.FC<DiseaseFormProps> = ({
  onSubmit,
  patientId,
  disease,
  mode,
  onClose,
}) => {
  const [mkb10Options, setMkb10Options] = useState<Mkb10DictionaryItem[]>([]);
  const [loadingMkb10, setLoadingMkb10] = useState(false);
  const [mkb10Page, setMkb10Page] = useState(0);
  const [hasMoreMkb10, setHasMoreMkb10] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const scrollPositionRef = useRef(0);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting, isDirty, isValid: formIsValid },
  } = useForm<ApiDiseaseRequest>({
    defaultValues: {
      patient: { id: patientId },
      mkb10: disease?.mkb10 || { code: "", name: "" },
      startDate: disease?.startDate || format(new Date(), "yyyy-MM-dd"),
      endDate: disease?.endDate ?? null,
      prescriptions: disease?.prescriptions || "",
      sickLeaveIssued: disease?.sickLeaveIssued || false,
    },
    mode: "onBlur",
  });

  const fetchMkb10 = useCallback(
    async (
      page: number,
      search: string = "",
      reset: boolean = false
    ): Promise<void> => {
      setLoadingMkb10(true);
      try {
        const url = `${API_ENDPOINTS.MKB10_DICTIONARY}?page=${page}&size=${
          PAGINATION.MKB10_PAGE_SIZE
        }${search ? `&search=${encodeURIComponent(search)}` : ""}`;

        const response = await axios.get(url);

        if (reset || page === 0) {
          setMkb10Options(response.data.content);
        } else {
          setMkb10Options((prev) => [...prev, ...response.data.content]);
        }

        setHasMoreMkb10(
          (page + 1) * PAGINATION.MKB10_PAGE_SIZE < response.data.totalElements
        );
      } catch (error) {
        console.error("Error fetching MKB10 dictionary:", error);
        // Обработка ошибок при загрузке справочника МКБ-10
        if (axios.isAxiosError(error)) {
          if (error.code === "ERR_NETWORK" || error.response?.status === 503) {
            // 503 Service Unavailable
            setError(ERROR_MESSAGES.SERVICE_UNAVAILABLE);
          } else {
            setError(
              error.response?.data?.message || ERROR_MESSAGES.UNKNOWN_ERROR
            );
          }
        } else {
          setError(ERROR_MESSAGES.UNKNOWN_ERROR);
        }
      } finally {
        setLoadingMkb10(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchMkb10(0, "", true);
  }, [fetchMkb10]);

  useEffect(() => {
    if (
      !loadingMkb10 &&
      listboxRef.current &&
      scrollPositionRef.current !== 0
    ) {
      listboxRef.current.scrollTop = scrollPositionRef.current;
      scrollPositionRef.current = 0;
    }
  }, [loadingMkb10, mkb10Options]);

  const handleScroll = (event: React.SyntheticEvent<Element, Event>): void => {
    const listboxNode = event.currentTarget as HTMLUListElement;
    if (
      listboxNode.scrollTop + listboxNode.clientHeight >=
        listboxNode.scrollHeight - 5 &&
      !loadingMkb10 &&
      hasMoreMkb10
    ) {
      scrollPositionRef.current = listboxNode.scrollTop;
      const nextPage = mkb10Page + 1;
      setMkb10Page(nextPage);
      fetchMkb10(nextPage, searchQuery);
    }
  };

  const handleSearchChange = (
    _event: React.SyntheticEvent<Element, Event>,
    value: string
  ): void => {
    setSearchQuery(value);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setMkb10Page(0);
      fetchMkb10(0, value, true);
    }, 300);
  };

  const handleAutocompleteOpen = (): void => {
    if (mkb10Options.length === 0 || (mkb10Page === 0 && !searchQuery)) {
      fetchMkb10(0, searchQuery, true);
    }
  };

  const handleFormSubmit = async (data: ApiDiseaseRequest): Promise<void> => {
    setError(null);
    try {
      if (!patientId) {
        throw new Error("Patient ID is missing");
      }

      const requestData = {
        ...data,
        endDate: data.endDate === "" ? null : data.endDate,
      };

      if (mode === "edit" && disease?.id) {
        await axios.put(
          `${API_ENDPOINTS.DISEASE(patientId, disease.id)}`,
          requestData
        );
      } else {
        await axios.post(
          API_ENDPOINTS.PATIENT_DISEASES(patientId),
          requestData
        );
      }
      onSubmit();
      onClose();
    } catch (error) {
      console.error("Ошибка при сохранении заболевания:", error);
      if (axios.isAxiosError(error)) {
        if (!error.response && error.code === "ECONNABORTED") {
          setError(ERROR_MESSAGES.SERVICE_UNAVAILABLE);
        } else if (!error.response) {
          setError(ERROR_MESSAGES.SERVICE_UNAVAILABLE);
        } else {
          setError(
            error.response?.data?.message || ERROR_MESSAGES.UNKNOWN_ERROR
          );
        }
      } else {
        setError(ERROR_MESSAGES.UNKNOWN_ERROR);
      }
    }
  };

  const values = watch();

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(handleFormSubmit)}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        p: 1,
        width: "100%",
      }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
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
              setSearchQuery("");
              setMkb10Page(0);
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
          />
        }
        label="Выдан лист нетрудоспособности"
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 2 }}
        disabled={isSubmitting || !isDirty || !formIsValid}
      >
        {isSubmitting ? <CircularProgress size={24} /> : "Сохранить"}
      </Button>
    </Box>
  );
};

export default DiseaseForm;
