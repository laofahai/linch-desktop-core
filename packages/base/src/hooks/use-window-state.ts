import { useState, useEffect, useCallback, useRef } from "react"

interface WindowPosition {
  x: number
  y: number
}

interface WindowSize {
  width: number
  height: number
}

interface UseWindowStateReturn {
  /** Current window position */
  position: WindowPosition | null
  /** Current window size */
  size: WindowSize | null
  /** Whether the window is maximized */
  isMaximized: boolean
  /** Manually save the current window state to localStorage */
  saveState: () => Promise<void>
  /** Manually restore the saved window state from localStorage */
  restoreState: () => Promise<void>
}

const STORAGE_KEY = "linch-window-state"
const DEBOUNCE_MS = 500

interface StoredWindowState {
  position: WindowPosition
  size: WindowSize
  isMaximized: boolean
}

/**
 * Hook that persists and restores window position, size, and maximized state.
 *
 * State is saved to localStorage (debounced) whenever the window is resized or moved,
 * and restored automatically on mount.
 *
 * In non-Tauri environments, the hook returns null/default values and no-op functions.
 *
 * @param storageKey - Custom localStorage key (default: "linch-window-state")
 * @returns Object with position, size, isMaximized, saveState, and restoreState
 *
 * @example
 * ```tsx
 * const { position, size, isMaximized, saveState, restoreState } = useWindowState();
 *
 * return (
 *   <div>
 *     Window: {size?.width}x{size?.height} at ({position?.x}, {position?.y})
 *     {isMaximized && ' (maximized)'}
 *   </div>
 * );
 * ```
 */
export function useWindowState(storageKey: string = STORAGE_KEY): UseWindowStateReturn {
  const [position, setPosition] = useState<WindowPosition | null>(null)
  const [size, setSize] = useState<WindowSize | null>(null)
  const [isMaximized, setIsMaximized] = useState(false)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isTauri = useCallback(() => {
    return typeof window !== "undefined" && !!(window as Record<string, unknown>).__TAURI__
  }, [])

  const readStoredState = useCallback((): StoredWindowState | null => {
    try {
      const stored = window.localStorage.getItem(storageKey)
      return stored ? (JSON.parse(stored) as StoredWindowState) : null
    } catch {
      return null
    }
  }, [storageKey])

  const writeStoredState = useCallback(
    (state: StoredWindowState) => {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(state))
      } catch (error) {
        console.warn("[useWindowState] Failed to save window state:", error)
      }
    },
    [storageKey]
  )

  const saveState = useCallback(async (): Promise<void> => {
    if (!isTauri()) return

    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window")
      const currentWindow = getCurrentWindow()

      const [pos, sz, maximized] = await Promise.all([
        currentWindow.outerPosition(),
        currentWindow.outerSize(),
        currentWindow.isMaximized(),
      ])

      const state: StoredWindowState = {
        position: { x: pos.x, y: pos.y },
        size: { width: sz.width, height: sz.height },
        isMaximized: maximized,
      }

      writeStoredState(state)
      setPosition(state.position)
      setSize(state.size)
      setIsMaximized(state.isMaximized)
    } catch (error) {
      console.warn("[useWindowState] Failed to save window state:", error)
    }
  }, [isTauri, writeStoredState])

  const restoreState = useCallback(async (): Promise<void> => {
    if (!isTauri()) return

    const stored = readStoredState()
    if (!stored) return

    try {
      const { getCurrentWindow, LogicalPosition, LogicalSize } =
        await import("@tauri-apps/api/window")
      const currentWindow = getCurrentWindow()

      if (stored.isMaximized) {
        await currentWindow.maximize()
      } else {
        await currentWindow.setPosition(new LogicalPosition(stored.position.x, stored.position.y))
        await currentWindow.setSize(new LogicalSize(stored.size.width, stored.size.height))
      }

      setPosition(stored.position)
      setSize(stored.size)
      setIsMaximized(stored.isMaximized)
    } catch (error) {
      console.warn("[useWindowState] Failed to restore window state:", error)
    }
  }, [isTauri, readStoredState])

  // Debounced save helper
  const debouncedSave = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      saveState()
    }, DEBOUNCE_MS)
  }, [saveState])

  // Restore on mount and listen for resize/move events
  useEffect(() => {
    if (!isTauri()) return

    let unlistenMove: (() => void) | null = null
    let unlistenResize: (() => void) | null = null
    let cancelled = false

    const setup = async () => {
      try {
        // Restore saved state on mount
        await restoreState()

        const { getCurrentWindow } = await import("@tauri-apps/api/window")
        const currentWindow = getCurrentWindow()

        if (cancelled) return

        // Listen for window move events
        unlistenMove = await currentWindow.onMoved(() => {
          debouncedSave()
        })

        // Listen for window resize events
        unlistenResize = await currentWindow.onResized(() => {
          debouncedSave()
        })
      } catch (error) {
        console.warn("[useWindowState] Failed to set up window state listeners:", error)
      }
    }

    setup()

    return () => {
      cancelled = true
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      if (unlistenMove) unlistenMove()
      if (unlistenResize) unlistenResize()
    }
  }, [isTauri, restoreState, debouncedSave])

  return {
    position,
    size,
    isMaximized,
    saveState,
    restoreState,
  }
}
