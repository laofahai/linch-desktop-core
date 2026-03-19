import { useState, useEffect, useCallback } from "react"

interface UseNotificationReturn {
  /** Send a notification to the user */
  notify: (title: string, body?: string, icon?: string) => Promise<void>
  /** Whether notification permission has been granted */
  isPermissionGranted: boolean
  /** Request notification permission from the user */
  requestPermission: () => Promise<boolean>
}

/**
 * Hook that provides notification capabilities using Tauri's notification plugin.
 *
 * In non-Tauri environments, the hook returns safe no-op functions and
 * `isPermissionGranted` as false.
 *
 * Permission state is checked on mount. Use `requestPermission` to prompt the user
 * and `notify` to send notifications.
 *
 * @returns Object with notify function, permission state, and requestPermission function
 *
 * @example
 * ```tsx
 * const { notify, isPermissionGranted, requestPermission } = useNotification();
 *
 * const handleNotify = async () => {
 *   if (!isPermissionGranted) {
 *     const granted = await requestPermission();
 *     if (!granted) return;
 *   }
 *   await notify('Download Complete', 'Your file has been saved.');
 * };
 * ```
 */
export function useNotification(): UseNotificationReturn {
  const [isPermissionGranted, setIsPermissionGranted] = useState(false)

  // Check permission state on mount
  useEffect(() => {
    if (typeof window === "undefined" || !(window as Record<string, unknown>).__TAURI__) {
      return
    }

    let cancelled = false

    const checkPermission = async () => {
      try {
        const { isPermissionGranted: checkGranted } =
          await import("@tauri-apps/plugin-notification")

        if (cancelled) return

        const granted = await checkGranted()
        if (!cancelled) {
          setIsPermissionGranted(granted)
        }
      } catch (error) {
        console.warn("[useNotification] Failed to check permission:", error)
      }
    }

    checkPermission()

    return () => {
      cancelled = true
    }
  }, [])

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined" || !(window as Record<string, unknown>).__TAURI__) {
      return false
    }

    try {
      const { requestPermission: tauriRequestPermission } =
        await import("@tauri-apps/plugin-notification")

      const permission = await tauriRequestPermission()
      const granted = permission === "granted"
      setIsPermissionGranted(granted)
      return granted
    } catch (error) {
      console.warn("[useNotification] Failed to request permission:", error)
      return false
    }
  }, [])

  const notify = useCallback(async (title: string, body?: string, icon?: string): Promise<void> => {
    if (typeof window === "undefined" || !(window as Record<string, unknown>).__TAURI__) {
      return
    }

    try {
      const { sendNotification } = await import("@tauri-apps/plugin-notification")

      sendNotification({
        title,
        ...(body !== undefined && { body }),
        ...(icon !== undefined && { icon }),
      })
    } catch (error) {
      console.warn("[useNotification] Failed to send notification:", error)
    }
  }, [])

  return {
    notify,
    isPermissionGranted,
    requestPermission,
  }
}
