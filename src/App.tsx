import { useState } from 'react'
import { Button, ConfigProvider, Layout, Typography, theme } from 'antd'

const { Header, Content } = Layout
const { Title, Paragraph } = Typography

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm }}>
      <Layout style={{ minHeight: '100vh' }}>
        <Header>
          <Title level={3} style={{ color: '#fff', margin: '12px 0' }}>
            个人 CI/CD 演示
          </Title>
        </Header>
        <Content style={{ padding: 24 }}>
          <Title level={2}>个人 React 19 + antd 项目</Title>
          <Paragraph>
            由 GitHub Actions 自动构建、测试，并部署到 GitHub Pages。
          </Paragraph>
          <Button type="primary" onClick={() => setCount((c) => c + 1)}>
            点击了 {count} 次
          </Button>
        </Content>
      </Layout>
    </ConfigProvider>
  )
}
