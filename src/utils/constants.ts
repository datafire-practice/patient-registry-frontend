export const API_BASE_URL = "http://localhost:8080";

export const API_ENDPOINTS = {
  PATIENTS: `${API_BASE_URL}/patient`,
  PATIENT_DISEASES: (id: number): string =>
    `${API_BASE_URL}/patient/${id}/disease`,
  DISEASE: (patientId: number, diseaseId: number): string =>
    `${API_BASE_URL}/patient/${patientId}/disease/${diseaseId}`,
  MKB10_DICTIONARY: `${API_BASE_URL}/dictionary/mkb10`,
};

export const PAGINATION = {
  INITIAL_PAGE_SIZE: 15,
  ADDITIONAL_PAGE_SIZE: 5,
  DISEASES_PAGE_SIZE: 5,
  MKB10_PAGE_SIZE: 20,
};

export const ERROR_MESSAGES = {
  SERVICE_UNAVAILABLE: "Сервис временно недоступен",
  UNKNOWN_ERROR: "Неизвестная ошибка при получении данных",
  FETCH_ERROR: "При получении реестра произошла ошибка. Обновить",
  DELETE_ERROR: "Ошибка при удалении пациента",
  CREATE_ERROR: "Ошибка при создании пациента",
  UPDATE_ERROR: "Ошибка при обновлении пациента",
  FETCH_DISEASES_ERROR: "При получении заболеваний произошла ошибка. Обновить",
  CREATE_DISEASE_ERROR: "Ошибка при добавлении заболевания",
  DELETE_DISEASE_ERROR: "Ошибка при удалении заболевания",
  NO_DISEASES: "Заболеваний нет",
};
