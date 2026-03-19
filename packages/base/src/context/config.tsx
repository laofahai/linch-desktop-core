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
function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...target }
  for (const key of Object.keys(source)) {
    const sourceValue = source[key]
    const targetValue = target[key]
    if (
      sourceValue &&
      typeof sourceValue === "object" &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === "object" &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>
      )
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue
    }
  }
  return result
}

// Merge configs deeply
function mergeConfig(
  base: LinchDesktopConfig,
  override: Partial<LinchDesktopConfig>
): LinchDesktopConfig {
  return deepMerge(
    base as unknown as Record<string, unknown>,
    override as unknown as Record<string, unknown>
  ) as unknown as LinchDesktopConfig
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
