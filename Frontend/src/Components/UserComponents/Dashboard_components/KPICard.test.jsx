// src/Components/UserComponents/Dashboard_components/KPICard.test.jsx
import { render, screen } from "@testing-library/react";
import KPICard from "./KPICard";
import { FaChartLine } from "react-icons/fa";
import { describe, it, expect } from "vitest";

describe("KPICard Component", () => {
  it("renders with title, value, icon, and upward trend", () => {
    render(
      <KPICard
        title="Total Sales"
        value={5000}
        percentage={12}
        trend="up"
        icon={<FaChartLine />}
      />
    );
    expect(screen.getByText("Total Sales")).toBeInTheDocument();
    expect(screen.getByText("5000")).toBeInTheDocument();
    expect(screen.getByText("▲ 12%")).toBeInTheDocument();
  });

  it("renders with downward trend", () => {
    render(
      <KPICard
        title="Returned Orders"
        value={7}
        percentage={5}
        trend="down"
        icon={<FaChartLine />}
      />
    );
    expect(screen.getByText("▼ 5%")).toBeInTheDocument();
  });

  it("renders with 0% change as neutral", () => {
    render(
      <KPICard
        title="Inventory Updates"
        value={25}
        percentage={0}
        trend="up"
        icon={<FaChartLine />}
      />
    );
    expect(screen.getByText("⬤ 0%")).toBeInTheDocument();
  });
});
