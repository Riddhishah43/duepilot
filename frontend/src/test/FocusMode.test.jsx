import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import FocusMode from "../pages/FocusMode";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";

// Mock axios
vi.mock("axios", () => {
  const mockInstance = {
    get: vi.fn().mockResolvedValue({ data: { tasks: [] } }),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    defaults: { headers: { common: {} } },
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };
  return {
    default: {
      create: vi.fn(() => mockInstance),
      get: vi.fn().mockResolvedValue({ data: { tasks: [] } }),
      post: vi.fn(),
      defaults: { headers: { common: {} } },
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    },
  };
});

const renderFocusMode = () => {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <AuthProvider>
          <FocusMode />
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
};

describe("FocusMode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders focus mode heading", () => {
    renderFocusMode();
    expect(screen.getByText(/focus mode/i)).toBeInTheDocument();
  });

  it("renders pomodoro timer", () => {
    renderFocusMode();
    expect(screen.getByText("25:00")).toBeInTheDocument();
  });

  it("renders start button", () => {
    renderFocusMode();
    expect(screen.getByText(/start/i)).toBeInTheDocument();
  });

  it("starts timer on start button click", async () => {
    renderFocusMode();
    const startBtn = screen.getByText(/start/i);
    fireEvent.click(startBtn);
    // Timer should change to pause
    expect(screen.getByText(/pause/i)).toBeInTheDocument();
  });

  it("renders session counter", () => {
    renderFocusMode();
    expect(screen.getByText(/session/i)).toBeInTheDocument();
  });
});
