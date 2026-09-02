import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Auth from "../pages/Auth";
import { AuthProvider } from "../context/AuthContext";

// Mock axios
vi.mock("axios", () => {
  const mockInstance = {
    post: vi.fn(),
    get: vi.fn(),
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
      post: vi.fn(),
      get: vi.fn(),
      defaults: { headers: { common: {} } },
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    },
  };
});

const renderAuth = (initialRoute = "/auth") => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthProvider>
        <Auth />
      </AuthProvider>
    </MemoryRouter>
  );
};

describe("Auth Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders login form by default", () => {
    renderAuth();
    expect(screen.getAllByText(/sign in/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByPlaceholderText(/you@example/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/at least 6/i)).toBeInTheDocument();
  });

  it("switches to register form", () => {
    renderAuth();
    fireEvent.click(screen.getByText(/sign up/i));
    expect(screen.getByText(/create account/i)).toBeInTheDocument();
  });

  it("renders demo login button", () => {
    renderAuth();
    expect(screen.getByText(/try demo/i)).toBeInTheDocument();
  });

  it("has email and password inputs", () => {
    renderAuth();
    const emailInput = screen.getByPlaceholderText(/you@example/i);
    const passwordInput = screen.getByPlaceholderText(/at least 6/i);
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
  });
});
