import { render, screen, waitFor } from "@testing-library/react";
import UserSalesCharts from "./UserSalesCharts";
import axios from "axios";
import { describe, it, beforeEach, afterEach, beforeAll, vi, expect } from "vitest";

// ✅ Mock axios globally
vi.mock("axios");

// ✅ Mock canvas.getContext to avoid Chart.js rendering errors in jsdom
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(() => []),
    putImageData: vi.fn(),
    createImageData: vi.fn(() => []),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    fillText: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
    transform: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
  }));
});

describe("📊 UserSalesCharts Component", () => {
  beforeEach(() => {
    localStorage.setItem("user_token", "mocked_token");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("⏳ shows loading message initially", () => {
    render(<UserSalesCharts />);
    expect(screen.getByText(/loading charts/i)).toBeInTheDocument();
  });

  it("❌ shows error message if API call fails", async () => {
    axios.get.mockRejectedValueOnce(new Error("API error"));

    render(<UserSalesCharts />);
    await waitFor(() => {
      expect(
        screen.getByText(/failed to load chart data/i)
      ).toBeInTheDocument();
    });
  });

  it("✅ renders charts correctly with mocked API data", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        bar: { labels: ["Red", "White"], data: [100, 200] },
        pie: { labels: ["Red", "White"], data: [60, 40] },
        line: {
          labels: ["2025-04-20", "2025-04-21"],
          data: [150, 180],
        },
      },
    });

    render(<UserSalesCharts />);

    await waitFor(() => {
      expect(screen.getByText(/sales by rice type/i)).toBeInTheDocument();
      expect(screen.getByText(/sales distribution/i)).toBeInTheDocument();
      expect(screen.getByText(/sales trend/i)).toBeInTheDocument();
    });
  });
});
