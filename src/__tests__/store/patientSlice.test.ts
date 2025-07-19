import patientReducer, {
  clearError,
  resetPatientsState,
  fetchPatients,
  deletePatient,
  PatientState,
} from "../../store/patientSlice";
import { ERROR_MESSAGES } from "../../utils/constants";
import { Patient } from "../../types/patient";

describe("patientSlice reducer", (): void => {
  const initialState: PatientState = {
    patients: [],
    loading: false,
    error: null,
    currentPage: -1,
    totalPages: 0,
    totalElements: 0,
    lastLoadedPageSize: 0,
    paginationError: false,
    nextPageToLoad: 0,
  };

  const mockPatient: Patient = {
    id: 1,
    lastName: "Иванов",
    firstName: "Иван",
    middleName: "Иванович",
    gender: "М",
    birthDate: "1990-01-01",
    insuranceNumber: "1234567890123456",
  };

  test("должен корректно обрабатывать action clearError и очищать ошибку", (): void => {
    const stateWithError: PatientState = {
      ...initialState,
      error: ERROR_MESSAGES.FETCH_ERROR,
    };
    const nextState = patientReducer(stateWithError, clearError());
    expect(nextState.error).toBeNull();
  });

  test("должен корректно обрабатывать fetchPatients.pending", (): void => {
    const nextState = patientReducer(
      initialState,
      fetchPatients.pending("requestId", { page: 0 })
    );
    expect(nextState.loading).toBe(true);
    expect(nextState.error).toBeNull();
  });

  test("должен корректно обрабатывать fetchPatients.fulfilled и добавлять пациентов", (): void => {
    const fulfilledPayload = {
      content: [mockPatient],
      page: {
        number: 0,
        size: 15,
        totalElements: 1,
        totalPages: 1,
      },
    };
    const nextState = patientReducer(
      { ...initialState, loading: true },
      fetchPatients.fulfilled(fulfilledPayload, "requestId", {
        page: 0,
        reset: true,
      })
    );
    expect(nextState.patients).toEqual([mockPatient]);
    expect(nextState.loading).toBe(false);
    expect(nextState.error).toBeNull();
    expect(nextState.totalElements).toBe(1);
    expect(nextState.currentPage).toBe(0);
    expect(nextState.nextPageToLoad).toBe(1);
  });

  test("должен корректно обрабатывать deletePatient.rejected и устанавливать ошибку", (): void => {
    const errorPayload = ERROR_MESSAGES.DELETE_ERROR;
    const nextState = patientReducer(
      { ...initialState, loading: true },
      deletePatient.rejected(null, "requestId", 1, errorPayload)
    );
    expect(nextState.loading).toBe(false);
    expect(nextState.error).toBe(errorPayload);
    expect(nextState.paginationError).toBe(false);
  });

  test("должен корректно обрабатывать resetPatientsState", (): void => {
    const stateWithData: PatientState = {
      patients: [mockPatient],
      loading: false,
      error: "some error",
      currentPage: 5,
      totalPages: 10,
      totalElements: 50,
      lastLoadedPageSize: 10,
      paginationError: true,
      nextPageToLoad: 6,
    };
    const nextState = patientReducer(stateWithData, resetPatientsState());
    expect(nextState).toEqual(initialState);
  });
});
