import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { GlobalLoadingIndicator } from "../../../components";

describe("GlobalLoadingIndicator", () => {
  test("не отображает индикатор загрузки, когда loading равно false", () => {
    render(<GlobalLoadingIndicator loading={false} />);
    const loadingIndicator = screen.queryByRole("progressbar");
    expect(loadingIndicator).not.toBeInTheDocument();
  });

  test("отображает индикатор загрузки, когда loading равно true", () => {
    render(<GlobalLoadingIndicator loading={true} />);
    const loadingIndicator = screen.getByRole("progressbar");
    expect(loadingIndicator).toBeInTheDocument();
  });
});
