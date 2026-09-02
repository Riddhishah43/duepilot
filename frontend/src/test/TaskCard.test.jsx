import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TaskCard from "../components/common/TaskCard";

const mockTask = {
  _id: "123",
  title: "Test Task",
  description: "This is a test task description",
  deadline: "2026-12-31T23:59:59Z",
  priority: "high",
  status: "pending",
  category: "work",
  progress: 0,
  riskScore: 30,
};

describe("TaskCard", () => {
  it("renders task title", () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText("Test Task")).toBeInTheDocument();
  });

  it("renders task description", () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText("This is a test task description")).toBeInTheDocument();
  });

  it("renders priority badge", () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText("High")).toBeInTheDocument();
  });

  it("renders status badge", () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText("pending")).toBeInTheDocument();
  });

  it("renders category badge", () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText("work")).toBeInTheDocument();
  });

  it("renders deadline date", () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText(/Jan|Dec|2026/)).toBeInTheDocument();
  });

  it("shows risk score when > 50", () => {
    const riskyTask = { ...mockTask, riskScore: 75 };
    render(<TaskCard task={riskyTask} />);
    expect(screen.getByText("Risk: 75%")).toBeInTheDocument();
  });

  it("hides risk score when <= 50", () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.queryByText(/Risk/)).not.toBeInTheDocument();
  });

  it("shows progress bar when progress > 0", () => {
    const taskWithProgress = { ...mockTask, progress: 60 };
    const { container } = render(<TaskCard task={taskWithProgress} />);
    const progressFill = container.querySelector(".progress-fill");
    expect(progressFill).toBeInTheDocument();
    expect(progressFill.style.width).toBe("60%");
  });

  it("hides progress bar when progress is 0", () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.queryByText("0%")).not.toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<TaskCard task={mockTask} onClick={handleClick} />);
    fireEvent.click(screen.getByText("Test Task"));
    expect(handleClick).toHaveBeenCalledWith(mockTask);
  });

  it("renders without crashing when onClick is not provided", () => {
    render(<TaskCard task={mockTask} />);
    fireEvent.click(screen.getByText("Test Task"));
    // Should not throw
  });

  it("defaults to medium priority when not set", () => {
    const noPriorityTask = { ...mockTask, priority: undefined };
    render(<TaskCard task={noPriorityTask} />);
    expect(screen.getByText("Medium")).toBeInTheDocument();
  });

  it("renders without description when not provided", () => {
    const noDescTask = { ...mockTask, description: "" };
    render(<TaskCard task={noDescTask} />);
    expect(screen.getByText("Test Task")).toBeInTheDocument();
    expect(screen.queryByText("This is a test task description")).not.toBeInTheDocument();
  });
});
