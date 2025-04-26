import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import UserSalesTable from "./UserSalesTable";
import { vi } from "vitest";
import axios from "axios";

// 🔁 Mock axios
vi.mock("axios");

describe("UserSalesTable Component", () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Reset mocks between tests
  });

  it("renders filter controls", () => {
    render(<UserSalesTable />);
    expect(screen.getByLabelText(/Filter by Rice Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/From Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/To Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Search Price Per KG/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Filter by Closed/i)).toBeInTheDocument();
  });

  it("shows fallback message when no sales data", async () => {
    axios.get.mockResolvedValueOnce({
      data: { data: [], pages: 1 },
    });

    render(<UserSalesTable />);
    expect(
      await screen.findByText(/No records found with selected filters/i)
    ).toBeInTheDocument();
  });

  it("displays sales data fetched from API", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        data: [
          {
            date: "2025-04-20",
            rice_type: "SAUMYA WHITE NADU RICE 5KG",
            quantity_kg: 100,
            gross_amount: 15000,
            price_per_kg: 150,
            closed: true,
          },
        ],
        pages: 1,
      },
    });

    render(<UserSalesTable />);
    expect(
      await screen.findByText(/SAUMYA WHITE NADU RICE 5KG/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Rs\. 15000/i)).toBeInTheDocument();
    expect(screen.getByTestId("status-icon")).toHaveTextContent("✅");
  });

  it("allows changing rice type filter", async () => {
    render(<UserSalesTable />);
    const select = screen.getByLabelText(/Filter by Rice Type/i);

    await userEvent.selectOptions(select, "SIERRA RED RAW RICE -5KG");
    expect(select.value).toBe("SIERRA RED RAW RICE -5KG");
  });
});
