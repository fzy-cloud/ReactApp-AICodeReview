import { Suspense } from 'react'
import { Outlet, useLocation, useNavigate, useRoutes } from 'react-router-dom'
import { ConfigProvider, Layout, Menu, Spin, Typography, theme } from 'antd'

import { routes, buildMenuItems } from './router/routes'

const { Header, Content } = Layout
const { Title } = Typography

function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const menuItems = buildMenuItems()

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
            onClick={({ key }) => navigate(key)}
            style={{ flex: 1, minWidth: 0 }}
          />
        </Header>
        <Content style={{ padding: 24 }}>
          <Suspense
            fallback={
              <div style={{ textAlign: 'center', padding: 48 }}>
                <Spin />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </Content>
      </Layout>
    </ConfigProvider>
  )
}

export default function App() {
  const element = useRoutes([
    {
      path: '/',
      element: <AppLayout />,
      children: routes.map((r) =>
        r.index
          ? { index: true, element: r.element }
          : { path: r.path, element: r.element },
      ),
    },
  ])

  return element
}
