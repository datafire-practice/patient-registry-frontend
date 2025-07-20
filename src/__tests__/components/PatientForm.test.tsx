import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { PatientForm } from "../../components";
import type { PatientFormData } from "../../types";

describe("PatientForm", (): void => {
  const mockOnSubmit: (data: PatientFormData) => void = jest.fn();

  const renderComponent = (): void => {
    render(
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <PatientForm onSubmit={mockOnSubmit} />
      </LocalizationProvider>
    );
  };

  test("должен рендерить поля формы и неактивную кнопку 'Сохранить'", (): void => {
    renderComponent();
    expect(screen.getByLabelText(/Фамилия/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Имя/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Номер полиса ОМС/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /сохранить/i })).toBeDisabled();
  });

  test("должен активировать кнопку 'Сохранить' когда форма валидна и изменена (valid and dirty)", async (): Promise<void> => {
    renderComponent();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/Фамилия/i), "Иванов");
    await user.type(screen.getByLabelText(/Имя/i), "Иван");
    await user.type(
      screen.getByLabelText(/Номер полиса ОМС/i),
      "1234567890123456"
    );

    expect(
      await screen.findByRole("button", { name: /сохранить/i })
    ).toBeEnabled();
  });
});
