import {
  Outlet,
  NavLink as RouterNavLink,
  useNavigate as useRouterNavigate,
} from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Settings, User } from "lucide-react"
import { useConfig } from "../../context/config"
import { cn } from "../../lib/utils"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { TitleBar } from "./TitleBar"
import type { ShellProps, NavItem } from "../../types"

/**
 * Main application shell with sidebar navigation
 */
export function Shell({ children, className, noOutlet }: ShellProps) {
  const { t } = useTranslation()
  const config = useConfig()

  const NavLink = config.navigation?.Link ?? RouterNavLink
  const useNavigate = config.navigation?.useNavigate ?? useRouterNavigate
  const navigate = useNavigate()

  const { nav, layout, slots, components } = config

  const sidebarWidth = layout?.sidebar?.width ?? 180
  const sidebarPosition = layout?.sidebar?.position ?? "left"
  const isRightSidebar = sidebarPosition === "right"

  const ShellComponent = components?.Shell
  if (ShellComponent && ShellComponent !== Shell) {
    return (
      <ShellComponent className={className} noOutlet={noOutlet}>
        {children}
      </ShellComponent>
    )
  }

  // Use custom TitleBar if provided
  const TitleBarComponent = components?.TitleBar ?? TitleBar

  // Use custom NavItem renderer if provided
  const NavItemComponent = components?.NavItem

  const renderNavItem = (item: NavItem, isActive: boolean) => {
    if (NavItemComponent) {
      return (
        <NavItemComponent item={item} isActive={isActive} onClick={() => navigate(item.path)} />
      )
    }

    return (
      <>
        <item.icon className="h-4 w-4" />
        <span className="flex-1 truncate">{t(item.title)}</span>
        {item.badge && (
          <Badge variant="secondary" className="px-1.5 py-0 text-[10px] h-5 min-w-5 justify-center">
            {item.badge}
          </Badge>
        )}
      </>
    )
  }

  return (
    <div
      className={cn(
        "flex h-screen w-screen flex-col overflow-hidden bg-background border border-border",
        className
      )}
    >
      <TitleBarComponent />

      <div className={cn("flex flex-1 overflow-hidden", isRightSidebar && "flex-row-reverse")}>
        {/* Sidebar */}
        <aside
          className={cn(
            "flex flex-col bg-muted/5 transition-all duration-300 ease-in-out",
            isRightSidebar ? "border-l" : "border-r"
          )}
          style={{ width: sidebarWidth }}
        >
          {/* Sidebar Header Slot */}
          {slots?.sidebar?.header && <div className="border-b p-2">{slots.sidebar.header}</div>}

          <div className="flex-1 py-2 overflow-y-auto overflow-x-hidden no-scrollbar">
            {/* Before Nav Slot */}
            {slots?.sidebar?.beforeNav && (
              <div className="px-2 mb-2">{slots.sidebar.beforeNav}</div>
            )}

            {/* Navigation */}
            <nav className="flex flex-col gap-1 px-2">
              {nav.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }: { isActive: boolean }) =>
                    cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all",
                      isActive
                        ? "bg-primary/5 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )
                  }
                >
                  {({ isActive }: { isActive: boolean }) => renderNavItem(item, isActive)}
                </NavLink>
              ))}
            </nav>

            {/* After Nav Slot */}
            {slots?.sidebar?.afterNav && <div className="px-2 mt-2">{slots.sidebar.afterNav}</div>}
          </div>

          {/* Footer Area: User & Settings */}
          <div className="border-t p-2">
            {slots?.sidebar?.footer ? (
              slots.sidebar.footer
            ) : (
              <DefaultSidebarFooter navigate={navigate} t={t} />
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex flex-1 flex-col overflow-hidden bg-background relative">
          {/* Before Content Slot */}
          {slots?.shell?.beforeContent}

          {/* Content */}
          {noOutlet ? children : <Outlet />}
          {!noOutlet && children}

          {/* After Content Slot */}
          {slots?.shell?.afterContent}
        </main>
      </div>
    </div>
  )
}

/**
 * Default sidebar footer with user menu and settings button
 */
function DefaultSidebarFooter({
  navigate,
  t,
}: {
  navigate: (path: string) => void
  t: (key: string) => string
}) {
  return (
    <div className="flex items-center gap-1">
      {/* User Profile Trigger */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex-1 h-9 px-2 justify-start gap-2 overflow-hidden hover:bg-muted group"
          >
            <div className="h-5 w-5 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center shrink-0 text-white shadow-sm ring-1 ring-white/20">
              <User className="h-3 w-3" />
            </div>
            <span className="truncate text-xs font-medium opacity-80 group-hover:opacity-100">
              {t("common.user")}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48" side="right" sideOffset={10}>
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            {t("common.menu.account")}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>{t("common.menu.profile")}</DropdownMenuItem>
          <DropdownMenuItem>{t("common.menu.billing")}</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>{t("common.menu.logout")}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Settings Button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
        onClick={() => navigate("/settings")}
        title={t("settings.title")}
      >
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  )
}
