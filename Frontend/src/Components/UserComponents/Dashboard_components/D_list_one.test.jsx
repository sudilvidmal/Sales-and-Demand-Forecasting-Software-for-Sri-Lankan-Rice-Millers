import { render, screen, waitFor } from "@testing-library/react";
import { expect } from "vitest";
import D_list_one from "./D_list_one";
import { describe, it, vi, beforeEach } from "vitest";
import axios from "axios";

// Mock axios
vi.mock("axios");

describe("D_list_one Component", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "mocked_token"),
    });
  });

  it("renders loading state initially", () => {
    render(<D_list_one />);
    expect(screen.getByText(/loading stock data/i)).toBeInTheDocument();
  });

  it("displays stock items after fetch", async () => {
    axios.get.mockResolvedValue({
      data: {
        stock_levels: [
          { type: "Red Raw Rice", current: 80, capacity: 100 },
          { type: "White Raw Rice", current: 30, capacity: 100 },
        ],
      },
    });

    render(<D_list_one />);

    await waitFor(() =>
      expect(screen.getByText(/Red Raw Rice/i)).toBeInTheDocument()
    );
    expect(screen.getByText(/80 kg of 100 kg/i)).toBeInTheDocument();
    expect(screen.getByText(/White Raw Rice/i)).toBeInTheDocument();
    expect(screen.getByText(/30 kg of 100 kg/i)).toBeInTheDocument();
  });
});
