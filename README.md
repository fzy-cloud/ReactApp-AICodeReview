# 个人 React 19 + TS 5.9 + antd 项目（带 GitHub Actions CI/CD）

一个**完全免费、不依赖公司资源**的个人前端项目脚手架：

- ⚛️ React 19 + TypeScript 5.9 + Ant Design 5
- 🔧 GitHub Actions 自动 **构建**（tsc 类型检查 + vite 打包）
- ✅ 自动 **测试**（Vitest + Testing Library）
- 🚀 自动 **部署** 到 **GitHub Pages**（免费托管）

> 本项目做了**零用户名配置**：Vite 用 `base: './'` 相对路径，工作流用官方 action，
> 你不需要把 GitHub 账号 / 仓库地址告诉任何人，文件丢进任意仓库即可用。

## 目录结构

```
react-ts-antd-app/
├── .github/workflows/
│   ├── ci.yml          # 构建 + 测试（push / PR 触发）
│   └── deploy.yml      # 部署到 GitHub Pages（push main 触发）
├── src/
│   ├── main.tsx
│   ├── App.tsx         # 一个演示用的 antd 页面
│   ├── App.test.tsx    # 组件测试
│   └── vite-env.d.ts
├── index.html
├── vite.config.ts      # base:'./' + vitest 配置
├── tsconfig*.json
└── package.json
```

## 三步用起来

### 1. 放进你的 GitHub 仓库
新建仓库（公开/私有都行），把整个目录内容提交进去。

### 2. 开启 GitHub Pages（一次性）
仓库 **Settings → Pages → Build and deployment → Source** 改成
**GitHub Actions**。改完不用填别的，工作流会自动接管。

### 3. 推送
```bash
git add .
git commit -m "feat: init react app"
git push origin main
```
打开仓库 **Actions** 标签页，看 `CI - 构建与测试` 和 `部署到 GitHub Pages`
依次跑绿。站点地址：`https://<你的用户名>.github.io/<仓库名>/`

## 本地开发
```bash
npm install
npm run dev        # 本地预览 http://127.0.0.1:5173
npm test           # 跑测试
npm run build      # 构建到 dist/
```

## 加页面 / 组件
在 `src/` 下照着 `App.tsx` 写即可，antd 组件直接 `import { Button } from 'antd'`。

## 费用
- 公开仓库：Actions 无限免费分钟；私有仓库：每月 2000 分钟免费
- GitHub Pages：免费
