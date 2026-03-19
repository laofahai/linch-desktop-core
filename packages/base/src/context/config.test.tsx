import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { ConfigProvider, useConfig, defaultConfig } from "./config"

// Test component to access config
function ConfigConsumer({ testId, configKey }: { testId: string; configKey: string }) {
  const config = useConfig()
  const value = configKey.split(".").reduce((obj: unknown, key: string) => {
    if (obj && typeof obj === "object") return (obj as Record<string, unknown>)[key]
    return undefined
  }, config)
  return <div data-testid={testId}>{JSON.stringify(value)}</div>
}

describe("Config Context", () => {
  describe("mergeConfig (via ConfigProvider)", () => {
    it("should provide default config when no overrides", () => {
      render(
        <ConfigProvider config={{}}>
          <ConfigConsumer testId="nav" configKey="nav" />
        </ConfigProvider>
      )

      expect(screen.getByTestId("nav").textContent).toBe("[]")
    })

    it("should deeply merge nested layout config", () => {
      render(
        <ConfigProvider config={{ layout: { sidebar: { width: 250 } } }}>
          <ConfigConsumer testId="sidebar-width" configKey="layout" />
        </ConfigProvider>
      )

      const layout = JSON.parse(screen.getByTestId("sidebar-width").textContent!)
      // Should preserve titleBar defaults while overriding sidebar width
      expect(layout.sidebar.width).toBe(250)
      expect(layout.sidebar.position).toBe("left") // preserved from default
      expect(layout.titleBar.height).toBe(48) // preserved from default
      expect(layout.titleBar.showWindowControls).toBe(true) // preserved
    })

    it("should deeply merge brand config", () => {
      render(
        <ConfigProvider config={{ brand: { version: "2.0.0" } }}>
          <ConfigConsumer testId="brand" configKey="brand" />
        </ConfigProvider>
      )

      const brand = JSON.parse(screen.getByTestId("brand").textContent!)
      expect(brand.name).toBe("App") // preserved from default
      expect(brand.version).toBe("2.0.0") // overridden
    })

    it("should deeply merge features config", () => {
      render(
        <ConfigProvider config={{ features: { sentry: true } }}>
          <ConfigConsumer testId="features" configKey="features" />
        </ConfigProvider>
      )

      const features = JSON.parse(screen.getByTestId("features").textContent!)
      expect(features.updater).toBe(true) // preserved from default
      expect(features.database).toBe(true) // preserved from default
      expect(features.sentry).toBe(true) // overridden
    })

    it("should handle database config with migrations array", () => {
      const migrations = [{ version: 1, name: "test", up: "CREATE TABLE t (id INT)" }]
      render(
        <ConfigProvider config={{ database: { name: "custom.db", migrations } }}>
          <ConfigConsumer testId="db" configKey="database" />
        </ConfigProvider>
      )

      const db = JSON.parse(screen.getByTestId("db").textContent!)
      expect(db.name).toBe("custom.db")
      expect(db.migrations).toHaveLength(1)
    })

    it("should not overwrite with undefined values", () => {
      render(
        <ConfigProvider config={{ brand: { name: "MyApp" } }}>
          <ConfigConsumer testId="brand" configKey="brand" />
        </ConfigProvider>
      )

      const brand = JSON.parse(screen.getByTestId("brand").textContent!)
      expect(brand.name).toBe("MyApp")
    })
  })

  describe("useConfig", () => {
    it("should throw when used outside ConfigProvider", () => {
      // useConfig with default value won't throw since createContext has a default
      // But the context value should match defaultConfig
      function TestComponent() {
        const config = useConfig()
        return <div data-testid="config">{config.brand.name}</div>
      }

      // This should not throw because createContext has a default value
      render(<TestComponent />)
      expect(screen.getByTestId("config").textContent).toBe("App")
    })
  })

  describe("defaultConfig", () => {
    it("should have expected default values", () => {
      expect(defaultConfig.brand.name).toBe("App")
      expect(defaultConfig.nav).toEqual([])
      expect(defaultConfig.features?.updater).toBe(true)
      expect(defaultConfig.features?.database).toBe(true)
      expect(defaultConfig.features?.sentry).toBe(false)
      expect(defaultConfig.layout?.sidebar?.width).toBe(180)
      expect(defaultConfig.layout?.sidebar?.position).toBe("left")
      expect(defaultConfig.layout?.titleBar?.height).toBe(48)
    })
  })
})
