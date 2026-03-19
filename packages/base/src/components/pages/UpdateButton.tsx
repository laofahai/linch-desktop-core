import { useTranslation } from "react-i18next"
import { RefreshCw, Download, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "../ui/button"
import type { UpdateStatus, UpdateInfo, UpdateProgress } from "../../lib/updater"

export interface UpdateButtonProps {
  status: UpdateStatus
  updateInfo: UpdateInfo | null
  progress: UpdateProgress | null
  error: Error | null
  onCheck: () => void
  onDownload: () => void
  onInstall: () => void
  enabled: boolean
}

export function UpdateButton({
  status,
  updateInfo,
  progress,
  error,
  onCheck,
  onDownload,
  onInstall,
  enabled,
}: UpdateButtonProps) {
  const { t } = useTranslation()

  if (!enabled) {
    return (
      <Button disabled className="w-56">
        {t("settings.about.updater_disabled")}
      </Button>
    )
  }

  switch (status) {
    case "checking":
      return (
        <Button disabled className="w-56">
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          {t("settings.about.checking")}
        </Button>
      )

    case "available":
      return (
        <div className="space-y-2 text-center">
          <div className="text-sm text-primary font-medium">
            {t("settings.about.new_version")}: {updateInfo?.version}
          </div>
          <Button onClick={onDownload} className="w-56">
            <Download className="mr-2 h-4 w-4" />
            {t("settings.about.download_update")}
          </Button>
        </div>
      )

    case "downloading":
      return (
        <div className="space-y-2 w-56">
          <Button disabled className="w-full">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            {progress?.percent || 0}%
          </Button>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress?.percent || 0}%` }}
            />
          </div>
        </div>
      )

    case "ready":
      return (
        <div className="space-y-2 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            {t("settings.about.ready_to_install")}
          </div>
          <Button onClick={onInstall} className="w-56">
            {t("settings.about.restart_now")}
          </Button>
        </div>
      )

    case "up-to-date":
      return (
        <div className="space-y-2 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            {t("settings.about.up_to_date")}
          </div>
          <Button variant="outline" onClick={onCheck} className="w-56">
            {t("settings.about.check_updates")}
          </Button>
        </div>
      )

    case "check-error":
    case "download-error":
      return (
        <div className="space-y-2 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error?.message || t("settings.about.check_error")}
          </div>
          <Button
            variant="outline"
            onClick={status === "check-error" ? onCheck : onDownload}
            className="w-56"
          >
            {t("settings.about.retry")}
          </Button>
        </div>
      )

    default:
      return (
        <Button onClick={onCheck} className="w-56">
          {t("settings.about.check_updates")}
        </Button>
      )
  }
}
