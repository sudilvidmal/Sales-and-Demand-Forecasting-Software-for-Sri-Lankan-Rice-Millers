import { render, screen, fireEvent } from "@testing-library/react";
import ExportOptions from "./ExportOptions";
import { describe, it, vi, expect, beforeEach } from "vitest";
import { saveAs } from "file-saver";

// ⛔ Mock the file-saver library
vi.mock("file-saver", () => ({
  saveAs: vi.fn(),
}));

const mockData = [
  { date: "2025-04-01", quantity: 120 },
  { date: "2025-04-02", quantity: 130.5 },
];

describe("⬇️ ExportOptions Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("✅ renders export button", () => {
    render(<ExportOptions riceType="Test Rice" forecastData={mockData} />);
    const button = screen.getByRole("button", {
      name: /export forecast as csv/i,
    });
    expect(button).toBeInTheDocument();
  });

  it("✅ calls saveAs when export button is clicked with valid data", () => {
    render(<ExportOptions riceType="Test Rice" forecastData={mockData} />);
    const button = screen.getByText(/export forecast/i);
    fireEvent.click(button);

    expect(saveAs).toHaveBeenCalledTimes(1);
    const blobArg = saveAs.mock.calls[0][0];
    const filenameArg = saveAs.mock.calls[0][1];
    expect(blobArg instanceof Blob).toBe(true);
    expect(filenameArg).toBe("Test_Rice_forecast.csv");
  });

  it("⚠️ shows alert if forecast data is empty", () => {
    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});
    render(<ExportOptions riceType="Empty Rice" forecastData={[]} />);
    const button = screen.getByText(/export forecast/i);
    fireEvent.click(button);

    expect(alertMock).toHaveBeenCalledWith(
      "⚠️ No forecast data available to export."
    );
    expect(saveAs).not.toHaveBeenCalled();
    alertMock.mockRestore();
  });
});
