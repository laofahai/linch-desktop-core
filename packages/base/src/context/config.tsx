import { createContext, useContext, type ReactNode } from "react"
import type { LinchDesktopConfig } from "../types"

// Default config values
const defaultConfig: LinchDesktopConfig = {
  brand: {
    name: "App",
  },
  nav: [],
  features: {
    updater: true,
    database: true,
    sentry: false,
  },
  layout: {
    sidebar: {
      width: 180,
      position: "left",
    },
    titleBar: {
      height: 48,
      showWindowControls: true,
      draggable: true,
    },
  },
}

// Deep merge utility
function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Record<string, unknown>
): T {
  const result = { ...target } as T
  for (const key of Object.keys(source)) {
    const sourceValue = source[key]
    const targetValue = (target as Record<string, unknown>)[key]
    if (
      sourceValue &&
      typeof sourceValue === "object" &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === "object" &&
      !Array.isArray(targetValue)
    ) {
      ;(result as Record<string, unknown>)[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>
      )
    } else if (sourceValue !== undefined) {
      ;(result as Record<string, unknown>)[key] = sourceValue
    }
  }
  return result
}

// Merge configs deeply
function mergeConfig(
  base: LinchDesktopConfig,
  override: Partial<LinchDesktopConfig>
): LinchDesktopConfig {
  return deepMerge(base, override as Record<string, unknown>) as LinchDesktopConfig
}

// Context
const ConfigContext = createContext<LinchDesktopConfig>(defaultConfig)

// Provider
export interface ConfigProviderProps {
  config: Partial<LinchDesktopConfig>
  children: ReactNode
}

export function ConfigProvider({ config, children }: ConfigProviderProps) {
  const mergedConfig = mergeConfig(defaultConfig, config)

  return <ConfigContext.Provider value={mergedConfig}>{children}</ConfigContext.Provider>
}

// Hook
export function useConfig(): LinchDesktopConfig {
  const context = useContext(ConfigContext)
  if (!context) {
    throw new Error("useConfig must be used within a ConfigProvider")
  }
  return context
}

// Export default config for reference
export { defaultConfig }
