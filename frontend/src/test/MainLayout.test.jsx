import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";

// Mock axios
vi.mock("axios", () => {
  const mockInstance = {
    get: vi.fn().mockResolvedValue({ data: { user: { name: "Test", theme: "light" } } }),
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
      get: vi.fn().mockResolvedValue({ data: { user: { name: "Test", theme: "light" } } }),
      post: vi.fn(),
      defaults: { headers: { common: {} } },
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    },
  };
});

const renderLayout = (children = <div>Page Content</div>) => {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <AuthProvider>
          <MainLayout>{children}</MainLayout>
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
};

describe("MainLayout", () => {
  it("renders children", () => {
    renderLayout();
    expect(screen.getByText("Page Content")).toBeInTheDocument();
  });

  it("renders DuePilot brand", () => {
    renderLayout();
    expect(screen.getByText("DuePilot")).toBeInTheDocument();
  });

  it("renders sidebar navigation items", () => {
    renderLayout();
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/tasks/i)).toBeInTheDocument();
  });

  it("renders theme toggle", () => {
    renderLayout();
    expect(screen.getByLabelText(/toggle theme/i)).toBeInTheDocument();
  });

  it("toggles mobile sidebar", () => {
    renderLayout();
    const toggleButton = screen.getByLabelText(/toggle sidebar/i);
    fireEvent.click(toggleButton);
    // Sidebar should become visible
  });
});
