import patientReducer, {
  clearError,
  PatientState,
  resetPatients,
} from "../../store/patientSlice";

describe("patientSlice", () => {
  // Тест 1: Проверка начального состояния редьюсера
  test("должен возвращать initialState при первом вызове", () => {
    // Вызываем редьюсер без состояния и действия, чтобы получить initialState
    const state = patientReducer(undefined, { type: "" });
    const expectedInitialState: PatientState = {
      patients: [],
      loading: false,
      error: null,
      nextStart: 0,
      hasMore: true,
    };
    expect(state).toEqual(expectedInitialState);
  });

  test("должен очищать ошибку при вызове clearError", () => {
    const currentState: PatientState = {
      patients: [],
      loading: false,
      error: "An error occurred",
      nextStart: 0,
      hasMore: true,
    };
    const state = patientReducer(currentState, clearError());
    expect(state.error).toBeNull();
  });

  test("должен сбрасывать состояние пациентов при вызове resetPatients", () => {
    const currentState: PatientState = {
      patients: [
        {
          id: 1,
          lastName: "Иванов",
          firstName: "Иван",
          gender: "М",
          birthDate: "1990-01-01",
          policyNumber: "12345",
        },
      ],
      loading: true,
      error: "Some error",
      nextStart: 5,
      hasMore: false,
    };
    const state = patientReducer(currentState, resetPatients());
    const expectedInitialState: PatientState = {
      patients: [],
      loading: false,
      error: null,
      nextStart: 0,
      hasMore: true,
    };
    expect(state).toEqual(expectedInitialState);
  });
});
