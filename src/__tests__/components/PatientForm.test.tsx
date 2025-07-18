import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ru } from "date-fns/locale";
import PatientForm from "../../components/PatientForm/PatientForm";
import type { PatientFormData } from "../../types/patient";

describe("PatientForm", () => {
  const mockSubmit = jest.fn();
  const defaultValues: PatientFormData = {
    lastName: "Иванов",
    firstName: "Иван",
    middleName: "Иванович",
    gender: "М",
    birthDate: "1990-01-01",
    policyNumber: "1234567890123456",
  };

  const Wrapper = ({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactElement => (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
      {children}
    </LocalizationProvider>
  );

  beforeEach((): void => {
    mockSubmit.mockClear();
  });

  test("заполняет форму дефолтными значениями", (): void => {
    render(
      <Wrapper>
        <PatientForm onSubmit={mockSubmit} defaultValues={defaultValues} />
      </Wrapper>
    );

    expect(screen.getByLabelText("Фамилия*")).toHaveValue("Иванов");
    expect(screen.getByLabelText("Имя*")).toHaveValue("Иван");
    expect(screen.getByLabelText("Отчество")).toHaveValue("Иванович");

    const genderSelect = screen.getByRole("combobox");
    expect(genderSelect).toHaveTextContent("Мужской");

    expect(screen.getByLabelText("Номер полиса ОМС*")).toHaveValue(
      "1234567890123456"
    );
  });

  test("блокирует кнопку отправки при отсутствии изменений", (): void => {
    render(
      <Wrapper>
        <PatientForm onSubmit={mockSubmit} defaultValues={defaultValues} />
      </Wrapper>
    );

    expect(screen.getByRole("button", { name: "Сохранить" })).toBeDisabled();
  });

  test("разблокирует кнопку отправки при изменении данных", async (): Promise<void> => {
    render(
      <Wrapper>
        <PatientForm onSubmit={mockSubmit} defaultValues={defaultValues} />
      </Wrapper>
    );

    const lastNameInput = screen.getByLabelText("Фамилия*");
    await userEvent.type(lastNameInput, "а");

    expect(screen.getByRole("button", { name: "Сохранить" })).toBeEnabled();
  });

  test("вызывает onSubmit при отправке формы", async (): Promise<void> => {
    render(
      <Wrapper>
        <PatientForm onSubmit={mockSubmit} />
      </Wrapper>
    );

    await userEvent.type(screen.getByLabelText("Фамилия*"), "Иванов");
    await userEvent.type(screen.getByLabelText("Имя*"), "Иван");
    await userEvent.type(
      screen.getByLabelText("Номер полиса ОМС*"),
      "1234567890123456"
    );
    await userEvent.click(screen.getByRole("button", { name: "Сохранить" }));

    expect(mockSubmit).toHaveBeenCalled();
  });

  test("показывает ошибки валидации", async (): Promise<void> => {
    render(
      <Wrapper>
        <PatientForm onSubmit={mockSubmit} />
      </Wrapper>
    );

    await userEvent.type(screen.getByLabelText("Фамилия*"), "Ivanov");
    await userEvent.click(screen.getByRole("button", { name: "Сохранить" }));

    expect(
      screen.getByText("Только кириллица, дефис и пробел")
    ).toBeInTheDocument();
  });
});
