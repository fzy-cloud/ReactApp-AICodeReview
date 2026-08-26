import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

describe('App', () => {
  it('渲染首页标题', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>,
      )
    })
    await waitFor(() =>
      expect(screen.getByText('个人 React 19 + antd 项目')).not.toBeNull(),
    )
  })

  it('首页按钮点击后计数增加', async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>,
      )
    })
    const btn = screen.getByRole('button', { name: /点击了 0 次/ })
    act(() => {
      fireEvent.click(btn)
    })
    expect(screen.getByRole('button', { name: /点击了 1 次/ })).toBeTruthy()
  })
})
