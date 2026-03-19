import type { WebviewWindow } from "@tauri-apps/api/webviewWindow"
import type { UnlistenFn } from "@tauri-apps/api/event"

/**
 * Options for creating a new window.
 */
export interface WindowOptions {
  url?: string
  title?: string
  width?: number
  height?: number
  x?: number
  y?: number
  resizable?: boolean
  decorations?: boolean
  center?: boolean
}

function isTauri(): boolean {
  return typeof window !== "undefined" && !!(window as Record<string, unknown>).__TAURI__
}

/**
 * Create a new webview window with the given label and options.
 *
 * @param label - Unique identifier for the window
 * @param options - Window configuration options
 * @returns The created WebviewWindow instance
 *
 * @example
 * ```ts
 * const win = await createWindow('settings', {
 *   url: '/settings',
 *   title: 'Settings',
 *   width: 800,
 *   height: 600,
 *   center: true,
 * });
 * ```
 */
export async function createWindow(
  label: string,
  options: WindowOptions = {}
): Promise<WebviewWindow> {
  if (!isTauri()) {
    throw new Error("[window-manager] createWindow is only available in Tauri environment")
  }

  const { WebviewWindow } = await import("@tauri-apps/api/webviewWindow")

  const win = new WebviewWindow(label, {
    url: options.url,
    title: options.title,
    width: options.width,
    height: options.height,
    x: options.x,
    y: options.y,
    resizable: options.resizable,
    decorations: options.decorations,
    center: options.center,
  })

  return win
}

/**
 * Get an existing window by its label.
 *
 * @param label - The window label to look up
 * @returns The WebviewWindow instance, or null if not found or not in Tauri
 */
export async function getWindow(label: string): Promise<WebviewWindow | null> {
  if (!isTauri()) {
    return null
  }

  try {
    const { WebviewWindow } = await import("@tauri-apps/api/webviewWindow")
    return WebviewWindow.getByLabel(label) ?? null
  } catch (error) {
    console.warn(`[window-manager] Failed to get window "${label}":`, error)
    return null
  }
}

/**
 * Get all currently open webview windows.
 *
 * @returns An array of all WebviewWindow instances, or an empty array if not in Tauri
 */
export async function getAllWindows(): Promise<WebviewWindow[]> {
  if (!isTauri()) {
    return []
  }

  try {
    const { WebviewWindow } = await import("@tauri-apps/api/webviewWindow")
    return WebviewWindow.getAll()
  } catch (error) {
    console.warn("[window-manager] Failed to get all windows:", error)
    return []
  }
}

/**
 * Close a specific window by its label.
 *
 * @param label - The label of the window to close
 */
export async function closeWindowByLabel(label: string): Promise<void> {
  if (!isTauri()) {
    console.warn("[window-manager] closeWindowByLabel is only available in Tauri environment")
    return
  }

  try {
    const win = await getWindow(label)
    if (win) {
      await win.close()
    } else {
      console.warn(`[window-manager] Window with label "${label}" not found`)
    }
  } catch (error) {
    console.warn(`[window-manager] Failed to close window "${label}":`, error)
  }
}

/**
 * Send an event with a payload to a specific window.
 *
 * @param label - The target window label
 * @param event - The event name
 * @param payload - The data to send
 */
export async function sendToWindow(label: string, event: string, payload: unknown): Promise<void> {
  if (!isTauri()) {
    console.warn("[window-manager] sendToWindow is only available in Tauri environment")
    return
  }

  try {
    const win = await getWindow(label)
    if (win) {
      await win.emit(event, payload)
    } else {
      console.warn(
        `[window-manager] Window with label "${label}" not found, cannot send event "${event}"`
      )
    }
  } catch (error) {
    console.warn(`[window-manager] Failed to send event "${event}" to window "${label}":`, error)
  }
}

/**
 * Listen for events from other windows.
 *
 * @param event - The event name to listen for
 * @param handler - Callback invoked when the event is received
 * @returns A function to stop listening
 */
export async function onWindowEvent(
  event: string,
  handler: (payload: unknown) => void
): Promise<UnlistenFn> {
  if (!isTauri()) {
    // Return a no-op unlisten function in non-Tauri environments
    return () => {}
  }

  try {
    const { listen } = await import("@tauri-apps/api/event")
    return await listen(event, (e) => {
      handler(e.payload)
    })
  } catch (error) {
    console.warn(`[window-manager] Failed to listen for event "${event}":`, error)
    return () => {}
  }
}
