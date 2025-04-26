import { render, screen, waitFor, act } from "@testing-library/react";
import UserSalesKPISection from "./UserSalesKPISection";
import axios from "axios";
import { describe, it, beforeEach, afterEach, vi, expect } from "vitest";

vi.mock("axios");

describe("📈 UserSalesKPISection Component", () => {
  beforeEach(() => {
    localStorage.setItem("user_token", "mocked_token");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("⏳ shows loading message initially", async () => {
    // ❗ Keep the promise unresolved to stay in loading state
    axios.get.mockImplementation(() => new Promise(() => {}));

    render(<UserSalesKPISection />);
    expect(
      await screen.findByText(/loading sales summary/i)
    ).toBeInTheDocument();
  });

  it("❌ shows error message if API call fails", async () => {
    axios.get.mockRejectedValueOnce(new Error("API error"));

    await act(async () => {
      render(<UserSalesKPISection />);
    });

    await waitFor(() => {
      expect(screen.getByText(/failed to load kpi data/i)).toBeInTheDocument();
    });
  });

  it("✅ renders KPI cards with mocked data", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        totalToday: 100,
        totalMonth: 5000,
        totalAll: 15000,
        revenue: 250000,
        avgDaily: 120,
        bestRice: "SIERRA RED RAW RICE -5KG",
        worstRice: "SAUMYA WHITE NADU RICE 10KG",
      },
    });

    await act(async () => {
      render(<UserSalesKPISection />);
    });

    await waitFor(() => {
      expect(screen.getByText("Total Sales (Today)")).toBeInTheDocument();
      expect(screen.getByText("100")).toBeInTheDocument();
      expect(screen.getByText(/Rs. 250000/)).toBeInTheDocument();
      expect(screen.getByText(/SIERRA RED RAW RICE -5KG/)).toBeInTheDocument();
      expect(
        screen.getByText(/SAUMYA WHITE NADU RICE 10KG/)
      ).toBeInTheDocument();
    });
  });
});
