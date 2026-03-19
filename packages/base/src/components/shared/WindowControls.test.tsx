import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent, act } from "@testing-library/react"
import { WindowControls } from "./WindowControls"

// Mock tauri module
vi.mock("../../lib/tauri", () => ({
  isMaximized: vi.fn().mockResolvedValue(false),
  minimizeWindow: vi.fn().mockResolvedValue(undefined),
  toggleMaximize: vi.fn().mockResolvedValue(undefined),
  closeWindow: vi.fn().mockResolvedValue(undefined),
}))

// Mock logger
vi.mock("../../lib/logger", () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}))

describe("WindowControls", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("should render three control buttons", () => {
    render(<WindowControls />)

    const buttons = screen.getAllByRole("button")
    expect(buttons).toHaveLength(3)
  })

  it("should debounce resize events", async () => {
    const tauri = await import("../../lib/tauri")
    const isMaximizedMock = vi.mocked(tauri.isMaximized)
    isMaximizedMock.mockResolvedValue(false)

    render(<WindowControls />)

    // Clear the initial checkMaximized call
    await act(async () => {
      await vi.runAllTimersAsync()
    })
    isMaximizedMock.mockClear()

    // Fire multiple rapid resize events
    act(() => {
      for (let i = 0; i < 10; i++) {
        fireEvent(window, new Event("resize"))
      }
    })

    // Before debounce timer expires, should NOT have called checkMaximized
    expect(isMaximizedMock).not.toHaveBeenCalled()

    // After debounce timer (100ms)
    await act(async () => {
      vi.advanceTimersByTime(100)
      await vi.runAllTimersAsync()
    })

    // Should only have been called once due to debouncing
    expect(isMaximizedMock).toHaveBeenCalledTimes(1)
  })

  it("should call minimizeWindow on minimize button click", async () => {
    const tauri = await import("../../lib/tauri")

    render(<WindowControls />)

    const buttons = screen.getAllByRole("button")
    await act(async () => {
      fireEvent.click(buttons[0]) // First button is minimize
    })

    expect(tauri.minimizeWindow).toHaveBeenCalled()
  })

  it("should call toggleMaximize on maximize button click", async () => {
    const tauri = await import("../../lib/tauri")

    render(<WindowControls />)

    const buttons = screen.getAllByRole("button")
    await act(async () => {
      fireEvent.click(buttons[1]) // Second button is maximize
    })

    expect(tauri.toggleMaximize).toHaveBeenCalled()
  })

  it("should call closeWindow on close button click", async () => {
    const tauri = await import("../../lib/tauri")

    render(<WindowControls />)

    const buttons = screen.getAllByRole("button")
    await act(async () => {
      fireEvent.click(buttons[2]) // Third button is close
    })

    expect(tauri.closeWindow).toHaveBeenCalled()
  })

  it("should clean up resize listener on unmount", async () => {
    const removeSpy = vi.spyOn(window, "removeEventListener")

    const { unmount } = render(<WindowControls />)
    unmount()

    expect(removeSpy).toHaveBeenCalledWith("resize", expect.any(Function))
    removeSpy.mockRestore()
  })
})
