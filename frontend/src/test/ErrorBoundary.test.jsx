import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ErrorBoundary from "../components/common/ErrorBoundary";

const ThrowingComponent = () => {
  throw new Error("Test error");
};

const GoodComponent = () => <div>Child content</div>;

describe("ErrorBoundary", () => {
  it("renders children when no error", () => {
    render(
      <ErrorBoundary>
        <GoodComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("renders error UI when child throws", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText(/unexpected error/)).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it("renders custom fallback message", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary fallbackMessage="Custom error message">
        <ThrowingComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText("Custom error message")).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it("renders refresh button", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText("Refresh Page")).toBeInTheDocument();
    consoleSpy.mockRestore();
  });
});
