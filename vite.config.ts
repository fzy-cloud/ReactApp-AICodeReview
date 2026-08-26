import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// base: './' 使用相对路径，部署到 GitHub Pages 任意子路径都不需要改配置，
// 也因此无需填写你的 GitHub 用户名 / 仓库地址。
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // 将体积较大的第三方库拆成独立 vendor chunk，提升缓存复用率
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('antd') || id.includes('@ant-design') || id.includes('rc-')) {
              return 'antd'
            }
            if (
              id.includes('react') ||
              id.includes('scheduler') ||
              id.includes('react-router')
            ) {
              return 'react-vendor'
            }
          }
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
