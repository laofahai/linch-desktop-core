import { describe, it, expect, vi } from "vitest"
import { renderHook, act } from "@testing-library/react"
import {
  useClickOutside,
  useClickOutsideMultiple,
  useEscapeKey,
  useClickOutsideOrEscape,
} from "./use-click-outside"

describe("useClickOutside", () => {
  it("should return a ref", () => {
    const handler = vi.fn()
    const { result } = renderHook(() => useClickOutside(handler))

    expect(result.current).toBeDefined()
    expect(result.current.current).toBeNull()
  })

  it("should call handler on outside click", () => {
    const handler = vi.fn()
    const { result } = renderHook(() => useClickOutside(handler))

    // Create and attach a DOM element
    const element = document.createElement("div")
    document.body.appendChild(element)
    Object.defineProperty(result.current, "current", { value: element, writable: true })

    // Click outside the element
    const outsideEvent = new MouseEvent("mousedown", { bubbles: true })
    act(() => {
      document.dispatchEvent(outsideEvent)
    })

    expect(handler).toHaveBeenCalledTimes(1)

    document.body.removeChild(element)
  })

  it("should not call handler on inside click", () => {
    const handler = vi.fn()
    const { result } = renderHook(() => useClickOutside(handler))

    const element = document.createElement("div")
    const child = document.createElement("span")
    element.appendChild(child)
    document.body.appendChild(element)
    Object.defineProperty(result.current, "current", { value: element, writable: true })

    // Click inside the element (on child)
    const insideEvent = new MouseEvent("mousedown", { bubbles: true })
    Object.defineProperty(insideEvent, "target", { value: child })
    act(() => {
      element.dispatchEvent(insideEvent)
    })

    expect(handler).not.toHaveBeenCalled()

    document.body.removeChild(element)
  })

  it("should not call handler when disabled", () => {
    const handler = vi.fn()
    renderHook(() => useClickOutside(handler, false))

    act(() => {
      document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }))
    })

    expect(handler).not.toHaveBeenCalled()
  })

  it("should remove listeners on unmount", () => {
    const handler = vi.fn()
    const { unmount } = renderHook(() => useClickOutside(handler))

    unmount()

    act(() => {
      document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }))
    })

    expect(handler).not.toHaveBeenCalled()
  })
})

describe("useClickOutsideMultiple", () => {
  it("should return refs and addRef function", () => {
    const handler = vi.fn()
    const { result } = renderHook(() => useClickOutsideMultiple(handler))

    expect(result.current.refs).toBeDefined()
    expect(typeof result.current.addRef).toBe("function")
  })

  it("should add elements via addRef", () => {
    const handler = vi.fn()
    const { result } = renderHook(() => useClickOutsideMultiple(handler))

    const el1 = document.createElement("div")
    const el2 = document.createElement("div")

    act(() => {
      result.current.addRef(el1)
      result.current.addRef(el2)
    })

    expect(result.current.refs.current).toContain(el1)
    expect(result.current.refs.current).toContain(el2)
  })

  it("should not add null elements", () => {
    const handler = vi.fn()
    const { result } = renderHook(() => useClickOutsideMultiple(handler))

    act(() => {
      result.current.addRef(null)
    })

    expect(result.current.refs.current).toHaveLength(0)
  })

  it("should not add duplicate elements", () => {
    const handler = vi.fn()
    const { result } = renderHook(() => useClickOutsideMultiple(handler))

    const el = document.createElement("div")

    act(() => {
      result.current.addRef(el)
      result.current.addRef(el)
    })

    expect(result.current.refs.current).toHaveLength(1)
  })
})

describe("useEscapeKey", () => {
  it("should call handler on Escape key", () => {
    const handler = vi.fn()
    renderHook(() => useEscapeKey(handler))

    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))
    })

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it("should not call handler on other keys", () => {
    const handler = vi.fn()
    renderHook(() => useEscapeKey(handler))

    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }))
    })

    expect(handler).not.toHaveBeenCalled()
  })

  it("should not call handler when disabled", () => {
    const handler = vi.fn()
    renderHook(() => useEscapeKey(handler, false))

    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))
    })

    expect(handler).not.toHaveBeenCalled()
  })

  it("should remove listener on unmount", () => {
    const handler = vi.fn()
    const { unmount } = renderHook(() => useEscapeKey(handler))

    unmount()

    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))
    })

    expect(handler).not.toHaveBeenCalled()
  })
})

describe("useClickOutsideOrEscape", () => {
  it("should return a ref", () => {
    const handler = vi.fn()
    const { result } = renderHook(() => useClickOutsideOrEscape(handler))

    expect(result.current).toBeDefined()
  })

  it("should call handler on Escape key", () => {
    const handler = vi.fn()
    renderHook(() => useClickOutsideOrEscape(handler))

    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))
    })

    expect(handler).toHaveBeenCalledTimes(1)
  })
})
