import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import UserSalesAlerts from "./UserSalesAlerts";
import axios from "axios";
import { describe, it, beforeEach, afterEach, vi, expect } from "vitest";

// 🧪 Mock axios
vi.mock("axios");

describe("⚠️ UserSalesAlerts Component", () => {
  beforeEach(() => {
    localStorage.setItem("user_token", "mocked_token");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("⏳ shows loading message initially", () => {
    render(<UserSalesAlerts />);
    expect(screen.getByText(/loading alerts/i)).toBeInTheDocument();
  });

  it("✅ shows no alerts message when alerts are empty", async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    render(<UserSalesAlerts />);
    await waitFor(() => {
      expect(
        screen.getByText(/no unusual activity detected in sales/i)
      ).toBeInTheDocument();
    });
  });

  it("🚨 displays alerts correctly", async () => {
    axios.get.mockResolvedValueOnce({
      data: [
        {
          date: "2025-04-20",
          riceType: "RED RAW RICE",
          message: "Unusual spike in sales",
        },
        {
          date: "2025-04-21",
          riceType: "WHITE RICE",
          message: "Sudden drop detected",
        },
      ],
    });

    render(<UserSalesAlerts />);

    await waitFor(() => {
      expect(screen.getByText(/red raw rice/i)).toBeInTheDocument();
      expect(screen.getByText(/sudden drop detected/i)).toBeInTheDocument();
    });
  });

  it("🔁 toggles show all and show less", async () => {
    const alerts = Array.from({ length: 7 }, (_, i) => ({
      date: `2025-04-${10 + i}`,
      riceType: `RICE ${i + 1}`,
      message: `Alert ${i + 1}`,
    }));

    axios.get.mockResolvedValueOnce({ data: alerts });

    render(<UserSalesAlerts />);

    await waitFor(() => {
      expect(screen.getByText(/view all \(7\)/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/view all/i));
    expect(screen.getByText(/show less/i)).toBeInTheDocument();
  });
});
