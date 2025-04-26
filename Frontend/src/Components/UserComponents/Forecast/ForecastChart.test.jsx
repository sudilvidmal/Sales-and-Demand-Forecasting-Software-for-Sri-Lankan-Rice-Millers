import { render, screen } from "@testing-library/react";
import ForecastChart from "./ForecastChart";
import { describe, it, expect } from "vitest";

// Mock data
const mockData = [
  { date: "2025-04-01", quantity: 120 },
  { date: "2025-04-02", quantity: 130 },
  { date: "2025-04-03", quantity: 140 },
];

describe("📈 ForecastChart Component", () => {
  it("✅ renders chart title with rice type", () => {
    render(<ForecastChart riceType="Sample Rice" forecastData={mockData} />);
    expect(
      screen.getByText(/Sales Forecast for Sample Rice/i)
    ).toBeInTheDocument();
  });

  it("⚠️ shows no data message when forecastData is empty", () => {
    render(<ForecastChart riceType="Empty Rice" forecastData={[]} />);
    expect(screen.getByText(/No forecast data available/i)).toBeInTheDocument();
  });

  it("✅ renders Recharts <ResponsiveContainer> when data exists", () => {
    const { container } = render(
      <ForecastChart riceType="Charted Rice" forecastData={mockData} />
    );

    // Check if recharts container is present
    const chartContainer = container.querySelector(
      ".recharts-responsive-container"
    );
    expect(chartContainer).not.toBeNull();
  });
});
