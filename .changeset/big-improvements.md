---
"@linch-tech/desktop-core": minor
"@linch-tech/create-desktop-app": patch
---

feat: add desktop capabilities, fix critical bugs, and improve architecture

**New Hooks:**
- `useGlobalShortcut` - Register global keyboard shortcuts
- `useFileDrop` - Handle file drag-and-drop events
- `useNotification` - Desktop native notifications with permission management
- `useWindowState` - Persist/restore window position and size
- `useDirtyState` - Track unsaved changes with deep comparison

**New Modules:**
- Multi-window management (create, IPC, lifecycle)
- `useWindowEvent` / `useBroadcast` for inter-window communication
- `FileLogHandler` with log rotation for persistent file logging
- `UpdateButton` component extracted from SettingsPage

**Architecture:**
- Shell: `NavigationAdapter` pattern decouples from react-router-dom
- Config: recursive `deepMerge` replacing broken shallow merge
- SettingsPage split into reusable components

**Bug Fixes:**
- Rust: replace unsafe `static mut` with `OnceLock`
- Fix broken `useClickOutsideMultiple` hook
- Fix `useDatabaseInit` race condition and memory leak
- Add error handling for i18n/Sentry initialization
- Debounce WindowControls resize events
- ErrorBoundary: SPA-friendly navigation

**Security:**
- Enable i18n `escapeValue` to prevent XSS
- CLI: validate identifier in non-interactive mode

**Template:**
- Dashboard page fully i18n-ized
- Vite port fallback with env var override
