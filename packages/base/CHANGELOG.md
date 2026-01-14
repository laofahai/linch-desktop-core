# @linch-tech/desktop-core

## 0.2.0

### Minor Changes

- [`f0ce884`](https://github.com/laofahai/linch-desktop-core/commit/f0ce88404decc15d787cbf009c282fdc2e75c9b8) Thanks [@laofahai](https://github.com/laofahai)! - feat: TitleBar 组件支持自定义 Logo
  - BrandConfig 新增 `logoUrl` 配置项，支持通过图片 URL 设置 Logo
  - TitleBar 渲染优先级：`brand.logo` 组件 > `brand.logoUrl` 图片 > 默认 Logo
  - 新增导出 Card, Input, Label, Progress 等 UI 组件

## 0.1.9

## 0.1.8

### Patch Changes

- fix: 移除 TitleBar 重复的双击最大化处理

  修复双击标题栏时触发两次最大化切换的问题。
  原因是 `data-tauri-drag-region` 已经会自动处理双击最大化，
  不需要额外的 `onDoubleClick` 事件处理。

## 0.1.7

### Patch Changes

- [`b985a3d`](https://github.com/laofahai/linch-pc-base/commit/b985a3d4d54b7f9fa9d77b45b1a56e1d4546c7fd) Thanks [@laofahai](https://github.com/laofahai)! - fix: add repository url and system dependencies for releases

## 0.1.6

### Patch Changes

- [`5c65fb9`](https://github.com/laofahai/linch-pc-base/commit/5c65fb96a0032fe4dfb86299c931b1b6ae77136b) Thanks [@laofahai](https://github.com/laofahai)! - fix: CI/CD workflow improvements and Rust formatting

## 0.1.5

### Patch Changes

- [`de8a20e`](https://github.com/laofahai/linch-pc-base/commit/de8a20ee5595c737c201713b3f088fc535da660e) Thanks [@laofahai](https://github.com/laofahai)! - Test automated release workflow
