import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Dashboard from "../Dashboard";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";

// Mock axios
vi.mock("axios");

// Stub localStorage
beforeEach(() => {
  vi.stubGlobal("localStorage", {
    getItem: vi.fn(() => "mocked_token"),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  });
});

describe("Dashboard Integration Test", () => {
  beforeEach(() => {
    axios.get.mockImplementation((url) => {
      if (url.includes("kpi")) {
        return Promise.resolve({
          data: {
            todaysSales: 120,
            todaysSalesTrend: 10,
            forecastNext30Days: 300,
            forecastTrend: 15,
            totalStockRemaining: 150,
            stockTrend: -5,
            understockCount: 2,
          },
        });
      }
      if (url.includes("charts")) {
        return Promise.resolve({
          data: {
            rice_sales_last_7_days: [{ name: "Mon", value: 80 }],
            forecasted_demand: [{ name: "Nadu", value: 100 }],
            stock_movement: [{ name: "2025-04-20", value: 60 }],
          },
        });
      }
      if (url.includes("current-stock-levels")) {
        return Promise.resolve({
          data: {
            stock_levels: [
              { type: "Red Raw Rice", current: 80, capacity: 100 },
            ],
          },
        });
      }
      if (url.includes("system-logs")) {
        return Promise.resolve({
          data: {
            logs: [
              {
                event_type: "sales_upload",
                description: "Sales data uploaded",
                timestamp: "2025-04-20T10:30:00.000Z",
              },
            ],
          },
        });
      }
      return Promise.reject(new Error("Unknown API"));
    });
  });

  it("renders all dashboard components after data loads", async () => {
    const { container } = render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

  await waitFor(() => {
    expect(screen.getByText(/Today's Sales/i)).toBeInTheDocument();
  });

  expect(container.textContent).toContain("120.00 kg");
  expect(container.textContent).toContain("300.00 kg");
  expect(container.textContent).toContain("150.00 kg");
  expect(container.textContent).toContain("Understock Alerts");

  await waitFor(() => {
    expect(screen.getByText(/Red Raw Rice/i)).toBeInTheDocument();
  });

  expect(container.textContent).toContain("Sales data uploaded");


  });
});
