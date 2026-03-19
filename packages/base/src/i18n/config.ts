import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"

/**
 * Base translations provided by the core
 * These include common UI strings for settings, theme, etc.
 */
export const baseResources = {
  en: {
    translation: {
      common: {
        save: "Save",
        cancel: "Cancel",
        language: "Language",
        theme: "Theme",
        user: "User",
        menu: {
          account: "My Account",
          profile: "Profile",
          billing: "Billing",
          logout: "Log out",
        },
      },
      settings: {
        title: "Settings",
        description: "Manage your application preferences.",
        tabs: {
          general: "General",
          about: "About",
        },
        general: "General",
        appearance: "Appearance",
        language_select: "Language",
        theme_select: "Theme",
        theme_light: "Light",
        theme_dark: "Dark",
        theme_system: "System",
        about: {
          check_updates: "Check for Updates",
          checking: "Checking...",
          up_to_date: "You're up to date",
          current_version: "Current Version",
          new_version: "New version available",
          download_update: "Download Update",
          ready_to_install: "Ready to install",
          restart_now: "Restart Now",
          check_error: "Update check failed",
          download_error: "Download failed",
          retry: "Retry",
          updater_disabled: "Updater is disabled",
          footer_line1: "Built with Linch Desktop Core.",
          footer_line2: "Powered by Tauri v2 & React 19.",
        },
      },
    },
  },
  zh: {
    translation: {
      common: {
        save: "保存",
        cancel: "取消",
        language: "语言",
        theme: "主题",
        user: "用户",
        menu: {
          account: "我的账户",
          profile: "个人资料",
          billing: "账单",
          logout: "退出登录",
        },
      },
      settings: {
        title: "设置",
        description: "管理您的应用偏好。",
        tabs: {
          general: "常规",
          about: "关于",
        },
        general: "常规",
        appearance: "外观",
        language_select: "语言",
        theme_select: "主题",
        theme_light: "浅色",
        theme_dark: "深色",
        theme_system: "跟随系统",
        about: {
          check_updates: "检查更新",
          checking: "检查中...",
          up_to_date: "当前已是最新版本",
          current_version: "当前版本",
          new_version: "发现新版本",
          download_update: "下载更新",
          ready_to_install: "已准备好安装",
          restart_now: "立即重启",
          check_error: "检查更新失败",
          download_error: "下载失败",
          retry: "重试",
          updater_disabled: "更新已禁用",
          footer_line1: "基于 Linch Desktop Core 构建。",
          footer_line2: "由 Tauri v2 与 React 19 驱动。",
        },
      },
    },
  },
}

/**
 * Deep merge two objects
 */
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
    } else {
      ;(result as Record<string, unknown>)[key] = sourceValue
    }
  }

  return result
}

/**
 * Merge application i18n resources with base resources
 */
export function mergeI18nResources(
  appResources: Record<string, Record<string, unknown>>
): Record<string, { translation: Record<string, unknown> }> {
  const merged: Record<string, { translation: Record<string, unknown> }> = {}

  // Start with base resources
  for (const [lang, content] of Object.entries(baseResources)) {
    merged[lang] = { translation: { ...content.translation } }
  }

  // Merge app resources
  for (const [lang, content] of Object.entries(appResources)) {
    if (merged[lang]) {
      merged[lang].translation = deepMerge(
        merged[lang].translation,
        content as Record<string, unknown>
      )
    } else {
      merged[lang] = { translation: content as Record<string, unknown> }
    }
  }

  return merged
}

// Initialize i18n at module load time with base resources
// This ensures i18n is ready before any React component renders
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: baseResources,
    lng: "zh",
    fallbackLng: "en",
    interpolation: {
      escapeValue: true,
    },
    // Synchronous initialization
    initImmediate: false,
  })

/**
 * Configure i18n with app-specific resources and settings
 * Call this to add your app's translations
 */
export function initI18n(
  defaultLanguage?: string,
  appResources?: Record<string, Record<string, unknown>>,
  supportedLanguages?: string[]
): typeof i18n {
  // Add app resources if provided
  if (appResources) {
    for (const [lang, content] of Object.entries(appResources)) {
      i18n.addResourceBundle(lang, "translation", content, true, true)
    }
  }

  if (supportedLanguages && supportedLanguages.length > 0) {
    i18n.options.supportedLngs = supportedLanguages
  }

  // Change language if specified
  if (defaultLanguage && defaultLanguage !== i18n.language) {
    i18n.changeLanguage(defaultLanguage)
  }

  return i18n
}

/**
 * Add resources to i18n after initialization
 */
export function addI18nResources(lang: string, resources: Record<string, unknown>): void {
  i18n.addResourceBundle(lang, "translation", resources, true, true)
}

/**
 * Change language
 */
export function changeLanguage(lang: string): Promise<void> {
  return i18n.changeLanguage(lang).then(() => undefined)
}

/**
 * Get current language
 */
export function getCurrentLanguage(): string {
  return i18n.language
}

export default i18n
