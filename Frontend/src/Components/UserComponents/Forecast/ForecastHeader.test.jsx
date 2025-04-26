import { render, screen, fireEvent } from "@testing-library/react";
import ForecastHeader from "./ForecastHeader";
import { describe, it, expect, vi } from "vitest";

describe("📈 ForecastHeader Component", () => {
  it("✅ renders title and description", () => {
    render(<ForecastHeader onGenerate={() => {}} loading={false} />);
    expect(screen.getByText(/forecast overview/i)).toBeInTheDocument();
    expect(
      screen.getByText(/select a rice type to view its sales prediction/i)
    ).toBeInTheDocument();
  });

  it("✅ renders button with correct label when not loading", () => {
    render(<ForecastHeader onGenerate={() => {}} loading={false} />);
    expect(
      screen.getByRole("button", { name: /generate forecast/i })
    ).toBeInTheDocument();
  });

  it("✅ calls onGenerate when button is clicked", () => {
    const mockGenerate = vi.fn();
    render(<ForecastHeader onGenerate={mockGenerate} loading={false} />);
    fireEvent.click(screen.getByRole("button"));
    expect(mockGenerate).toHaveBeenCalledTimes(1);
  });

  it("⚠️ disables button and shows loading text when loading is true", () => {
    render(<ForecastHeader onGenerate={() => {}} loading={true} />);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent(/generating/i);
  });
});
