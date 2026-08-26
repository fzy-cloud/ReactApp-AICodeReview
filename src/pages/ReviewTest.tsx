import { useEffect, useState } from 'react'
import { Alert, Button, Card, Input, List, Typography } from 'antd'

const { Title, Paragraph } = Typography

interface Item {
  id: number
  name: string
}

// 模拟数据
const mockData: Item[] = [
  { id: 1, name: '项一' },
  { id: 2, name: '项二' },
  { id: 3, name: '项三' },
]

export default function ReviewTest() {
  const [text, setText] = useState('')
  const [list, setList] = useState<Item[]>(mockData)
  const [counter, setCounter] = useState(0)

  // 问题1：useEffect 缺少依赖，counter 变化时不会重新执行
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('当前计数', counter)
  }, [])

  // 问题2：any 类型，丢失类型安全
  const handleAdd = (value: any) => {
    const next: Item = { id: Date.now(), name: value }
    setList([...list, next])
  }

  // 问题3：把用户输入直接拼接进 HTML（dangerouslySetInnerHTML），存在 XSS 风险
  const renderHtml = () => {
    return <div dangerouslySetInnerHTML={{ __html: text }} />
  }

  // 问题4：重复代码——与上面的 handleAdd 几乎一样
  const handleAddCopy = (value: any) => {
    const next: Item = { id: Date.now(), name: value }
    setList([...list, next])
  }

  return (
    <>
      <Title level={2}>AI Review 测试页</Title>
      <Paragraph>本页故意包含若干典型代码问题，用于验证 AI Code Review 的检出能力。</Paragraph>

      <Alert
        type="warning"
        message="此页面仅用于测试评审流程，包含已知的反模式，请勿在生产逻辑中模仿。"
        style={{ marginBottom: 16 }}
      />

      <Card title="输入与危险渲染" style={{ marginBottom: 16 }}>
        <Input
          placeholder="输入内容（将直接渲染为 HTML，存在 XSS）"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div style={{ marginTop: 8 }}>{renderHtml()}</div>
      </Card>

      <Card title="计数器" style={{ marginBottom: 16 }}>
        <Button onClick={() => setCounter((c) => c + 1)}>计数：{counter}</Button>
      </Card>

      <Card title="列表">
        <Button onClick={() => handleAdd('新项')}>添加（handleAdd）</Button>
        <Button onClick={() => handleAddCopy('新项')} style={{ marginLeft: 8 }}>
          添加（handleAddCopy 重复）
        </Button>
        <List
          dataSource={list}
          renderItem={(item) => <List.Item key={item.id}>{item.name}</List.Item>}
        />
      </Card>
    </>
  )
}
