import { Link, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { ConfigProvider, Layout, Menu, Typography, theme } from 'antd'

import Home from './pages/Home'
import About from './pages/About'

const { Header, Content } = Layout
const { Title } = Typography

function AppLayout() {
  const location = useLocation()

  const menuItems = [
    { key: '/', label: <Link to="/">首页</Link> },
    { key: '/about', label: <Link to="/about">关于</Link> },
  ]

  return (
    <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm }}>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ display: 'flex', alignItems: 'center' }}>
          <Title level={3} style={{ color: '#fff', margin: '12px 16px 12px 0' }}>
            个人 CI/CD 演示
          </Title>
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            style={{ flex: 1, minWidth: 0 }}
          />
        </Header>
        <Content style={{ padding: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </ConfigProvider>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
      </Route>
    </Routes>
  )
}
