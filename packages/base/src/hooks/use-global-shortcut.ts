import { useEffect, useRef } from "react"

/**
 * Hook that registers a global keyboard shortcut using Tauri's global-shortcut plugin.
 *
 * In non-Tauri environments, the hook is a no-op.
 * The shortcut is automatically unregistered on unmount or when `enabled` becomes false.
 *
 * @param shortcut - Shortcut string (e.g. "CmdOrCtrl+Shift+S", "Alt+Q")
 * @param handler - Callback to execute when the shortcut is triggered
 * @param enabled - Whether the shortcut is active (default: true)
 *
 * @example
 * ```tsx
 * useGlobalShortcut('CmdOrCtrl+Shift+S', () => {
 *   console.log('Save shortcut triggered');
 * });
 *
 * // Conditionally enabled
 * useGlobalShortcut('CmdOrCtrl+K', () => openSearch(), isSearchEnabled);
 * ```
 */
export function useGlobalShortcut(shortcut: string, handler: () => void, enabled = true): void {
  const handlerRef = useRef(handler)

  // Update handler ref when handler changes
  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    if (!enabled) return

    // Check for Tauri environment
    if (typeof window === "undefined" || !window.__TAURI__) {
      return
    }

    let unregisterFn: (() => Promise<void>) | null = null
    let cancelled = false

    const setup = async () => {
      try {
        const { register, unregister } = await import("@tauri-apps/plugin-global-shortcut")

        if (cancelled) return

        await register(shortcut, () => {
          handlerRef.current()
        })

        unregisterFn = async () => {
          await unregister(shortcut)
        }
      } catch (error) {
        console.warn(`[useGlobalShortcut] Failed to register shortcut "${shortcut}":`, error)
      }
    }

    setup()

    return () => {
      cancelled = true
      if (unregisterFn) {
        unregisterFn().catch((error) => {
          console.warn(`[useGlobalShortcut] Failed to unregister shortcut "${shortcut}":`, error)
        })
      }
    }
  }, [shortcut, enabled])
}
