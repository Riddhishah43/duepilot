import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatCard from "../components/common/StatCard";

describe("StatCard", () => {
  it("renders title and value", () => {
    render(<StatCard title="Tasks Completed" value={42} />);
    expect(screen.getByText("Tasks Completed")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders icon", () => {
    render(<StatCard title="Score" value={95} icon={<span data-testid="icon">star</span>} />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("renders without icon", () => {
    render(<StatCard title="Count" value={10} />);
    expect(screen.getByText("Count")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("renders string values", () => {
    render(<StatCard title="Status" value="Active" />);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });
});
