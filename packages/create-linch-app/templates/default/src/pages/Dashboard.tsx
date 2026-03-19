import { useTranslation } from "react-i18next"
import { PageHeader, ScrollArea } from "@linch-tech/desktop-core"

export function Dashboard() {
  const { t } = useTranslation()

  return (
    <ScrollArea className="flex-1">
      <div className="p-6">
        <PageHeader title={t("app.welcome")} description={t("app.description")} />

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border p-4">
            <h3 className="font-medium">{t("dashboard.quickStart")}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t("dashboard.quickStartDesc")}</p>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="font-medium">{t("dashboard.addPages")}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t("dashboard.addPagesDesc")}</p>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="font-medium">{t("dashboard.docs")}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t("dashboard.docsDesc")}</p>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
