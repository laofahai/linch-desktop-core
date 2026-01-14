// ============================================================================
// @linch-tech/desktop-core
// Production-ready Tauri v2 + React 19 desktop application core
// ============================================================================

// Types
export type {
  LinchDesktopConfig,
  BrandConfig,
  NavItem,
  FeaturesConfig,
  ThemeConfig,
  ThemeColors,
  LayoutConfig,
  SlotsConfig,
  ComponentOverrides,
  ShellProps,
  TitleBarProps,
  NavItemComponentProps,
  I18nConfig,
  DatabaseConfig,
  SentryConfig,
} from "./types"

// Provider
export { LinchDesktopProvider } from "./providers/LinchDesktopProvider"
export type { LinchDesktopProviderProps } from "./providers/LinchDesktopProvider"

// Config Context
export { ConfigProvider, useConfig, defaultConfig } from "./context/config"

// Components - Base
export { Shell } from "./components/base/Shell"
export { TitleBar } from "./components/base/TitleBar"

// Components - UI (shadcn)
export { Button, buttonVariants } from "./components/ui/button"
export { Badge, badgeVariants } from "./components/ui/badge"
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "./components/ui/card"
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "./components/ui/dialog"
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from "./components/ui/dropdown-menu"
export { Input } from "./components/ui/input"
export { Label } from "./components/ui/label"
export { Progress } from "./components/ui/progress"
export { ScrollArea, ScrollBar } from "./components/ui/scroll-area"
export { Separator } from "./components/ui/separator"
export { Switch } from "./components/ui/switch"
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs"
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./components/ui/tooltip"

// Components - Shared
export { Logo } from "./components/shared/Logo"
export { PageHeader } from "./components/shared/PageHeader"
export { ThemeSwitcher } from "./components/shared/ThemeSwitcher"
export { LanguageSwitcher } from "./components/shared/LanguageSwitcher"
export { WindowControls } from "./components/shared/WindowControls"

// Components - Pages
export { SettingsPage } from "./components/pages/SettingsPage"
export type { SettingsPageProps } from "./components/pages/SettingsPage"

// Components - Providers
export { DatabaseProvider, useDatabase } from "./components/providers/DatabaseProvider"
export { ErrorBoundary } from "./components/providers/ErrorBoundary"

// Hooks
export { useDatabaseInit, useSetting, useAppState } from "./hooks/use-database"
export { useTheme } from "./hooks/use-theme"
export { useUpdater } from "./hooks/use-updater"
export { useLocalStorage } from "./hooks/use-local-storage"
export { useAsync, useFetch } from "./hooks/use-async"
export type { AsyncState, UseAsyncReturn } from "./hooks/use-async"
export {
  useDebounce,
  useDebouncedCallback,
  useThrottle,
  useThrottledCallback,
} from "./hooks/use-debounce"
export {
  useClickOutside,
  useClickOutsideMultiple,
  useEscapeKey,
  useClickOutsideOrEscape,
} from "./hooks/use-click-outside"

// Lib - Database
export {
  initDatabase,
  getDatabase,
  closeDatabase,
  baseMigrations,
  getSetting,
  setSetting,
  deleteSetting,
  getAllSettings,
  getAppState,
  setAppState,
  deleteAppState,
  query,
  execute,
  transaction,
} from "./lib/database"
export type { Migration, QueryResult, DatabaseInitOptions } from "./lib/database"

// Lib - API
export { createApiClient, ApiException, api, defineEndpoint } from "./lib/api"
export type { ApiConfig, ApiError } from "./lib/api"

// Lib - Updater
export {
  checkForUpdate,
  downloadAndInstall,
  relaunchApp,
  checkAndPromptUpdate,
  getCurrentUpdate,
  clearUpdate,
} from "./lib/updater"
export type { UpdateInfo, UpdateProgress, UpdateStatus } from "./lib/updater"

// Lib - Logger
export { logger } from "./lib/logger"
export type { LogLevel, LogEntry, LogHandler } from "./lib/logger"

// Lib - Sentry
export { initSentry, captureError, setUser, addBreadcrumb, Sentry } from "./lib/sentry"
export type { SentryInitOptions } from "./lib/sentry"

// Lib - Utils
export { cn } from "./lib/utils"

// Lib - Tauri helpers
export {
  appWindow,
  minimizeWindow,
  toggleMaximize,
  isMaximized,
  closeWindow,
  startDragging,
} from "./lib/tauri"

// i18n
export {
  initI18n,
  mergeI18nResources,
  addI18nResources,
  changeLanguage,
  getCurrentLanguage,
  baseResources,
} from "./i18n/config"
export { default as i18n } from "./i18n/config"

// Version Check
export { CORE_VERSION, checkCoreUpdate, logUpdateNotice } from "./lib/version-check"
