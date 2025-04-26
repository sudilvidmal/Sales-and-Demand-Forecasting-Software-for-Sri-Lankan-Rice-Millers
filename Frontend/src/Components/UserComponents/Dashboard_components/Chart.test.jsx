import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Chart from "./Chart";
import axios from "axios";

// 🧪 Mock axios
vi.mock("axios");

describe("Chart Component", () => {
  beforeEach(() => {
    // Mock localStorage
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "mocked_token"),
    });
  });

  it("renders loading state initially", () => {
    render(<Chart title="Rice Sales (Last 7 Days)" type="line" />);
    expect(screen.getByText(/loading chart/i)).toBeInTheDocument();
  });

  it("renders chart when data is loaded", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        rice_sales_last_7_days: [
          { name: "Day 1", value: 100 },
          { name: "Day 2", value: 120 },
        ],
      },
    });

    render(<Chart title="Rice Sales (Last 7 Days)" type="line" />);

    await waitFor(() => {
      expect(screen.getByText("Rice Sales (Last 7 Days)")).toBeInTheDocument();
    });
  });

  it("shows error message when data is empty", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        rice_sales_last_7_days: [],
      },
    });

    render(<Chart title="Rice Sales (Last 7 Days)" type="line" />);

    await waitFor(() => {
      expect(screen.getByText(/no data available/i)).toBeInTheDocument();
    });
  });
});
