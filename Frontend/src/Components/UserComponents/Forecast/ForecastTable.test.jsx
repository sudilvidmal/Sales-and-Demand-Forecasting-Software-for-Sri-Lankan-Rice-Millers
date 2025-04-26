import { render, screen, fireEvent } from "@testing-library/react";
import ForecastTable from "./ForecastTable";
import { describe, it, expect, beforeEach } from "vitest";

const mockData = Array.from({ length: 25 }, (_, i) => ({
  date: `2025-04-${String(i + 1).padStart(2, "0")}`,
  quantity: (i + 1) * 10,
}));

describe("📅 ForecastTable Component", () => {
  beforeEach(() => {
    render(<ForecastTable riceType="Sample Rice" forecastData={mockData} />);
  });

  it("✅ renders the forecast table with initial page data", () => {
    expect(
      screen.getByText(/Forecast Table: Sample Rice/i)
    ).toBeInTheDocument();
    expect(screen.getByText("2025-04-01")).toBeInTheDocument(); // first row
    expect(screen.getByText("2025-04-10")).toBeInTheDocument(); // last of page 1
    expect(screen.queryByText("2025-04-11")).not.toBeInTheDocument(); // next page
  });

  it("🔁 navigates to next page and renders correct data", () => {
    const nextBtn = screen.getByRole("button", { name: /next/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText("2025-04-11")).toBeInTheDocument();
    expect(screen.queryByText("2025-04-01")).not.toBeInTheDocument();
  });

  it("🔁 navigates back to previous page", () => {
    const nextBtn = screen.getByRole("button", { name: /next/i });
    const prevBtn = screen.getByRole("button", { name: /prev/i });

    fireEvent.click(nextBtn); // move to page 2
    fireEvent.click(prevBtn); // back to page 1

    expect(screen.getByText("2025-04-01")).toBeInTheDocument();
  });

  it("⚠️ shows no data message when forecastData is empty", () => {
    render(<ForecastTable riceType="Empty Rice" forecastData={[]} />);
    expect(screen.getByText(/No forecast data available/i)).toBeInTheDocument();
  });
});
