/**
 * Simple structured logging utility
 * In production, logs are minimized and can be sent to external services.
 * Supports file-based logging via Tauri's filesystem plugin.
 */

type LogLevel = "debug" | "info" | "warn" | "error"

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, unknown>
}

type LogHandler = (entry: LogEntry) => void

interface FileLogHandlerOptions {
  /** Maximum log file size in bytes before rotation. Default: 5MB */
  maxFileSize?: number
  /** Maximum number of rotated log files to keep. Default: 3 */
  maxFiles?: number
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const DEFAULT_MAX_FILES = 3
const FLUSH_INTERVAL_MS = 1000

/**
 * Formats a LogEntry into a single-line string for file output.
 * Format: [ISO_DATE] [LEVEL] message {metadata_json}
 */
export function formatLogEntry(entry: LogEntry): string {
  const meta = entry.context ? ` ${JSON.stringify(entry.context)}` : ""
  return `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}${meta}`
}

/**
 * File-based log handler that writes to {appDataDir}/logs/app.log
 * using Tauri's filesystem plugin. Buffers writes and flushes periodically.
 * Gracefully no-ops in non-Tauri environments.
 */
class FileLogHandler {
  private buffer: string[] = []
  private flushTimer: ReturnType<typeof setInterval> | null = null
  private initialized = false
  private initializing = false
  private available = false
  private logDir = ""
  private logFilePath = ""
  private maxFileSize: number
  private maxFiles: number

  // Dynamic imports stored after initialization
  private fsModule: typeof import("@tauri-apps/plugin-fs") | null = null

  /** Promise that resolves when initialization is complete. Useful for testing. */
  readonly ready: Promise<void>

  constructor(options?: FileLogHandlerOptions) {
    this.maxFileSize = options?.maxFileSize ?? DEFAULT_MAX_FILE_SIZE
    this.maxFiles = options?.maxFiles ?? DEFAULT_MAX_FILES
    this.ready = this.init()
  }

  private async init(): Promise<void> {
    if (this.initialized || this.initializing) return
    this.initializing = true

    try {
      const [pathModule, fsModule] = await Promise.all([
        import("@tauri-apps/api/path"),
        import("@tauri-apps/plugin-fs"),
      ])

      this.fsModule = fsModule

      const appDataDir = await pathModule.appDataDir()
      this.logDir = `${appDataDir}logs`
      this.logFilePath = `${this.logDir}/app.log`

      // Ensure logs directory exists
      const dirExists = await fsModule.exists(this.logDir)
      if (!dirExists) {
        await fsModule.mkdir(this.logDir, { recursive: true })
      }

      this.available = true
      this.initialized = true
      this.initializing = false

      // Start periodic flush
      this.flushTimer = setInterval(() => {
        this.flush()
      }, FLUSH_INTERVAL_MS)

      // Flush any entries that were buffered during init
      if (this.buffer.length > 0) {
        this.flush()
      }
    } catch {
      // Not in a Tauri environment or plugin not available - silently degrade
      this.initialized = true
      this.initializing = false
      this.available = false
    }
  }

  /** The LogHandler function to register with the Logger */
  readonly handler: LogHandler = (entry: LogEntry) => {
    const line = formatLogEntry(entry)
    this.buffer.push(line)
  }

  /**
   * Flush the buffered log entries to disk.
   * Returns a promise that resolves when the write completes.
   */
  async flush(): Promise<void> {
    if (!this.available || !this.fsModule || this.buffer.length === 0) return

    const lines = this.buffer.splice(0, this.buffer.length)
    const content = lines.join("\n") + "\n"

    try {
      // Check if rotation is needed before writing
      await this.rotateIfNeeded()

      // Append to the log file
      const fileExists = await this.fsModule.exists(this.logFilePath)
      if (fileExists) {
        const existing = await this.fsModule.readTextFile(this.logFilePath)
        await this.fsModule.writeTextFile(this.logFilePath, existing + content)
      } else {
        await this.fsModule.writeTextFile(this.logFilePath, content)
      }
    } catch {
      // If writing fails, put lines back at the front of the buffer
      this.buffer.unshift(...lines)
    }
  }

