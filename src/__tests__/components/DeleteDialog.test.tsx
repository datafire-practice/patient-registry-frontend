import { render, screen, fireEvent, act } from "@testing-library/react";
import { DeleteDialog } from "../../components";

describe("DeleteDialog", () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("не рендерится, когда open равно false", () => {
    render(
      <DeleteDialog
        open={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );
    expect(
      screen.queryByText("Подтверждение удаления")
    ).not.toBeInTheDocument();
  });

  test("рендерится и отображает правильный заголовок и текст, когда open равно true", () => {
    render(
      <DeleteDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );
    expect(screen.getByText("Подтверждение удаления")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Вы уверены, что хотите удалить этого пациента? Это действие нельзя отменить."
      )
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Отмена" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Удалить" })).toBeInTheDocument();
  });

  test("вызывает onClose при клике на кнопку 'Отмена'", async () => {
    render(
      <DeleteDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Отмена" }));
    });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test("вызывает onConfirm при клике на кнопку 'Удалить'", async () => {
    render(
      <DeleteDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Удалить" }));
    });
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });
});
