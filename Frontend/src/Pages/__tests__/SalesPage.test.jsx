import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, beforeEach, afterEach, vi, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import SalesPage from "../Sales";

vi.mock("axios");

describe("📊 Sales Page Integration", () => {
  beforeEach(() => {
    localStorage.setItem("user_token", "mocked_token");

    axios.get.mockImplementation((url) => {
      if (url.includes("/user/sales/kpi")) {
        return Promise.resolve({
          data: {
            totalToday: 100,
            totalMonth: 500,
            totalAll: 5000,
            revenue: 150000,
            avgDaily: 200,
            bestRice: "SIERRA WHITE RAW RICE -5KG",
            worstRice: "SAUMYA WHITE NADU RICE 10KG",
          },
        });
      }

      if (url.includes("/user/sales/charts")) {
        return Promise.resolve({
          data: {
            bar: { labels: ["Red", "White"], data: [150, 250] },
            pie: { labels: ["Red", "White"], data: [60, 40] },
            line: { labels: ["2025-04-20", "2025-04-21"], data: [160, 170] },
          },
        });
      }

      if (url.includes("/user/sales/alerts")) {
        return Promise.resolve({
          data: [
            {
              date: "2025-04-21",
              riceType: "SIERRA RED RAW RICE -5KG",
              message: "⚠️ Unusual spike in sales.",
            },
          ],
        });
      }

      if (url.includes("/user/sales/table")) {
        return Promise.resolve({
          data: {
            data: [
              {
                date: "2025-04-20",
                rice_type: "SAUMYA WHITE NADU RICE 5KG",
                quantity_kg: 80,
                gross_amount: 12000,
                price_per_kg: 150,
                closed: true,
              },
            ],
            pages: 1,
          },
        });
      }

      return Promise.reject(new Error("❌ Unknown endpoint"));
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("✅ renders all sections of the Sales Page", async () => {
    render(
      <MemoryRouter>
        <SalesPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      // ✅ Match by finding any element containing the KPI label
      const labels = screen.getAllByText(/Total Sales/i);
      const found = labels.some((label) =>
        label.textContent?.includes("Total Sales (Today)")
      );
      expect(found).toBe(true);

      // ✅ Check for other sections
      expect(
        screen.getByText(/Sales Trends & Distribution/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Sales Data Table/i)).toBeInTheDocument();
      expect(screen.getByText(/Sales Alerts/i)).toBeInTheDocument();
      expect(
        screen.getByText(/SIERRA WHITE RAW RICE -5KG/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/SAUMYA WHITE NADU RICE 10KG/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/SAUMYA WHITE NADU RICE 5KG/i)
      ).toBeInTheDocument();
    });
  });
});
