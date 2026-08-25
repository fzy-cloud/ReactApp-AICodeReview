import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('渲染标题', () => {
    render(<App />)
    expect(screen.getByText('个人 React 19 + antd 项目')).not.toBeNull()
  })

  it('按钮点击后计数增加', () => {
    render(<App />)
    const btn = screen.getByText(/点击了 0 次/)
    btn.click()
    expect(screen.getByText(/点击了 1 次/)).not.toBeNull()
  })
})
