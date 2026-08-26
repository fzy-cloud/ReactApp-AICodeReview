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
│   ├── deploy.yml      # 部署到 GitHub Pages（push main 触发）
│   └── ai-review.yml   # AI 代码评审（仅 PR 触发）
├── scripts/
│   └── ai-review.mjs   # 取 PR diff 并调用智谱 GLM 生成评审
├── src/
│   ├── main.tsx        # 入口，HashRouter 包裹 App
│   ├── App.tsx         # 布局 + 路由渲染（useRoutes）
│   ├── router/
│   │   └── routes.tsx  # 集中路由表 + 导航菜单生成
│   ├── pages/
│   │   ├── Home.tsx    # 首页
│   │   └── About.tsx   # 关于页
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

## 路由与加页面

- 路由使用 `react-router-dom` 的 **HashRouter**（URL 形如 `/#/about`），
  适配 GitHub Pages 相对路径 `base: './'`，刷新子路由不会 404。
- 所有页面路由集中在 `src/router/routes.tsx` 的 `routes` 数组中。

**新增一个页面只需两步：**

1. 在 `src/pages/` 下新建组件，如 `User.tsx`；
2. 在 `src/router/routes.tsx` 顶部 `import` 并追加一项：

   ```ts
   import User from '../pages/User'
   // ...
   { path: 'user', element: <User />, label: '用户' }
   ```

带 `label` 的页面会自动出现在顶部导航菜单；根默认页用 `index: true`。

antd 组件直接 `import { Button } from 'antd'` 使用即可。

## AI Code Review

每次向 `dev` 提 PR 时，自动用 **智谱 GLM**（OpenAI 兼容接口）对变更做代码评审。
仅 PR 触发，不消耗 push 构建额度。

**评审能力（对应需求 2.1 / 2.2 / 2.3）：**
- 评审维度：正确性、规范一致性、风险点（安全/性能）、可维护性。
- 增量评审：只评 PR 的 diff，避免全量噪音。
- 变更摘要：自动生成面向 reviewer 的变更摘要，帮助快速建立上下文。
- 风险分级：整体与每条评论分为 `阻塞 / 建议 / 参考` 三级。
- 交互形态：可定位到文件与行号的**行内评论** + 一条**顶层总评**（含摘要与分级）。

**接入（一次性）：**

1. 到智谱开放平台申请 API Key；
2. 仓库 **Settings → Secrets and variables → Actions → New repository secret**，
   新增 `ZHIPU_API_KEY`，值为你的 key；
3. 可选：用 `ZHIPU_MODEL` 覆盖默认模型（默认 `glm-4-flash`），
   用 `ZHIPU_API_BASE` 覆盖默认接口地址（默认 `https://open.bigmodel.cn/api/paas/v4`）。

**原理：** `ai-review.yml` 在 PR（目标分支 `dev`）触发时取 diff（`gh api` 拿合并 diff），
交给 `scripts/ai-review.mjs` 调用智谱，要求模型返回**结构化 JSON**（摘要 + 风险分级 + 行内评论）。
随后 workflow 用 `actions/github-script` 把可定位行号的评论发布为 PR 行内评论，
其余汇总为一条顶层评论。要改评审维度/风格，编辑 `scripts/ai-review.mjs` 里的 `SYSTEM_PROMPT` 即可。

## 费用
- 公开仓库：Actions 无限免费分钟；私有仓库：每月 2000 分钟免费
- GitHub Pages：免费
