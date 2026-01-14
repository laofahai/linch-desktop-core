import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useConfig } from "../../context/config"
import { cn } from "../../lib/utils"
import { LanguageSwitcher } from "../shared/LanguageSwitcher"
import { ThemeSwitcher } from "../shared/ThemeSwitcher"
import { WindowControls } from "../shared/WindowControls"
import { Logo } from "../shared/Logo"
import type { TitleBarProps } from "../../types"

/**
 * Application title bar with window controls
 */
export function TitleBar({ className }: TitleBarProps) {
  const { t } = useTranslation()
  const config = useConfig()
  const [isFocused, setIsFocused] = useState(true)

  const { brand, layout, slots } = config
  const titleBarConfig = layout?.titleBar

  useEffect(() => {
    const onFocus = () => setIsFocused(true)
    const onBlur = () => setIsFocused(false)
    window.addEventListener("focus", onFocus)
    window.addEventListener("blur", onBlur)

    return () => {
      window.removeEventListener("focus", onFocus)
      window.removeEventListener("blur", onBlur)
    }
  }, [])

  // Get logo element: priority is brand.logo > brand.logoUrl > default Logo
  const renderLogo = () => {
    if (brand.logo) {
      const LogoComponent = brand.logo
      return <LogoComponent className="h-4 w-4" />
    }
    if (brand.logoUrl) {
      return <img src={brand.logoUrl} alt={t(brand.name)} className="h-4 w-4 object-contain" />
    }
    return <Logo className="h-4 w-4" />
  }

  return (
    <header
      className={cn(
        "flex h-10 shrink-0 items-center justify-between border-b bg-background/80 backdrop-blur-md px-3 select-none transition-colors z-50",
        !isFocused && "opacity-80 bg-background/50",
        className
      )}
      style={{
        height: titleBarConfig?.height ?? 40,
      }}
      data-tauri-drag-region={titleBarConfig?.draggable !== false}
    >
      {/* Left Slot or Default: Logo & Title */}
      <div className="flex items-center gap-2 pointer-events-none">
        {slots?.titleBar?.left ?? (
          <>
            {renderLogo()}
            <span className="text-xs font-semibold text-foreground/90 tracking-tight">
              {t(brand.name)}
            </span>
          </>
        )}
      </div>

      {/* Center Slot */}
      {slots?.titleBar?.center && (
        <div className="flex-1 flex items-center justify-center pointer-events-auto">
          {slots.titleBar.center}
        </div>
      )}

      {/* Right Slot or Default: Controls */}
      <div className="flex items-center gap-0.5">
        {slots?.titleBar?.right ?? (
          <>
            <LanguageSwitcher />
            <ThemeSwitcher />
          </>
        )}

        {titleBarConfig?.showWindowControls !== false && (
          <>
            <div className="h-3 w-px bg-border/40 mx-1" />
            <WindowControls />
          </>
        )}
      </div>
    </header>
  )
}
