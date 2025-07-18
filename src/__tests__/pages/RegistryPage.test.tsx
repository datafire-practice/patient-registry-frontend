import { render, screen } from "@testing-library/react";
import RegistryPage from "../../pages/RegistryPage";
import PatientTable from "../../components/PatientTable/PatientTable";

jest.mock("../../components/PatientTable/PatientTable", () => {
  return jest.fn(() => (
    <div data-testid="patient-table">Таблица пациентов</div>
  ));
});

describe("RegistryPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("рендерит PatientTable внутри себя", () => {
    render(<RegistryPage />);

    expect(PatientTable).toHaveBeenCalledTimes(1);

    expect(screen.getByTestId("patient-table")).toBeInTheDocument();
    expect(screen.getByText("Таблица пациентов")).toBeInTheDocument();
  });
});
