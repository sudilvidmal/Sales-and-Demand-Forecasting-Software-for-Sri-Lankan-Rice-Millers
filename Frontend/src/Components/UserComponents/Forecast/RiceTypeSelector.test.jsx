import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import RiceTypeSelector from "./RiceTypeSelector";

describe("🍚 RiceTypeSelector Component", () => {
  const mockOnRiceChange = vi.fn();
  const mockOnDaysChange = vi.fn();
  const defaultRice = "SIERRA RED RAW RICE -5KG";
  const defaultDays = 30;

  beforeEach(() => {
    render(
      <RiceTypeSelector
        selectedRice={defaultRice}
        onRiceChange={mockOnRiceChange}
        selectedDays={defaultDays}
        onDaysChange={mockOnDaysChange}
      />
    );
  });

  it("✅ renders rice type dropdown with correct options", () => {
    const riceSelect = screen.getByLabelText(/Select Rice Type/i);
    expect(riceSelect).toBeInTheDocument();
    expect(riceSelect.options.length).toBe(11);
    expect(riceSelect.value).toBe(defaultRice);
  });

  it("✅ renders forecast duration dropdown with correct options", () => {
    const durationSelect = screen.getByLabelText(/Select Forecast Duration/i);
    expect(durationSelect).toBeInTheDocument();
    expect(durationSelect.options.length).toBe(3);
    expect(durationSelect.value).toBe(defaultDays.toString());
  });

  it("🔁 triggers onRiceChange when rice type is changed", () => {
    const riceSelect = screen.getByLabelText(/Select Rice Type/i);
    fireEvent.change(riceSelect, {
      target: { value: "SAUMYA WHITE NADU RICE 10KG" },
    });
    expect(mockOnRiceChange).toHaveBeenCalledWith(
      "SAUMYA WHITE NADU RICE 10KG"
    );
  });

  it("🔁 triggers onDaysChange when forecast duration is changed", () => {
    const durationSelect = screen.getByLabelText(/Select Forecast Duration/i);
    fireEvent.change(durationSelect, {
      target: { value: "60" },
    });
    expect(mockOnDaysChange).toHaveBeenCalledWith(60);
  });
});
