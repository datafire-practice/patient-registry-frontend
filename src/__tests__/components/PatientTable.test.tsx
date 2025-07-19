import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import type { ThunkDispatch } from "redux-thunk";
import type { Action } from "@reduxjs/toolkit";
import type { RootState } from "../../store/store";
import type { PatientState } from "../../store/patientSlice";
import PatientTable from "../../components/PatientTable/PatientTable";
import type { Patient } from "../../types/patient";

jest.mock("../../components/DeleteDialog/DeleteDialog", () => ({
  __esModule: true,
  default: jest.fn(({ open, onClose, onConfirm }) =>
    open ? (
      <div data-testid="delete-dialog-mock">
        <button onClick={onConfirm}>Confirm Delete</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    ) : null
  ),
}));

jest.mock("../../components/PatientModalForm/PatientModalForm", () => ({
  __esModule: true,
  default: jest.fn(({ open, onClose, onSubmit, title }) =>
    open ? (
      <div>
        <h2>{title}</h2>
        <button onClick={() => onSubmit({})}>Submit</button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null
  ),
}));

type AppDispatch = ThunkDispatch<RootState, unknown, Action<string>>;
const mockStore = configureStore<Partial<RootState>, AppDispatch>([]);

describe("PatientTable", (): void => {
  const initialPatientState: PatientState = {
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

  const mockPatients: Patient[] = [
    {
      id: 1,
      lastName: "Иванов",
      firstName: "Иван",
      middleName: "Иванович",
      gender: "М",
      birthDate: "1990-01-01",
      insuranceNumber: "1234567890123456",
    },
    {
      id: 2,
      lastName: "Петрова",
      firstName: "Анна",
      middleName: "Петровна",
      gender: "Ж",
      birthDate: "1985-05-10",
      insuranceNumber: "6543210987654321",
    },
  ];

  test("должен отображать индикатор загрузки при первоначальной загрузке", (): void => {
    const store = mockStore({
      patients: { ...initialPatientState, loading: true },
    });
    store.dispatch = jest.fn();

    render(
      <Provider store={store}>
        <PatientTable />
      </Provider>
    );

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  test("должен отображать сообщение о пустом состоянии, если пациенты не загружены", (): void => {
    const store = mockStore({
      patients: { ...initialPatientState, loading: false, patients: [] },
    });
    store.dispatch = jest.fn();

    render(
      <Provider store={store}>
        <PatientTable />
      </Provider>
    );

    expect(screen.getByText("В реестре нет записей")).toBeInTheDocument();
  });

  test("должен отображать данные пациентов после загрузки", (): void => {
    const store = mockStore({
      patients: {
        ...initialPatientState,
        loading: false,
        patients: mockPatients,
        totalElements: 2,
      },
    });
    store.dispatch = jest.fn();

    render(
      <Provider store={store}>
        <PatientTable />
      </Provider>
    );

    expect(screen.getByText("Иванов Иван Иванович")).toBeInTheDocument();
    expect(screen.getByText("1234567890123456")).toBeInTheDocument();
    expect(screen.getByText("Мужской")).toBeInTheDocument();
    expect(screen.getByText("01 января 1990")).toBeInTheDocument();

    expect(screen.getByText("Петрова Анна Петровна")).toBeInTheDocument();
    expect(screen.getByText("6543210987654321")).toBeInTheDocument();
    expect(screen.getByText("Женский")).toBeInTheDocument();
    expect(screen.getByText("10 мая 1985")).toBeInTheDocument();

    expect(screen.getByText("Показано записей: 2 из 2")).toBeInTheDocument();
  });

  test("должен вызывать handleDeleteClick и открывать DeleteDialog при нажатии на иконку удаления", async (): Promise<void> => {
    const store = mockStore({
      patients: {
        ...initialPatientState,
        loading: false,
        patients: mockPatients,
        totalElements: 2,
      },
    });
    store.dispatch = jest.fn();

    render(
      <Provider store={store}>
        <PatientTable />
      </Provider>
    );

    const deleteButtons = screen.getAllByLabelText(
      `Удалить пациента ${mockPatients[0].lastName}`
    );
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId("delete-dialog-mock")).toBeInTheDocument();
    });
  });

  test("должен вызывать handleCreateClick и открывать PatientModalForm при нажатии на кнопку добавления", async (): Promise<void> => {
    const store = mockStore({
      patients: {
        ...initialPatientState,
        loading: false,
        patients: mockPatients,
        totalElements: 2,
      },
    });
    store.dispatch = jest.fn();

    render(
      <Provider store={store}>
        <PatientTable />
      </Provider>
    );

    const addButton = screen.getByLabelText("Добавить нового пациента");
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Добавление нового пациента" })
      ).toBeInTheDocument();
    });
  });

  test("должен вызывать handleEditClick и открывать PatientModalForm при нажатии на иконку редактирования", async (): Promise<void> => {
    const store = mockStore({
      patients: {
        ...initialPatientState,
        loading: false,
        patients: mockPatients,
        totalElements: 2,
      },
    });
    store.dispatch = jest.fn();

    render(
      <Provider store={store}>
        <PatientTable />
      </Provider>
    );

    const editButtons = screen.getAllByLabelText(
      `Редактировать пациента ${mockPatients[0].lastName}`
    );
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Редактирование пациента" })
      ).toBeInTheDocument();
    });
  });
});
