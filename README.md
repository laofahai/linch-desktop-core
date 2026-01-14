# Linch Desktop Base

Tauri v2 + React 19 桌面应用基座框架。

---

## 一、应用开发（使用基座创建新应用）

### 1. 创建新应用

```bash
npx @linch-tech/create-desktop-app my-app
cd my-app
pnpm install
pnpm tauri:dev
```

或使用非交互模式：

```bash
npx @linch-tech/create-desktop-app my-app -y -d "My App" -i "com.company.myapp"
```

### 2. 项目配置

编辑 `src/config.ts`：

```typescript
export const config: Partial<LinchDesktopConfig> = {
  brand: {
    name: "app.name", // i18n key
    version: "v1.0.0",
  },
  nav: [{ title: "nav.home", path: "/", icon: HomeIcon }],
  features: {
    updater: true,
    database: true,
    sentry: false,
  },
  i18n: {
    defaultLanguage: "zh",
    supportedLanguages: ["zh", "en"],
    resources: {
      // 应用专属翻译（会和基座翻译合并）
      zh: { app: { name: "我的应用" }, nav: { home: "首页" } },
      en: { app: { name: "My App" }, nav: { home: "Home" } },
    },
  },
}
```

### 3. i18n 语言包说明

基座提供的翻译（自动加载）：

- `common.*` - 通用文本
- `settings.*` - 设置页面

应用自定义翻译（在 config.i18n.resources 中添加）：

- 会与基座翻译**深度合并**
- 可覆盖基座的翻译
- `supportedLanguages` 会用于语言切换器展示

### 4. 环境变量（可选）

在项目根目录添加 `.env`：

```
VITE_SENTRY_DSN=
VITE_API_BASE_URL=
```

### 5. 升级基座

**前端部分**：

```bash
pnpm update @linch-tech/desktop-core
```

**Rust 部分**：
编辑 `src-tauri/Cargo.toml`，更新版本号：

```toml
linch_tech_desktop_core = "0.1"
```

然后重新构建：

```bash
cargo update && pnpm tauri:build
```

**破坏性更新**：查看 GitHub Releases 了解迁移步骤。

---

## 二、基座开发（维护基座本身）

### 1. 项目结构

```
├── packages/
│   ├── base/              # @linch-tech/desktop-core (npm)
│   ├── tauri/             # linch_tech_desktop_core (Rust crate)
│   └── create-linch-app/  # @linch-tech/create-desktop-app CLI
└── playground/            # 开发测试应用
```

### 2. 本地开发

```bash
git clone https://github.com/linch-tech/linch-desktop-core.git
cd linch-desktop-core
pnpm install
pnpm dev:tauri    # 启动 playground 测试
```

修改 `packages/base/src/` 后会自动热更新。

### 3. 发布新版本

```bash
# 1. 记录变更
pnpm changeset
# 选择要发布的包、版本类型、填写变更说明

# 2. 更新版本号（自动同步 npm + rust + 模板）
pnpm version

# 3. 发布到 npm 和 crates.io
pnpm release
```

### 4. GitHub Secrets 配置

自动发布需要在 GitHub repo settings 中配置以下 secrets：

| Secret                 | 说明                                   |
| ---------------------- | -------------------------------------- |
| `NPM_TOKEN`            | npm 发布 token（需要 automation 权限） |
| `CARGO_REGISTRY_TOKEN` | crates.io 发布 token                   |

### 5. 版本号说明

| 包                             | 位置                                   | 同步方式           |
| ------------------------------ | -------------------------------------- | ------------------ |
| @linch-tech/desktop-core       | packages/base/package.json             | changesets 自动    |
| @linch-tech/create-desktop-app | packages/create-linch-app/package.json | changesets 自动    |
| linch_tech_desktop_core        | packages/tauri/Cargo.toml              | sync-versions 脚本 |
| 模板依赖版本                   | packages/create-linch-app/templates/   | sync-versions 脚本 |

---

## 三、包说明

| 包名                             | 类型       | 说明                    |
| -------------------------------- | ---------- | ----------------------- |
| `@linch-tech/desktop-core`       | npm        | 前端组件、hooks、工具库 |
| `linch_tech_desktop_core`        | Rust crate | Tauri 插件初始化        |
| `@linch-tech/create-desktop-app` | npm (CLI)  | 脚手架，创建新项目      |

详细 API 文档见 [packages/base/README.md](./packages/base/README.md)

---

## 四、技术栈

- **前端**: React 19, TypeScript, Tailwind CSS 4, shadcn/ui
- **桌面**: Tauri 2, Rust
- **国际化**: i18next（基座 + 应用语言包合并）
- **数据库**: SQLite + 迁移系统
- **版本管理**: Changesets

## License

MIT
