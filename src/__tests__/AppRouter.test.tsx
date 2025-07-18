import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AppRouter from "../router/AppRouter";
import RegistryPage from "../pages/RegistryPage";

jest.mock("../pages/RegistryPage", () => {
  return jest.fn(() => <div>Страница Реестра</div>);
});

describe("AppRouter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("рендерит RegistryPage для пути '/'", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppRouter />
      </MemoryRouter>
    );
    expect(RegistryPage).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Страница Реестра")).toBeInTheDocument();
  });

  test("рендерит RegistryPage для пути '/registry'", () => {
    render(
      <MemoryRouter initialEntries={["/registry"]}>
        <AppRouter />
      </MemoryRouter>
    );
    expect(RegistryPage).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Страница Реестра")).toBeInTheDocument();
  });
});
