import { Component, ErrorInfo, ReactNode } from "react"
import { Button } from "../ui/button"
import { AlertTriangle, RotateCcw, Home } from "lucide-react"
import { logger } from "../../lib/logger"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error("ErrorBoundary caught an error", {
      error,
      componentStack: errorInfo?.componentStack,
    })
  }

  handleReload = (): void => {
    this.setState({ hasError: false, error: null }, () => {
      window.location.reload()
    })
  }

  handleGoHome = (): void => {
    this.setState({ hasError: false, error: null }, () => {
      // Use history API for SPA-friendly navigation, fallback to location
      try {
        window.history.pushState(null, "", "/")
        window.dispatchEvent(new PopStateEvent("popstate"))
      } catch {
        window.location.href = "/"
      }
    })
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="text-center space-y-6 p-8 max-w-md">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-destructive/10">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-foreground">Something went wrong</h1>
              <p className="text-sm text-muted-foreground">
                An unexpected error occurred. Please try reloading the page.
              </p>
            </div>

            {this.state.error && (
              <div className="p-4 bg-muted rounded-lg text-left">
                <p className="text-xs font-mono text-muted-foreground break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" onClick={this.handleGoHome}>
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
              <Button onClick={this.handleReload}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
