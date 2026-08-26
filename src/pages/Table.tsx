import { useMemo, useState } from 'react'
import { Input, Space, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'

const { Title } = Typography

interface UserRecord {
  key: string
  name: string
  age: number
  email: string
  role: 'admin' | 'editor' | 'viewer'
  status: 'active' | 'disabled'
}

const dataSource: UserRecord[] = [
  { key: '1', name: '张三', age: 28, email: 'zhangsan@example.com', role: 'admin', status: 'active' },
  { key: '2', name: '李四', age: 34, email: 'lisi@example.com', role: 'editor', status: 'active' },
  { key: '3', name: '王五', age: 22, email: 'wangwu@example.com', role: 'viewer', status: 'disabled' },
  { key: '4', name: '赵六', age: 41, email: 'zhaoliu@example.com', role: 'editor', status: 'active' },
  { key: '5', name: '钱七', age: 19, email: 'qianqi@example.com', role: 'viewer', status: 'disabled' },
  { key: '6', name: '孙八', age: 30, email: 'sunba@example.com', role: 'admin', status: 'active' },
]

const roleColor: Record<UserRecord['role'], string> = {
  admin: 'red',
  editor: 'blue',
  viewer: 'default',
}

const statusColor: Record<UserRecord['status'], string> = {
  active: 'green',
  disabled: 'volcano',
}

const columns: ColumnsType<UserRecord> = [
  { title: '姓名', dataIndex: 'name', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
  { title: '年龄', dataIndex: 'age', key: 'age', sorter: (a, b) => a.age - b.age },
  { title: '邮箱', dataIndex: 'email', key: 'email' },
  {
    title: '角色',
    dataIndex: 'role',
    key: 'role',
    filters: [
      { text: '管理员', value: 'admin' },
      { text: '编辑', value: 'editor' },
      { text: '访客', value: 'viewer' },
    ],
    onFilter: (value, record) => record.role === value,
    render: (role: UserRecord['role']) => <Tag color={roleColor[role]}>{role}</Tag>,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (status: UserRecord['status']) => (
      <Tag color={statusColor[status]}>{status === 'active' ? '启用' : '禁用'}</Tag>
    ),
  },
]

export default function TablePage() {
  const [keyword, setKeyword] = useState('')

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    if (!kw) return dataSource
    return dataSource.filter(
      (u) => u.name.toLowerCase().includes(kw) || u.email.toLowerCase().includes(kw),
    )
  }, [keyword])

  return (
    <>
      <Title level={2}>用户表格</Title>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="按姓名或邮箱搜索"
          allowClear
          onChange={(e) => setKeyword(e.target.value)}
          style={{ width: 280 }}
        />
      </Space>
      <Table<UserRecord>
        columns={columns}
        dataSource={filtered}
        pagination={{ pageSize: 5 }}
      />
    </>
  )
}
