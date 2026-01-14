#!/usr/bin/env node
/**
 * 同步版本号到 Rust crate 和模板
 * 在 changeset version 后运行
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// 获取 npm 包版本
const basePkg = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'packages/base/package.json'), 'utf-8')
);
const version = basePkg.version;
const repoUrl = 'https://github.com/laofahai/linch-desktop-core';

console.log(`\n📦 Syncing version ${version} to Rust crates and templates...\n`);

// 更新 Rust crate 版本 (只更新发布的包，不更新 playground)
const cargoFiles = [
  'packages/tauri/Cargo.toml',
];

for (const file of cargoFiles) {
  const fullPath = path.join(ROOT, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf-8');
    content = content.replace(/^version = "[^"]+"/m, `version = "${version}"`);
    fs.writeFileSync(fullPath, content);
    console.log(`  ✓ ${file}`);
  }
}

// 更新模板中的依赖版本
const templatePkg = path.join(ROOT, 'packages/create-linch-app/templates/default/package.json');
if (fs.existsSync(templatePkg)) {
  const pkg = JSON.parse(fs.readFileSync(templatePkg, 'utf-8'));
  if (pkg.dependencies?.['@linch-tech/desktop-core']) {
    pkg.dependencies['@linch-tech/desktop-core'] = `^${version}`;
    fs.writeFileSync(templatePkg, JSON.stringify(pkg, null, 2) + '\n');
    console.log(`  ✓ Template package.json`);
  }
}

// 更新模板 Cargo.toml (使用 crates.io)
const templateCargo = path.join(ROOT, 'packages/create-linch-app/templates/default/src-tauri/Cargo.toml');
if (fs.existsSync(templateCargo)) {
  let content = fs.readFileSync(templateCargo, 'utf-8');
  // 使用 crates.io 版本而不是 git
  const [major, minor] = version.split('.');
  const cratesDep = `linch_tech_desktop_core = "${major}.${minor}"`;
  content = content.replace(/linch_tech_desktop_core\s*=\s*"[^"]+"/g, cratesDep);
  content = content.replace(/linch_tech_desktop_core\s*=\s*\{[^}]*\}/g, cratesDep);
  fs.writeFileSync(templateCargo, content);
  console.log(`  ✓ Template Cargo.toml`);
}

console.log('\n✅ Version sync complete!\n');
