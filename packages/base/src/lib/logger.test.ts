import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { formatLogEntry } from "./logger"
import type { LogEntry, LogLevel } from "./logger"

// ---- Mock Tauri modules so dynamic imports inside FileLogHandler resolve ----

const mockExists = vi.fn<(path: string) => Promise<boolean>>().mockResolvedValue(false)
const mockMkdir = vi.fn().mockResolvedValue(undefined)
const mockReadTextFile = vi.fn<(path: string) => Promise<string>>().mockResolvedValue("")
const mockWriteTextFile = vi.fn().mockResolvedValue(undefined)
const mockRemove = vi.fn().mockResolvedValue(undefined)

vi.mock("@tauri-apps/plugin-fs", () => ({
  exists: (...args: unknown[]) => mockExists(...(args as [string])),
  mkdir: (...args: unknown[]) => mockMkdir(...args),
  readTextFile: (...args: unknown[]) => mockReadTextFile(...(args as [string])),
  writeTextFile: (...args: unknown[]) => mockWriteTextFile(...args),
  remove: (...args: unknown[]) => mockRemove(...args),
}))

vi.mock("@tauri-apps/api/path", () => ({
  appDataDir: vi.fn().mockResolvedValue("/mock/appData/"),
}))

// We need to reset module state between tests because `logger.ts` holds singletons.
// Use dynamic import after mocks are set up.
async function loadLogger() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod = (await import("./logger")) as any
  return mod
}

