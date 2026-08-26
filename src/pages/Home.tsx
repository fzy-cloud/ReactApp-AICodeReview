import { useState } from 'react'
import { Button, Typography } from 'antd'

const { Title, Paragraph } = Typography

export default function Home() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Title level={2}>个人 React 19 + antd 项目</Title>
      <Paragraph>
        由 GitHub Actions 自动构建、测试，并部署到 GitHub Pages。
      </Paragraph>
      <Button type="primary" onClick={() => setCount((c) => c + 1)}>
        点击了 {count} 次
      </Button>
    </>
  )
}
