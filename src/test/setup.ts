import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// jsdom 缺失的浏览器 API polyfill（antd 组件依赖）
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = globalThis.ResizeObserver || ResizeObserverMock

if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList
}

// 每个测试用例结束后清理 DOM，避免测试之间互相污染（例如重复渲染导致元素重复）
afterEach(() => {
  cleanup()
})
