import { Inbox, Calculator } from "lucide-react"
import type { LinchDesktopConfig } from "@linch-tech/desktop-core"
import { PlaygroundLogo } from "./components/PlaygroundLogo"

export const config: Partial<LinchDesktopConfig> = {
  brand: {
    name: "app.name",
    version: `v${__APP_VERSION__}`,
    logo: PlaygroundLogo,
  },

  nav: [
    { title: "app.dashboard", path: "/", icon: Inbox },
    { title: "app.demo", path: "/demo", icon: Calculator },
  ],

  features: {
    updater: true,
    database: true,
    sentry: false,
  },

  layout: {
    sidebar: {
      width: 180,
    },
  },

  i18n: {
    defaultLanguage: "zh",
    supportedLanguages: ["zh", "en"],
    resources: {
      en: {
        app: {
          name: "Playground",
          dashboard: "Dashboard",
          demo: "Demo",
        },
      },
      zh: {
        app: {
          name: "Playground",
          dashboard: "仪表盘",
          demo: "演示",
        },
      },
    },
  },
}
