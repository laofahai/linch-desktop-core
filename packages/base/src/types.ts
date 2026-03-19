import type { ReactNode, ComponentType } from "react"
import type { LucideIcon } from "lucide-react"
import type { Migration } from "./lib/database"

// ============================================================================
// Navigation Adapter
// ============================================================================

export interface NavigationAdapter {
  Link: ComponentType<{
    to: string
    className?: string | ((props: { isActive: boolean }) => string)
    children: ReactNode | ((props: { isActive: boolean }) => ReactNode)
  }>
  useNavigate: () => (path: string) => void
}

// ============================================================================
// Core Config Types
// ============================================================================

export interface LinchDesktopConfig {
  /**
   * Brand configuration
   */
  brand: BrandConfig

  /**
   * Navigation items
   */
  nav: NavItem[]

  /**
   * Feature toggles
   */
  features?: FeaturesConfig

  /**
   * Theme customization
   */
  theme?: ThemeConfig

  /**
   * Layout configuration
   */
  layout?: LayoutConfig

  /**
   * Slot injection
   */
  slots?: SlotsConfig

  /**
   * Component overrides
   */
  components?: ComponentOverrides

  /**
   * i18n configuration
   */
  i18n?: I18nConfig

  /**
   * Database configuration
   */
  database?: DatabaseConfig

  /**
   * Sentry configuration
   */
  sentry?: SentryConfig

  /**
   * Navigation adapter (default: react-router-dom)
   * Allows swapping out the routing library while keeping react-router as fallback
   */
  navigation?: NavigationAdapter
}

// ============================================================================
// Brand Config
// ============================================================================

export interface BrandConfig {
  /**
   * Application name (or i18n key)
   */
  name: string

  /**
   * Logo component (priority over logoUrl)
   */
  logo?: ComponentType<{ className?: string }>

  /**
   * Logo image URL (fallback when logo component is not provided)
   */
  logoUrl?: string

  /**
   * Version string to display
   */
  version?: string
}

// ============================================================================
// Navigation
// ============================================================================

export interface NavItem {
  /**
   * Title (can be i18n key or plain text)
   */
  title: string

  /**
   * Route path
   */
  path: string

  /**
   * Icon component
   */
  icon: LucideIcon | ComponentType<{ className?: string }>

  /**
   * Badge content (optional)
   */
  badge?: string | number
}

// ============================================================================
// Features Config
// ============================================================================

export interface FeaturesConfig {
  /**
   * Enable auto-updater (default: true)
   */
  updater?: boolean

  /**
   * Enable database (default: true)
   */
  database?: boolean

  /**
   * Enable Sentry error reporting (default: false)
   */
  sentry?: boolean
}

// ============================================================================
// Theme Config
// ============================================================================

export interface ThemeConfig {
  /**
   * Color overrides
   */
  colors?: Partial<ThemeColors>

  /**
   * Border radius preset
   */
  radius?: "none" | "sm" | "md" | "lg" | "full"

  /**
   * Font family overrides
   */
  font?: {
    sans?: string
    mono?: string
  }

  /**
   * Custom CSS variables
   */
  cssVariables?: Record<string, string>
}

export interface ThemeColors {
  primary: string
  secondary: string
  background: string
  foreground: string
  muted: string
  mutedForeground: string
  border: string
  ring: string
  accent: string
  accentForeground: string
  destructive: string
  destructiveForeground: string
}

// ============================================================================
// Layout Config
// ============================================================================

export interface LayoutConfig {
  /**
   * Sidebar configuration
   */
  sidebar?: {
    width?: number
    position?: "left" | "right"
  }

  /**
   * Title bar configuration
   */
  titleBar?: {
    height?: number
    showWindowControls?: boolean
    draggable?: boolean
  }
}

// ============================================================================
// Slots Config
// ============================================================================

export interface SlotsConfig {
  /**
   * Title bar slots
   */
  titleBar?: {
    left?: ReactNode
    center?: ReactNode
    right?: ReactNode
  }

  /**
   * Sidebar slots
   */
  sidebar?: {
    header?: ReactNode
    footer?: ReactNode
    beforeNav?: ReactNode
    afterNav?: ReactNode
  }

  /**
   * Shell slots
   */
  shell?: {
    beforeContent?: ReactNode
    afterContent?: ReactNode
  }
}

// ============================================================================
// Component Overrides
// ============================================================================

export interface ComponentOverrides {
  /**
   * Override Shell component
   */
  Shell?: ComponentType<ShellProps>

  /**
   * Override TitleBar component
   */
  TitleBar?: ComponentType<TitleBarProps>

  /**
   * Override NavItem component
   */
  NavItem?: ComponentType<NavItemComponentProps>
}

// ============================================================================
// Component Props (for overrides)
// ============================================================================

export interface ShellProps {
  children?: ReactNode
  className?: string
  /**
   * If true, don't render Outlet (useful when you want to render children directly)
   */
  noOutlet?: boolean
}

export interface TitleBarProps {
  className?: string
}

export interface NavItemComponentProps {
  item: NavItem
  isActive: boolean
  onClick?: () => void
}

// ============================================================================
// i18n Config
// ============================================================================

export interface I18nConfig {
  /**
   * Default language
   */
  defaultLanguage?: string

  /**
   * Supported languages
   */
  supportedLanguages?: string[]

  /**
   * Language display labels (e.g., { en: 'English', zh: '中文', ja: '日本語' })
   * Used by LanguageSwitcher. Falls back to language code if not provided.
   */
  languageLabels?: Record<string, string>

  /**
   * Additional translation resources (will be merged with base)
   */
  resources?: Record<string, Record<string, unknown>>
}

// ============================================================================
// Database Config
// ============================================================================

export interface DatabaseConfig {
  /**
   * Database name (default: 'app.db')
   */
  name?: string

  /**
   * Additional migrations (will run after base migrations)
   */
  migrations?: Migration[]
}

// ============================================================================
// Sentry Config
// ============================================================================

export interface SentryConfig {
  /**
   * Sentry DSN
   */
  dsn?: string

  /**
   * Traces sample rate (0-1)
   */
  tracesSampleRate?: number
}
