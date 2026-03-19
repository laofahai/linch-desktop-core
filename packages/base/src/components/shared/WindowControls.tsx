import { useState, useEffect, useRef, useCallback } from "react"
import { Minus, Square, X, Maximize2 } from "lucide-react"
import { Button } from "../ui/button"
import * as tauri from "../../lib/tauri"
import { logger } from "../../lib/logger"

export function WindowControls() {
  const [isMaximized, setIsMaximized] = useState(false)
  const resizeTimerRef = useRef<ReturnType<typeof setTimeout>>(null)

  const checkMaximized = useCallback(async () => {
    try {
      if (window.__TAURI__) {
        const maximized = await tauri.isMaximized()
        setIsMaximized(maximized)
      }
    } catch (e) {
      logger.error("Failed to check maximized state", { error: e })
    }
  }, [])

  useEffect(() => {
    checkMaximized()

    const handleResize = () => {
      if (resizeTimerRef.current) {
        clearTimeout(resizeTimerRef.current)
      }
      resizeTimerRef.current = setTimeout(checkMaximized, 100)
    }
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (resizeTimerRef.current) {
        clearTimeout(resizeTimerRef.current)
      }
    }
  }, [checkMaximized])

  const handleMinimize = async () => {
    try {
      await tauri.minimizeWindow()
    } catch (e) {
      logger.error("Failed to minimize window", { error: e })
    }
  }

  const handleToggleMaximize = async () => {
    try {
      await tauri.toggleMaximize()
      const maximized = await tauri.isMaximized()
      setIsMaximized(maximized)
    } catch (e) {
      logger.error("Failed to toggle maximize", { error: e })
    }
  }

  const handleClose = async () => {
    try {
      await tauri.closeWindow()
    } catch (e) {
      logger.error("Failed to close window", { error: e })
    }
  }

  return (
    <div className="flex items-center">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-none hover:bg-muted group"
        onClick={handleMinimize}
      >
        <Minus className="h-3 w-3 text-muted-foreground/60 group-hover:text-foreground transition-colors" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-none hover:bg-muted group"
        onClick={handleToggleMaximize}
      >
        {isMaximized ? (
          <Square className="h-2.5 w-2.5 text-muted-foreground/60 group-hover:text-foreground transition-colors" />
        ) : (
          <Maximize2 className="h-2.5 w-2.5 text-muted-foreground/60 group-hover:text-foreground transition-colors" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-none hover:bg-destructive/10 hover:text-destructive group"
        onClick={handleClose}
      >
        <X className="h-3 w-3 text-muted-foreground/60 group-hover:text-destructive transition-colors" />
      </Button>
    </div>
  )
}
