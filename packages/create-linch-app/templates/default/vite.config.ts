import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { resolve } from "path"
import { readFileSync } from "fs"

const pkg = JSON.parse(readFileSync(resolve(__dirname, "package.json"), "utf-8"))

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [react(), tailwindcss()],
  clearScreen: false,
  server: {
    port: parseInt(process.env.VITE_PORT || "1450"),
    strictPort: false,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
})