describe("Logger", () => {
  // --- formatLogEntry ---

  describe("formatLogEntry", () => {
    it("formats an entry without context", () => {
      const entry: LogEntry = {
        level: "info",
        message: "hello world",
        timestamp: "2026-01-01T00:00:00.000Z",
      }
      expect(formatLogEntry(entry)).toBe("[2026-01-01T00:00:00.000Z] [INFO] hello world")
    })

    it("formats an entry with context as JSON", () => {
      const entry: LogEntry = {
        level: "error",
        message: "something failed",
        timestamp: "2026-01-01T00:00:00.000Z",
        context: { code: 500, detail: "timeout" },
      }
      const result = formatLogEntry(entry)
      expect(result).toBe(
        '[2026-01-01T00:00:00.000Z] [ERROR] something failed {"code":500,"detail":"timeout"}'
      )
    })
  })

  // --- Console handler / log level filtering ---

  describe("console handler and log levels", () => {
    let debugSpy: ReturnType<typeof vi.spyOn>
    let infoSpy: ReturnType<typeof vi.spyOn>
    let warnSpy: ReturnType<typeof vi.spyOn>
    let errorSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {})
      infoSpy = vi.spyOn(console, "info").mockImplementation(() => {})
      warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
      errorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    })

    afterEach(() => {
      debugSpy.mockRestore()
      infoSpy.mockRestore()
      warnSpy.mockRestore()
      errorSpy.mockRestore()
    })

    it("routes debug messages to console.debug", async () => {
      const { logger } = await loadLogger()
      logger.setMinLevel("debug")
      logger.debug("test debug")
      expect(debugSpy).toHaveBeenCalled()
      expect(debugSpy.mock.calls[0]![1]).toBe("test debug")
    })

    it("routes info messages to console.info", async () => {
      const { logger } = await loadLogger()
      logger.setMinLevel("debug")
      logger.info("test info")
      expect(infoSpy).toHaveBeenCalled()
    })

    it("routes warn messages to console.warn", async () => {
      const { logger } = await loadLogger()
      logger.setMinLevel("debug")
      logger.warn("test warn")
      expect(warnSpy).toHaveBeenCalled()
    })

    it("routes error messages to console.error", async () => {
      const { logger } = await loadLogger()
      logger.setMinLevel("debug")
      logger.error("test error")
      expect(errorSpy).toHaveBeenCalled()
    })

    it("respects minimum log level", async () => {
      const { logger } = await loadLogger()
      logger.setMinLevel("warn")
      logger.debug("should not appear")
      logger.info("should not appear")
      logger.warn("should appear")
      logger.error("should appear")

      expect(debugSpy).not.toHaveBeenCalled()
      expect(infoSpy).not.toHaveBeenCalled()
      expect(warnSpy).toHaveBeenCalled()
      expect(errorSpy).toHaveBeenCalled()
    })
  })

  // --- Custom handler management ---

  describe("handler management", () => {
    let consoleSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      // Suppress console output during these tests
      consoleSpy = vi.spyOn(console, "info").mockImplementation(() => {})
      vi.spyOn(console, "debug").mockImplementation(() => {})
    })

    afterEach(() => {
      consoleSpy.mockRestore()
    })

    it("addHandler registers a custom handler", async () => {
      const { logger } = await loadLogger()
      logger.setMinLevel("debug")
      const customHandler = vi.fn()
      logger.addHandler(customHandler)
      logger.info("test")
      expect(customHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          level: "info",
          message: "test",
        })
      )
    })

    it("removeHandler unregisters a handler", async () => {
      const { logger } = await loadLogger()
      logger.setMinLevel("debug")
      const customHandler = vi.fn()
      logger.addHandler(customHandler)
      logger.removeHandler(customHandler)
      logger.info("test")
      expect(customHandler).not.toHaveBeenCalled()
    })

    it("catches errors thrown by handlers", async () => {
      const { logger } = await loadLogger()
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
      logger.setMinLevel("debug")
      const badHandler = vi.fn(() => {
        throw new Error("handler boom")
      })
      logger.addHandler(badHandler)
      // Should not throw
      logger.info("test")
      expect(errorSpy).toHaveBeenCalledWith("Log handler error:", expect.any(Error))
      errorSpy.mockRestore()
    })
  })

  // --- Convenience exports ---

  describe("convenience exports", () => {
    let infoSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      infoSpy = vi.spyOn(console, "info").mockImplementation(() => {})
      vi.spyOn(console, "debug").mockImplementation(() => {})
      vi.spyOn(console, "warn").mockImplementation(() => {})
      vi.spyOn(console, "error").mockImplementation(() => {})
    })

    afterEach(() => {
      infoSpy.mockRestore()
    })

    it("bound convenience functions work", async () => {
      const mod = await loadLogger()
      mod.logger.setMinLevel("debug")
      mod.info("from convenience")
      expect(infoSpy).toHaveBeenCalled()
    })
  })

  // --- FileLogHandler (with mocked fs) ---

  describe("FileLogHandler", () => {
    beforeEach(() => {
      vi.useFakeTimers()
      mockExists.mockReset().mockResolvedValue(false)
      mockMkdir.mockReset().mockResolvedValue(undefined)
      mockReadTextFile.mockReset().mockResolvedValue("")
      mockWriteTextFile.mockReset().mockResolvedValue(undefined)
      mockRemove.mockReset().mockResolvedValue(undefined)
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it("creates logs directory on init", async () => {
      const { FileLogHandler } = await loadLogger()
       
      const _handler = new FileLogHandler()
      // Allow the async init to settle
      await _handler.ready
      expect(mockMkdir).toHaveBeenCalledWith("/mock/appData/logs", { recursive: true })
    })

    it("buffers entries and writes on flush", async () => {
      const { FileLogHandler } = await loadLogger()
      const handler = new FileLogHandler()
      await handler.ready

      // Simulate a log entry via the handler function
      handler.handler({
        level: "info" as LogLevel,
        message: "buffered message",
        timestamp: "2026-01-01T00:00:00.000Z",
      })

      // Flush writes to file
      await handler.flush()
      expect(mockWriteTextFile).toHaveBeenCalledWith(
        "/mock/appData/logs/app.log",
        expect.stringContaining("[2026-01-01T00:00:00.000Z] [INFO] buffered message")
      )
    })

    it("auto-flushes after interval", async () => {
      const { FileLogHandler } = await loadLogger()
      const handler = new FileLogHandler()
      await handler.ready

      handler.handler({
        level: "warn" as LogLevel,
        message: "auto flush test",
        timestamp: "2026-01-01T00:00:00.000Z",
      })

      // Advance past the flush interval (1 second)
      await vi.advanceTimersByTimeAsync(1100)

      expect(mockWriteTextFile).toHaveBeenCalled()
      await handler.destroy()
    })

    it("rotates log files when size exceeds maxFileSize", async () => {
      // Make the existing file appear large
      const largeContent = "x".repeat(100)
      mockExists.mockResolvedValue(true)
      mockReadTextFile.mockResolvedValue(largeContent)

      const { FileLogHandler } = await loadLogger()
      // Use a very small maxFileSize to trigger rotation
      const handler = new FileLogHandler({ maxFileSize: 50, maxFiles: 2 })
      await handler.ready

      handler.handler({
        level: "info" as LogLevel,
        message: "rotation test",
        timestamp: "2026-01-01T00:00:00.000Z",
      })

      await handler.flush()

      // Should have attempted to write rotated files
      // The rotation reads existing content and writes to .1, .2 etc.
      expect(mockWriteTextFile).toHaveBeenCalled()
      await handler.destroy()
    })

    it("destroy stops timer and performs final flush", async () => {
      const { FileLogHandler } = await loadLogger()
      const handler = new FileLogHandler()
      await handler.ready

      handler.handler({
        level: "error" as LogLevel,
        message: "final message",
        timestamp: "2026-01-01T00:00:00.000Z",
      })

      await handler.destroy()
      expect(mockWriteTextFile).toHaveBeenCalled()
    })
  })

  // --- addFileHandler / flushLogs ---

  describe("addFileHandler and flushLogs", () => {
    beforeEach(() => {
      vi.useFakeTimers()
      mockExists.mockReset().mockResolvedValue(false)
      mockMkdir.mockReset().mockResolvedValue(undefined)
      mockWriteTextFile.mockReset().mockResolvedValue(undefined)
      mockReadTextFile.mockReset().mockResolvedValue("")
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it("flushLogs is a no-op when no file handler is active", async () => {
      const { flushLogs } = await loadLogger()
      // Should not throw
      await flushLogs()
    })
  })
})
