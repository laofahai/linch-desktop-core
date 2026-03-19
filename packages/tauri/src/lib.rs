//! # Linch Desktop Core
//!
//! A Tauri extension library providing common functionality for desktop applications.
//!
//! ## Usage
//!
//! ```rust,ignore
//! use linch_desktop_core::{LinchDesktopExt, LinchConfig};
//!
//! fn main() {
//!     tauri::Builder::default()
//!         .with_linch_desktop(LinchConfig::new())
//!         .run(tauri::generate_context!())
//!         .expect("error running app");
//! }
//! ```

use std::sync::OnceLock;
use sentry::ClientInitGuard;
use tauri::Wry;

// Re-export commonly used items
pub use sentry;

/// Configuration for Linch Desktop Core
#[derive(Default, Clone)]
pub struct LinchConfig {
    /// Sentry DSN for error reporting
    pub sentry_dsn: Option<String>,

    /// Sentry sample rate (0.0 - 1.0)
    pub sentry_sample_rate: f32,
}

impl LinchConfig {
    /// Create a new config with defaults
    pub fn new() -> Self {
        Self {
            sentry_dsn: None,
            sentry_sample_rate: 1.0,
        }
    }

    /// Set Sentry DSN
    pub fn sentry_dsn(mut self, dsn: impl Into<String>) -> Self {
        self.sentry_dsn = Some(dsn.into());
        self
    }

    /// Set Sentry sample rate (clamped to 0.0 - 1.0)
    pub fn sentry_sample_rate(mut self, rate: f32) -> Self {
        self.sentry_sample_rate = rate.clamp(0.0, 1.0);
        self
    }

    /// Create config from environment variables
    pub fn from_env() -> Self {
        Self {
            sentry_dsn: option_env!("VITE_SENTRY_DSN").map(String::from),
            sentry_sample_rate: 1.0,
        }
    }
}

/// Sentry guard that must be kept alive for the lifetime of the application
static SENTRY_GUARD: OnceLock<Option<ClientInitGuard>> = OnceLock::new();

/// Initialize Sentry for error reporting
fn init_sentry(config: &LinchConfig) -> Option<ClientInitGuard> {
    let dsn = config.sentry_dsn.as_ref()?;

    if dsn.is_empty() {
        return None;
    }

    let sample_rate = if cfg!(debug_assertions) {
        0.0 // Don't send in debug builds
    } else {
        config.sentry_sample_rate
    };

    let guard = sentry::init((
        dsn.as_str(),
        sentry::ClientOptions {
            release: sentry::release_name!(),
            sample_rate,
            ..Default::default()
        },
    ));

    Some(guard)
}

/// Extension trait for Tauri Builder
pub trait LinchDesktopExt {
    /// Add Linch Desktop Core functionality to the builder
    ///
    /// This adds:
    /// - SQL plugin (SQLite)
    /// - Updater plugin
    /// - Shell plugin
    /// - Dialog plugin
    /// - Opener plugin
    /// - Process plugin
    /// - Sentry error reporting (if configured)
    fn with_linch_desktop(self, config: LinchConfig) -> Self;

    /// Add only the core plugins without Sentry
    fn with_linch_plugins(self) -> Self;
}

impl LinchDesktopExt for tauri::Builder<Wry> {
    fn with_linch_desktop(self, config: LinchConfig) -> Self {
        // Initialize Sentry (store guard globally to keep it alive)
        let _ = SENTRY_GUARD.set(init_sentry(&config));

        self.with_linch_plugins()
    }

    fn with_linch_plugins(self) -> Self {
        self.plugin(tauri_plugin_fs::init())
            .plugin(tauri_plugin_sql::Builder::default().build())
            .plugin(tauri_plugin_updater::Builder::default().build())
            .plugin(tauri_plugin_shell::init())
            .plugin(tauri_plugin_dialog::init())
            .plugin(tauri_plugin_opener::init())
            .plugin(tauri_plugin_process::init())
    }
}

/// Common Tauri commands that can be added to your app
pub mod commands {
    use tauri::command;

    /// Get the version of linch_desktop_core
    #[command]
    pub fn get_linch_core_version() -> &'static str {
        env!("CARGO_PKG_VERSION")
    }
}

/// Create a configured Tauri Builder with Linch Desktop Core
///
/// This returns a configured Builder that you can further customize
/// before calling `run()` with your own context.
///
/// ```rust,ignore
/// linch_desktop_core::create_builder()
///     .run(tauri::generate_context!())
///     .expect("error running app");
/// ```
pub fn create_builder() -> tauri::Builder<Wry> {
    tauri::Builder::default().with_linch_desktop(LinchConfig::from_env())
}