  private async rotateIfNeeded(): Promise<void> {
    if (!this.fsModule) return

    try {
      const fileExists = await this.fsModule.exists(this.logFilePath)
      if (!fileExists) return

      const content = await this.fsModule.readTextFile(this.logFilePath)
      const size = new TextEncoder().encode(content).length

      if (size < this.maxFileSize) return

      // Rotate: app.log.2 -> app.log.3, app.log.1 -> app.log.2, app.log -> app.log.1
      // Remove the oldest if it exceeds maxFiles
      for (let i = this.maxFiles; i >= 1; i--) {
        const src = i === 1 ? this.logFilePath : `${this.logFilePath}.${i - 1}`
        const dst = `${this.logFilePath}.${i}`

        const srcExists = await this.fsModule.exists(src)
        if (srcExists) {
          if (i === this.maxFiles) {
            // Remove the oldest rotated file
            await this.fsModule.remove(dst).catch(() => {})
          }
          const srcContent = await this.fsModule.readTextFile(src)
          await this.fsModule.writeTextFile(dst, srcContent)
          if (i === 1) {
            // Truncate the main log file
            await this.fsModule.writeTextFile(this.logFilePath, "")
          }
        }
      }
    } catch {
      // Rotation failure is non-fatal
    }
  }

  /** Stop the periodic flush timer and perform a final flush. */
  async destroy(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = null
    }
    await this.flush()
  }
}

class Logger {
  private minLevel: LogLevel
  private handlers: LogHandler[] = []

  constructor(level?: LogLevel) {
    // Use provided level or default based on environment
    this.minLevel = level ?? (import.meta.env.PROD ? "warn" : "debug")

    // Default console handler
    this.addHandler(this.consoleHandler.bind(this))
  }

  private consoleHandler(entry: LogEntry): void {
    const { level, message, timestamp, context } = entry
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`

    switch (level) {
      case "debug":
        console.debug(prefix, message, context ?? "")
        break
      case "info":
        console.info(prefix, message, context ?? "")
        break
      case "warn":
        console.warn(prefix, message, context ?? "")
        break
      case "error":
        console.error(prefix, message, context ?? "")
        break
    }
  }

  addHandler(handler: LogHandler): void {
    this.handlers.push(handler)
  }

  removeHandler(handler: LogHandler): void {
    const index = this.handlers.indexOf(handler)
    if (index > -1) {
      this.handlers.splice(index, 1)
    }
  }

  setMinLevel(level: LogLevel): void {
    this.minLevel = level
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.minLevel]
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(level)) return

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    }

    this.handlers.forEach((handler) => {
      try {
        handler(entry)
      } catch (e) {
        console.error("Log handler error:", e)
      }
    })
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log("debug", message, context)
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log("info", message, context)
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log("warn", message, context)
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.log("error", message, context)
  }
}

// Singleton logger instance
export const logger = new Logger()

// File handler instance (created lazily via addFileHandler)
let fileHandler: FileLogHandler | null = null

/**
 * Creates and registers a FileLogHandler on the singleton logger.
 * In non-Tauri environments this is a safe no-op (the handler detects and degrades).
 * Calling multiple times is idempotent -- returns the existing handler.
 */
export function addFileHandler(options?: FileLogHandlerOptions): FileLogHandler {
  if (fileHandler) return fileHandler
  fileHandler = new FileLogHandler(options)
  logger.addHandler(fileHandler.handler)
  return fileHandler
}

/**
 * Flush all buffered file log entries to disk immediately.
 * Resolves when the write is complete. No-op if no file handler is active.
 */
export async function flushLogs(): Promise<void> {
  if (fileHandler) {
    await fileHandler.flush()
  }
}

// Convenience exports
export const { debug, info, warn, error } = {
  debug: logger.debug.bind(logger),
  info: logger.info.bind(logger),
  warn: logger.warn.bind(logger),
  error: logger.error.bind(logger),
}

export { FileLogHandler }
export type { LogLevel, LogEntry, LogHandler, FileLogHandlerOptions }
