import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ru } from "date-fns/locale";
import { PatientModalForm } from "../../components";
import type { PatientFormData } from "../../types";

describe("PatientModalForm", () => {
  const mockSubmit = jest.fn();
  const mockClose = jest.fn();
  const defaultValues: PatientFormData = {
    lastName: "Иванов",
    firstName: "Иван",
    middleName: "Иванович",
    gender: "М",
    birthDate: "1990-01-01",
    insuranceNumber: "1234567890123456",
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
    mockClose.mockClear();
  });

  test("отображает модальное окно с заголовком", (): void => {
    render(
      <Wrapper>
        <PatientModalForm
          open={true}
          onClose={mockClose}
          onSubmit={mockSubmit}
          title="Тестовый заголовок"
        />
      </Wrapper>
    );

    expect(screen.getByText("Тестовый заголовок")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  test("не отображается при open=false", (): void => {
    render(
      <Wrapper>
        <PatientModalForm
          open={false}
          onClose={mockClose}
          onSubmit={mockSubmit}
          title="Тестовый заголовок"
        />
      </Wrapper>
    );

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  test("передает дефолтные значения в форму", (): void => {
    render(
      <Wrapper>
        <PatientModalForm
          open={true}
          onClose={mockClose}
          onSubmit={mockSubmit}
          defaultValues={defaultValues}
          title="Тестовый заголовок"
        />
      </Wrapper>
    );

    expect(screen.getByLabelText("Фамилия*")).toHaveValue("Иванов");
  });

  test("вызывает onClose при клике на отмену", async (): Promise<void> => {
    render(
      <Wrapper>
        <PatientModalForm
          open={true}
          onClose={mockClose}
          onSubmit={mockSubmit}
          title="Тестовый заголовок"
        />
      </Wrapper>
    );

    const cancelButton = screen.getByRole("button", { name: "Отмена" });
    await userEvent.click(cancelButton);

    expect(mockClose).toHaveBeenCalled();
    expect(mockSubmit).not.toHaveBeenCalled();
  });
});
