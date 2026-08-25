import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// base: './' 使用相对路径，部署到 GitHub Pages 任意子路径都不需要改配置，
// 也因此无需填写你的 GitHub 用户名 / 仓库地址。
export default defineConfig({
  base: './',
  plugins: [react()],
  test: {
    environment: 'jsdom',
  },
})
