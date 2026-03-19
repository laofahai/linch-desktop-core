import { useEffect, useRef } from "react"

/**
 * Hook that listens for inter-window events via Tauri's event system.
 * Automatically cleans up the listener on unmount.
 *
 * In non-Tauri environments, the hook is a no-op.
 *
 * @param event - The event name to listen for
 * @param handler - Callback invoked with the event payload
 *
 * @example
 * ```tsx
 * useWindowEvent<{ message: string }>('chat:message', (payload) => {
 *   console.log('Received:', payload.message);
 * });
 * ```
 */
export function useWindowEvent<T = unknown>(event: string, handler: (payload: T) => void): void {
  const handlerRef = useRef(handler)

  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    if (typeof window === "undefined" || !window.__TAURI__) {
      return
    }

    let unlistenFn: (() => void) | null = null
    let cancelled = false

    const setup = async () => {
      try {
        const { listen } = await import("@tauri-apps/api/event")

        if (cancelled) return

        unlistenFn = await listen(event, (e) => {
          handlerRef.current(e.payload as T)
        })
      } catch (error) {
        console.warn(`[useWindowEvent] Failed to listen for event "${event}":`, error)
      }
    }

    setup()

    return () => {
      cancelled = true
      if (unlistenFn) {
        unlistenFn()
      }
    }
  }, [event])
}

/**
 * Hook that returns a broadcast function to emit events to all windows.
 *
 * In non-Tauri environments, the broadcast function is a no-op.
 *
 * @returns An object with a `broadcast` method
 *
 * @example
 * ```tsx
 * const { broadcast } = useBroadcast();
 *
 * const handleClick = async () => {
 *   await broadcast('theme:changed', { theme: 'dark' });
 * };
 * ```
 */
export function useBroadcast(): {
  broadcast: (event: string, payload: unknown) => Promise<void>
} {
  const broadcast = async (event: string, payload: unknown): Promise<void> => {
    if (typeof window === "undefined" || !window.__TAURI__) {
      return
    }

    try {
      const { emit } = await import("@tauri-apps/api/event")
      await emit(event, payload)
    } catch (error) {
      console.warn(`[useBroadcast] Failed to broadcast event "${event}":`, error)
    }
  }

  return { broadcast }
}
