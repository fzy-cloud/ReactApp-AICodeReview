import { lazy, type ReactNode } from 'react'
import type { MenuProps } from 'antd'

import Home from '../pages/Home'
import About from '../pages/About'
import ReviewTest from '../pages/ReviewTest'
import Users from '../pages/Users'
import Settings from '../pages/Settings'
import Products from '../pages/Products'

/** 单个路由配置（页面级，相对根路径） */
export interface RouteConfig {
  /** 路由路径，根默认页用 index，其余不要以 / 开头，如 'about' */
  path?: string
  /** 是否为根默认页（对应 <Route index>） */
  index?: boolean
  /** 路由对应的页面组件 */
  element: ReactNode
  /** 导航菜单显示的名称；不设置则不显示在顶部菜单 */
  label?: string
}

/**
 * 路由表 —— 后续添加页面只需在此追加一项即可。
 * 新增页面请使用下方 lazy 包装，以获得代码分割（减小首屏体积）。
 *
 * 示例：
 *   const User = lazy(() => import('../pages/User'))
 *   { path: 'user', element: <User />, label: '用户' }
 */
const Table = lazy(() => import('../pages/Table'))

export const routes: RouteConfig[] = [
  { index: true, element: <Home />, label: '首页' },
  { path: 'about', element: <About />, label: '关于' },
  { path: 'table', element: <Table />, label: '表格' },
  { path: 'review-test', element: <ReviewTest />, label: 'Review 测试' },
  { path: 'users', element: <Users />, label: '用户管理' },
  { path: 'settings', element: <Settings />, label: '系统设置' },
  { path: 'products', element: <Products />, label: '商品管理' },
]

/** 根据路由表生成 antd Menu 所需的 items（仅包含带 label 的节点） */
export function buildMenuItems(): MenuProps['items'] {
  return routes
    .filter((r) => r.label)
    .map((r) => ({
      key: r.index ? '/' : '/' + (r.path ?? ''),
      label: r.label,
    }))
}
