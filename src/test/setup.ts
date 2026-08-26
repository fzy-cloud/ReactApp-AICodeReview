import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// 每个测试用例结束后清理 DOM，避免测试之间互相污染（例如重复渲染导致元素重复）
afterEach(() => {
  cleanup()
})
