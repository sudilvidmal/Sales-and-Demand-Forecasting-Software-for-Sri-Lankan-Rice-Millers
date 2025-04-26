// src/Components/UserComponents/Dashboard_components/D_list_two.test.jsx
import { render, screen } from "@testing-library/react";
import D_list_two from "./D_list_two";
import { describe, it, expect } from "vitest";

// Mock log data
const mockLogs = [
  {
    event_type: "sales_upload",
    description: "Sales data uploaded successfully",
    timestamp: "2025-04-20T10:30:00.000Z",
  },
  {
    event_type: "forecast_generated",
    description: "Forecast model trained",
    timestamp: "2025-04-20T11:45:00.000Z",
  },
  {
    event_type: "stock_sync",
    description: "Inventory sync completed",
    timestamp: "2025-04-20T13:15:00.000Z",
  },
];

describe("D_list_two Component", () => {
  it("renders without crashing and shows fallback message if logs is not an array", () => {
    render(<D_list_two logs={null} />);
    expect(screen.getByText(/system logs/i)).toBeInTheDocument();
    expect(screen.getByText(/logs not available/i)).toBeInTheDocument();
  });

  it("renders log items correctly", () => {
    render(<D_list_two logs={mockLogs} />);
    expect(
      screen.getByText(/Sales data uploaded successfully/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Forecast model trained/i)).toBeInTheDocument();
    expect(screen.getByText(/Inventory sync completed/i)).toBeInTheDocument();
  });

  it("renders formatted timestamps", () => {
    render(<D_list_two logs={mockLogs} />);
    const formattedDates = screen.getAllByText(
      (content) => typeof content === "string" && content.includes("Apr 20")
    );
    expect(formattedDates.length).toBe(3); // There should be 3 log entries with Apr 20 timestamps
  });
});
