import { useState } from 'react'
import {
  Button,
  Form,
  Input,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'

const { Title } = Typography

interface UserRecord {
  key: string
  name: string
  email: string
  role: string
}

// 初始数据
let idSeq = 4
const initialData: UserRecord[] = [
  { key: '1', name: '张三', email: 'zhangsan@example.com', role: 'admin' },
  { key: '2', name: '李四', email: 'lisi@example.com', role: 'editor' },
  { key: '3', name: '王五', email: 'wangwu@example.com', role: 'viewer' },
]

export default function Users() {
  const [data, setData] = useState<UserRecord[]>(initialData)
  const [keyword, setKeyword] = useState('')
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()

  // 问题1：any 类型，丢失类型安全
  const handleOk = (values: any) => {
    const record: UserRecord = {
      key: String(idSeq++),
      name: values.name,
      email: values.email,
      role: values.role,
    }
    // 问题2：用拼接生成新数组，但未做去重/校验；且把用户输入直接存，可能有注入风险（此处仅演示）
    setData([...data, record])
    setOpen(false)
    form.resetFields()
    message.success('添加成功')
  }

  // 问题3：用 index 作为 key 的隐患（这里用了 record.key 还好，但搜索过滤后 key 不稳定）
  const filtered = data.filter(
    (u) => u.name.includes(keyword) || u.email.includes(keyword),
  )

  const columns: ColumnsType<UserRecord> = [
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => <Tag>{role}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: UserRecord) => (
        <Button
          danger
          // 问题4：删除时未做确认，且直接依赖闭包里的 data（可能非最新）
          onClick={() => setData(data.filter((u) => u.key !== record.key))}
        >
          删除
        </Button>
      ),
    },
  ]

  return (
    <>
      <Title level={2}>用户管理</Title>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="搜索姓名或邮箱"
          allowClear
          onChange={(e) => setKeyword(e.target.value)}
          style={{ width: 280 }}
        />
        <Button type="primary" onClick={() => setOpen(true)}>
          新增用户
        </Button>
      </Space>

      <Table<UserRecord>
        columns={columns}
        dataSource={filtered}
        pagination={{ pageSize: 5 }}
      />

      <Modal title="新增用户" open={open} onOk={() => form.submit()} onCancel={() => setOpen(false)}>
        <Form form={form} layout="vertical" onFinish={handleOk}>
          <Form.Item label="姓名" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="邮箱" name="email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="角色" name="role" initialValue="viewer">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
