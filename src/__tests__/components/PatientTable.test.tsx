import { render, screen } from "@testing-library/react";
import PatientTable from "../../components/PatientTable/PatientTable";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import patientReducer from "../../store/patientSlice";

const mockStore = configureStore({
  reducer: {
    patients: patientReducer,
  },

  preloadedState: {
    patients: {
      patients: [],
      loading: false,
      error: null,
      nextStart: 0,
      hasMore: true,
    },
  },
});

const mockPatientsStore = configureStore({
  reducer: {
    patients: patientReducer,
  },
  preloadedState: {
    patients: {
      patients: [
        {
          id: 1,
          lastName: "Иванов",
          firstName: "Иван",
          middleName: "Иванович",
          gender: "М" as "М" | "Ж",
          birthDate: "1990-01-15",
          policyNumber: "1234567890123456",
        },
        {
          id: 2,
          lastName: "Петрова",
          firstName: "Елена",
          middleName: "Сергеевна",
          gender: "Ж" as "М" | "Ж",
          birthDate: "1985-05-20",
          policyNumber: "9876543210987654",
        },
      ],
      loading: false,
      error: null,
      nextStart: 2,
      hasMore: true,
    },
  },
});

describe("PatientTable", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("рендерит таблицу и кнопки действий", () => {
    render(
      <Provider store={mockStore}>
        <PatientTable />{" "}
      </Provider>
    );

    expect(screen.getByText("ФИО")).toBeInTheDocument();
    expect(screen.getByText("Номер полиса")).toBeInTheDocument();
    expect(screen.getByText("Пол")).toBeInTheDocument();
    expect(screen.getByText("Дата рождения")).toBeInTheDocument();
    expect(screen.getByText("Действия")).toBeInTheDocument();
    expect(screen.getByLabelText("refresh")).toBeInTheDocument();
    expect(screen.getByLabelText("add")).toBeInTheDocument();
  });

  test("отображает сообщение 'В реестре нет записей', когда список пациентов пуст и нет загрузки/ошибки", () => {
    render(
      <Provider store={mockStore}>
        <PatientTable />{" "}
      </Provider>
    );
    expect(screen.getByText("В реестре нет записей")).toBeInTheDocument();
  });

  test("отображает корректное количество записей в счетчике", () => {
    render(
      <Provider store={mockPatientsStore}>
        <PatientTable />
      </Provider>
    );

    expect(
      screen.getByText(
        `Показано записей: ${
          mockPatientsStore.getState().patients.patients.length
        }`
      )
    ).toBeInTheDocument();
  });
});
