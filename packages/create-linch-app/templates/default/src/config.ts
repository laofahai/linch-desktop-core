import { Home, Settings } from "lucide-react"
import type { LinchDesktopConfig } from "@linch-tech/desktop-core"

export const config: Partial<LinchDesktopConfig> = {
  brand: {
    name: "app.name",
    version: `v${__APP_VERSION__}`,
  },

  nav: [
    { title: "app.home", path: "/", icon: Home },
    { title: "settings.title", path: "/settings", icon: Settings },
  ],

  features: {
    updater: true,
    database: true,
    sentry: false,
  },

  i18n: {
    defaultLanguage: "zh",
    supportedLanguages: ["zh", "en"],
    resources: {
      en: {
        app: {
          name: "{{displayName}}",
          home: "Home",
          welcome: "Welcome to {{displayName}}",
          description: "Start building your desktop application",
        },
        dashboard: {
          quickStart: "Quick Start",
          quickStartDesc: "Edit src/config.ts to customize your app configuration",
          addPages: "Add Pages",
          addPagesDesc: "Create new page components in the src/pages directory",
          docs: "Documentation",
          docsDesc: "Check out the Linch Desktop Core docs for more",
        },
      },
      zh: {
        app: {
          name: "{{displayName}}",
          home: "首页",
          welcome: "欢迎使用 {{displayName}}",
          description: "开始构建你的桌面应用",
        },
        dashboard: {
          quickStart: "快速开始",
          quickStartDesc: "编辑 src/config.ts 自定义你的应用配置",
          addPages: "添加页面",
          addPagesDesc: "在 src/pages 目录创建新页面组件",
          docs: "文档",
          docsDesc: "查看 Linch Desktop Core 文档了解更多",
        },
      },
    },
  },
}
