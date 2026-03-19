import { useEffect, useRef, RefObject } from "react"

/**
 * Hook that listens for Tauri file drop events on a target element.
 *
 * In non-Tauri environments, the hook is a no-op but still returns a valid ref.
 * The event listener is automatically cleaned up on unmount.
 *
 * @param handler - Callback that receives an array of dropped file paths
 * @param enabled - Whether the drop listener is active (default: true)
 * @returns ref to attach to the drop target element
 *
 * @example
 * ```tsx
 * const dropRef = useFileDrop((paths) => {
 *   console.log('Dropped files:', paths);
 *   handleFiles(paths);
 * });
 *
 * return (
 *   <div ref={dropRef} className="drop-zone">
 *     Drop files here
 *   </div>
 * );
 * ```
 */
export function useFileDrop<T extends HTMLElement = HTMLElement>(
  handler: (paths: string[]) => void,
  enabled = true
): RefObject<T | null> {
  const ref = useRef<T>(null)
  const handlerRef = useRef(handler)

  // Update handler ref when handler changes
  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    if (!enabled) return

    // Check for Tauri environment
    if (typeof window === "undefined" || !(window as Record<string, unknown>).__TAURI__) {
      return
    }

    let unlistenFn: (() => void) | null = null
    let cancelled = false

    const setup = async () => {
      try {
        const { listen } = await import("@tauri-apps/api/event")

        if (cancelled) return

        const unlisten = await listen<{ paths: string[] }>("tauri://drag-drop", (event) => {
          if (event.payload?.paths) {
            handlerRef.current(event.payload.paths)
          }
        })

        unlistenFn = unlisten
      } catch (error) {
        console.warn("[useFileDrop] Failed to set up file drop listener:", error)
      }
    }

    setup()

    return () => {
      cancelled = true
      if (unlistenFn) {
        unlistenFn()
      }
    }
  }, [enabled])

  return ref
}
