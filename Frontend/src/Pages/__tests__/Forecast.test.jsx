import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Forecast from "../Forecast";
import { MemoryRouter } from "react-router-dom";

// 🧪 Mock localStorage
beforeEach(() => {
  vi.stubGlobal("localStorage", {
    getItem: vi.fn(() => "mocked_token"),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  });
});

// 🧪 Mock fetch
beforeEach(() => {
  globalThis.fetch = vi.fn((url) => {
    if (url.includes("run-forecast")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: "Mock forecast run complete" }),
      });
    }

    if (url.includes("/forecast?")) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            forecasts: [
              { date: "2025-04-01", quantity: 100 },
              { date: "2025-04-02", quantity: 120 },
            ],
          }),
      });
    }

    if (url.includes("/user/demand/summary") || url.includes("/user/demand")) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            summary: {},
            distribution: [],
          }),
      });
    }

    return Promise.resolve({ ok: false, json: () => ({}) });
  });
});

describe(" Forecast Page Integration", () => {
  it("renders key forecast components", async () => {
    render(
      <MemoryRouter>
        <Forecast />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(screen.getByText(/forecast overview/i)).toBeInTheDocument()
    );

    expect(
      screen.getByRole("button", { name: /generate forecast/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /export forecast as csv/i })
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/select rice type/i)).toBeInTheDocument();
    expect(screen.getByText(/forecast table/i)).toBeInTheDocument();
    expect(screen.getByText(/forecast table/i)).toBeInTheDocument();
  });

  it("toggles to demand section when clicked", async () => {
    render(
      <MemoryRouter>
        <Forecast />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(screen.getByText(/forecast overview/i)).toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole("button", { name: /demand/i }));

    // Look for a unique element only rendered in demand section
    await waitFor(() =>
      expect(screen.getByText(/demand summary/i)).toBeInTheDocument()
    );
  });

  it(" triggers generate forecast button and shows loading", async () => {
    render(
      <MemoryRouter>
        <Forecast />
      </MemoryRouter>
    );

    const button = await screen.findByRole("button", {
      name: /generate forecast/i,
    });
    fireEvent.click(button);

    await waitFor(() =>
      expect(screen.getByText(/generating/i)).toBeInTheDocument()
    );
  });
});
