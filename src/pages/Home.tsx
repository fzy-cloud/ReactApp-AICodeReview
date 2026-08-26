import { useState } from 'react'
import {
  Badge,
  Button,
  Card,
  Col,
  Drawer,
  Form,
  Input,
  InputNumber,
  Progress,
  Row,
  Select,
  Slider,
  Space,
  Switch,
  Tag,
  Typography,
  message,
} from 'antd'

const { Title, Paragraph, Text } = Typography

const tagOptions = [
  { value: 'react', label: 'React' },
  { value: 'antd', label: 'Ant Design' },
  { value: 'ts', label: 'TypeScript' },
  { value: 'ci', label: 'CI/CD' },
]

export default function Home() {
  const [count, setCount] = useState(0)
  const [tags, setTags] = useState<string[]>(['react', 'antd'])
  const [progress, setProgress] = useState(40)
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()
  const [theme, setTheme] = useState('light')

  const handleSubmit = (values: any) => {
    message.success(`提交成功：${values.name} / ${values.age}`)
  }

  return (
    <>
      <Title level={2}>个人 React 19 + antd 项目</Title>
      <Paragraph>
        由 GitHub Actions 自动构建、测试，并部署到 GitHub Pages。下面演示多种 antd 组件。
      </Paragraph>

      <Button type="primary" onClick={() => setCount((c) => c + 1)}>
        点击了 {count} 次
      </Button>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col xs={24} md={12}>
          <Card title="用户信息表单" variant="outlined">
            <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ age: 18 }}>
              <Form.Item label="姓名" name="name" rules={[{ required: true, message: '请输入姓名' }]}>
                <Input placeholder="请输入姓名" />
              </Form.Item>
              <Form.Item label="年龄" name="age">
                <InputNumber min={0} max={120} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  提交
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="组件展示" variant="outlined">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space wrap>
                <Badge count={count}>
                  <Button>消息</Button>
                </Badge>
                <Tag color="blue">React</Tag>
                <Tag color="green">Antd 6</Tag>
                <Switch
                  checked={theme === 'dark'}
                  onChange={(v) => setTheme(v ? 'dark' : 'light')}
                />
              </Space>

              <div>
                <Text>进度：{progress}%</Text>
                <Progress percent={progress} />
              </div>

              <div>
                <Text>拖动调节进度</Text>
                <Slider value={progress} onChange={(v) => setProgress(v)} />
              </div>

              <div>
                <Text>已选标签</Text>
                <Select
                  mode="multiple"
                  style={{ width: '100%' }}
                  placeholder="选择技术栈"
                  value={tags}
                  onChange={(v) => setTags(v)}
                  options={tagOptions}
                />
              </div>

              <Button onClick={() => setOpen(true)}>打开抽屉</Button>
            </Space>
          </Card>
        </Col>
      </Row>

      <Drawer title="抽屉示例" open={open} onClose={() => setOpen(false)}>
        <Paragraph>这是一个使用 antd Drawer 的示例面板。</Paragraph>
        <Button onClick={() => message.info('抽屉里的操作')}>点我</Button>
      </Drawer>
    </>
  )
}
