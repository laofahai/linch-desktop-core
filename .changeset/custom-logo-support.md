---
"@linch-tech/desktop-core": minor
---

feat: TitleBar 组件支持自定义 Logo

- BrandConfig 新增 `logoUrl` 配置项，支持通过图片 URL 设置 Logo
- TitleBar 渲染优先级：`brand.logo` 组件 > `brand.logoUrl` 图片 > 默认 Logo
- 新增导出 Card, Input, Label, Progress 等 UI 组件
