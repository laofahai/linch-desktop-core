import { describe, it, expect, vi, beforeEach, afterAll } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { ErrorBoundary } from "./ErrorBoundary"

// Mock logger
vi.mock("../../lib/logger", () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}))

// Component that throws an error
function ThrowError({ error }: { error: Error }) {
  throw error
}

// Suppress React error boundary console errors in tests
const originalConsoleError = console.error

describe("ErrorBoundary", () => {
  beforeEach(() => {
    console.error = vi.fn()
  })

  afterAll(() => {
    console.error = originalConsoleError
  })

  it("should render children when no error", () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Hello</div>
      </ErrorBoundary>
    )

    expect(screen.getByTestId("child")).toBeInTheDocument()
  })

  it("should render error UI when child throws", () => {
    render(
      <ErrorBoundary>
        <ThrowError error={new Error("Test error")} />
      </ErrorBoundary>
    )

    expect(screen.getByText("Something went wrong")).toBeInTheDocument()
    expect(screen.getByText("Test error")).toBeInTheDocument()
  })

  it("should render custom fallback when provided", () => {
    render(
      <ErrorBoundary fallback={<div data-testid="fallback">Custom Error</div>}>
        <ThrowError error={new Error("Test error")} />
      </ErrorBoundary>
    )

    expect(screen.getByTestId("fallback")).toBeInTheDocument()
  })

  it("should have Go Home button that uses history API", () => {
    const pushStateSpy = vi.spyOn(window.history, "pushState")

    render(
      <ErrorBoundary>
        <ThrowError error={new Error("Test error")} />
      </ErrorBoundary>
    )

    const goHomeButton = screen.getByText("Go Home")
    expect(goHomeButton).toBeInTheDocument()

    fireEvent.click(goHomeButton)

    // Should use history.pushState for SPA-friendly navigation
    expect(pushStateSpy).toHaveBeenCalledWith(null, "", "/")

    pushStateSpy.mockRestore()
  })

  it("should have Reload Page button", () => {
    render(
      <ErrorBoundary>
        <ThrowError error={new Error("Test error")} />
      </ErrorBoundary>
    )

    const reloadButton = screen.getByText("Reload Page")
    expect(reloadButton).toBeInTheDocument()
  })

  it("should log error via logger", async () => {
    const { logger } = await import("../../lib/logger")

    render(
      <ErrorBoundary>
        <ThrowError error={new Error("Logged error")} />
      </ErrorBoundary>
    )

    expect(logger.error).toHaveBeenCalledWith(
      "ErrorBoundary caught an error",
      expect.objectContaining({
        error: expect.any(Error),
      })
    )
  })
})
