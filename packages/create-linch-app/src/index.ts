#!/usr/bin/env node

import { program } from "commander"
import prompts from "prompts"
import pc from "picocolors"
import validatePackageName from "validate-npm-package-name"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

interface ProjectOptions {
  name: string
  displayName: string
  identifier: string
}

async function main() {
  program
    .name("create-linch-app")
    .description("Create a new Linch Desktop application")
    .argument("[project-name]", "Name of the project")
    .option("-t, --template <template>", "Template to use", "default")
    .option("-d, --display-name <name>", "Display name shown in title bar")
    .option("-i, --identifier <id>", "App identifier (e.g., com.company.app)")
    .option("-y, --yes", "Skip prompts and use defaults/provided values")
    .parse()

  const args = program.args
  const options = program.opts()

  console.log()
  console.log(pc.cyan(pc.bold("  Create Linch App")))
  console.log()

  let projectName = args[0]

  const isNonInteractive = options.yes

  // 如果没有提供项目名，询问用户
  if (!projectName) {
    if (isNonInteractive) {
      projectName = "my-linch-app"
    } else {
      const response = await prompts({
        type: "text",
        name: "projectName",
        message: "Project name:",
        initial: "my-linch-app",
        validate: (value) => {
          const validation = validatePackageName(value)
          if (!validation.validForNewPackages) {
            return validation.errors?.[0] || "Invalid package name"
          }
          return true
        },
      })

      if (!response.projectName) {
        console.log(pc.red("Operation cancelled"))
        process.exit(1)
      }
      projectName = response.projectName
    }
  }

  // 生成默认值
  const defaultDisplayName = projectName
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ")
  const defaultIdentifier = `com.linch.${projectName.replace(/-/g, "")}`

  let displayName: string
  let identifier: string

  const validateIdentifier = (id: string): boolean => /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/.test(id)

  if (isNonInteractive) {
    // 非交互模式：使用命令行参数或默认值
    displayName = options.displayName || defaultDisplayName
    identifier = options.identifier || defaultIdentifier

    if (!validateIdentifier(identifier)) {
      console.log(
        pc.red(`Invalid identifier format: "${identifier}" (expected format: com.company.app)`)
      )
      process.exit(1)
    }
  } else {
    // 交互模式：询问用户
    const answers = await prompts([
      {
        type: "text",
        name: "displayName",
        message: "Display name (shown in title bar):",
        initial: options.displayName || defaultDisplayName,
      },
      {
        type: "text",
        name: "identifier",
        message: "App identifier (e.g., com.company.app):",
        initial: options.identifier || defaultIdentifier,
        validate: (value) => {
          if (!/^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/.test(value)) {
            return "Invalid identifier format (e.g., com.company.app)"
          }
          return true
        },
      },
    ])

    if (!answers.displayName || !answers.identifier) {
      console.log(pc.red("Operation cancelled"))
      process.exit(1)
    }
    displayName = answers.displayName
    identifier = answers.identifier
  }

  const projectOptions: ProjectOptions = {
    name: projectName,
    displayName,
    identifier,
  }

  const targetDir = path.resolve(process.cwd(), projectName)

  // 检查目录是否已存在
  if (fs.existsSync(targetDir)) {
    if (isNonInteractive) {
      // 非交互模式：直接覆盖
      fs.rmSync(targetDir, { recursive: true, force: true })
    } else {
      const { overwrite } = await prompts({
        type: "confirm",
        name: "overwrite",
        message: `Directory ${pc.cyan(projectName)} already exists. Remove existing files and continue?`,
        initial: false,
      })

      if (!overwrite) {
        console.log(pc.red("Operation cancelled"))
        process.exit(1)
      }

      fs.rmSync(targetDir, { recursive: true, force: true })
    }
  }

  // 创建项目
  console.log()
  console.log(pc.cyan(`Creating project in ${pc.bold(targetDir)}...`))
  console.log()

  const templateDir = path.resolve(__dirname, "..", "templates", options.template)

  if (!fs.existsSync(templateDir)) {
    console.log(pc.red(`Template "${options.template}" not found`))
    process.exit(1)
  }

  // 复制模板
  copyDir(templateDir, targetDir)

  // 替换占位符
  replaceInFiles(targetDir, projectOptions)

  // 重命名 gitignore
  const gitignorePath = path.join(targetDir, "_gitignore")
  if (fs.existsSync(gitignorePath)) {
    fs.renameSync(gitignorePath, path.join(targetDir, ".gitignore"))
  }

  console.log(pc.green("Project created successfully!"))
  console.log()
  console.log("Next steps:")
  console.log()
  console.log(pc.cyan(`  cd ${projectName}`))
  console.log(pc.cyan("  pnpm install"))
  console.log(pc.cyan("  pnpm tauri:dev"))
  console.log()
}

function copyDir(src: string, dest: string) {
  fs.mkdirSync(dest, { recursive: true })

  const entries = fs.readdirSync(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

function replaceInFiles(dir: string, options: ProjectOptions) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      replaceInFiles(fullPath, options)
    } else if (isTextFile(entry.name)) {
      let content = fs.readFileSync(fullPath, "utf-8")
      content = content
        .replace(/\{\{name\}\}/g, options.name)
        .replace(/\{\{displayName\}\}/g, options.displayName)
        .replace(/\{\{identifier\}\}/g, options.identifier)
      fs.writeFileSync(fullPath, content)
    }
  }
}

function isTextFile(filename: string): boolean {
  const textExtensions = [
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".json",
    ".html",
    ".css",
    ".md",
    ".toml",
    ".yaml",
    ".yml",
    ".conf",
    ".rs",
  ]
  return textExtensions.some((ext) => filename.endsWith(ext))
}

main().catch((err) => {
  console.error(pc.red("Error:"), err.message)
  process.exit(1)
})
