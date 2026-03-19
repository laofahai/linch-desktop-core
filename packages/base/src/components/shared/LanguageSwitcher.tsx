import { useTranslation } from "react-i18next"
import { Languages } from "lucide-react"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { cn } from "../../lib/utils"
import { useConfig } from "../../context/config"

interface LanguageSwitcherProps {
  variant?: "icon" | "full"
  size?: "sm" | "default"
  className?: string
}

const defaultLanguageLabels: Record<string, string> = {
  en: "English",
  zh: "中文",
}

export function LanguageSwitcher({
  variant = "icon",
  size = "default",
  className,
}: LanguageSwitcherProps) {
  const { i18n } = useTranslation()
  const config = useConfig()

  const configLabels = config.i18n?.languageLabels
  const languageLabels = { ...defaultLanguageLabels, ...configLabels }

  const supportedLanguages = config.i18n?.supportedLanguages
  const languageCodes =
    supportedLanguages && supportedLanguages.length > 0
      ? supportedLanguages
      : Object.keys(languageLabels)
  const languageOptions = Array.from(new Set(languageCodes)).map((code) => ({
    code,
    label: languageLabels[code] ?? code,
  }))

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  const currentLanguage = languageOptions.find((l) => i18n.language.startsWith(l.code))

  if (variant === "full") {
    return (
      <div className={cn("flex gap-2", className)}>
        {languageOptions.map((lang) => (
          <Button
            key={lang.code}
            variant={i18n.language.startsWith(lang.code) ? "default" : "outline"}
            size={size}
            onClick={() => changeLanguage(lang.code)}
          >
            {lang.label}
          </Button>
        ))}
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 rounded-none hover:bg-muted focus-visible:ring-0 group",
            className
          )}
        >
          <Languages className="h-3 w-3 text-muted-foreground/60 group-hover:text-foreground transition-colors" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languageOptions.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={cn(currentLanguage?.code === lang.code && "bg-accent")}
          >
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
