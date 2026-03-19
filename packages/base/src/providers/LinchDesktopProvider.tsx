import { type ReactNode, useEffect, useLayoutEffect } from "react"
import { ConfigProvider } from "../context/config"
import { DatabaseProvider } from "../components/providers/DatabaseProvider"
import { ErrorBoundary } from "../components/providers/ErrorBoundary"
import { initSentry } from "../lib/sentry"
import { initI18n } from "../i18n/config"
import { baseMigrations } from "../lib/database"
import { logUpdateNotice } from "../lib/version-check"
import type { LinchDesktopConfig, ThemeColors } from "../types"

export interface LinchDesktopProviderProps {
  /**
   * Application configuration
   */
  config: Partial<LinchDesktopConfig>

  /**
   * Children to render
   */
  children: ReactNode
}

/**
 * Main provider for Linch Desktop Core.
 * Wraps your app with all necessary providers:
 * - Config context
 * - Error boundary
 * - Database (optional)
 * - Sentry (optional)
 * - i18n
 */
export function LinchDesktopProvider({ config, children }: LinchDesktopProviderProps) {
  const features = config.features ?? {}
  const sentryConfig = config.sentry
  const i18nConfig = config.i18n
  const dbConfig = config.database
  const themeConfig = config.theme

  // Add app-specific i18n resources (i18n is already initialized at module load)
  useLayoutEffect(() => {
    try {
      initI18n(i18nConfig?.defaultLanguage, i18nConfig?.resources, i18nConfig?.supportedLanguages)
    } catch (err) {
      console.error("[LinchDesktop] Failed to initialize i18n:", err)
    }
  }, [i18nConfig?.defaultLanguage, i18nConfig?.resources, i18nConfig?.supportedLanguages])

  // Apply theme configuration (CSS variables, radius, fonts)
  useLayoutEffect(() => {
    if (!themeConfig) return

    const root = document.documentElement
    const colorVarMap: Record<keyof ThemeColors, string> = {
      primary: "--primary",
      secondary: "--secondary",
      background: "--background",
      foreground: "--foreground",
      muted: "--muted",
      mutedForeground: "--muted-foreground",
      border: "--border",
      ring: "--ring",
      accent: "--accent",
      accentForeground: "--accent-foreground",
      destructive: "--destructive",
      destructiveForeground: "--destructive-foreground",
    }
    const radiusMap: Record<NonNullable<typeof themeConfig.radius>, string> = {
      none: "0",
      sm: "0.25rem",
      md: "0.5rem",
      lg: "0.75rem",
      full: "9999px",
    }

    if (themeConfig.colors) {
      for (const [key, value] of Object.entries(themeConfig.colors)) {
        if (!value) continue
        const cssVar = colorVarMap[key as keyof ThemeColors]
        if (cssVar) {
          root.style.setProperty(cssVar, value)
        }
      }
    }

    if (themeConfig.radius) {
      root.style.setProperty("--radius", radiusMap[themeConfig.radius])
    }

    if (themeConfig.font?.sans) {
      root.style.setProperty("--font-sans", themeConfig.font.sans)
      root.style.fontFamily = themeConfig.font.sans
    }

    if (themeConfig.font?.mono) {
      root.style.setProperty("--font-mono", themeConfig.font.mono)
    }

    if (themeConfig.cssVariables) {
      for (const [key, value] of Object.entries(themeConfig.cssVariables)) {
        const cssVar = key.startsWith("--") ? key : `--${key}`
        root.style.setProperty(cssVar, value)
      }
    }
  }, [themeConfig])

  // Initialize Sentry if enabled
  useEffect(() => {
    if (features.sentry !== false && sentryConfig?.dsn) {
      try {
        initSentry({
          dsn: sentryConfig.dsn,
          tracesSampleRate: sentryConfig.tracesSampleRate,
        })
      } catch (err) {
        console.error("[LinchDesktop] Failed to initialize Sentry:", err)
      }
    }
  }, [features.sentry, sentryConfig])

  // Check for core updates in dev mode
  useEffect(() => {
    logUpdateNotice()
  }, [])

  // Merge base migrations with app migrations
  const allMigrations = [...baseMigrations, ...(dbConfig?.migrations ?? [])]

  // Build the provider tree
  let content = children

  // Wrap with DatabaseProvider if enabled
  if (features.database !== false) {
    content = (
      <DatabaseProvider dbName={dbConfig?.name} migrations={allMigrations}>
        {content}
      </DatabaseProvider>
    )
  }

  return (
    <ConfigProvider config={config}>
      <ErrorBoundary>{content}</ErrorBoundary>
    </ConfigProvider>
  )
}
