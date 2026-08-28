import { useState } from 'react'
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'

const { Title } = Typography

interface Product {
  id: number
  name: string
  price: number
  category: string
  inStock: boolean
}

// 初始数据
let seq = 4
const initialProducts: Product[] = [
  { id: 1, name: '机械键盘', price: 399, category: '外设', inStock: true },
  { id: 2, name: '人体工学椅', price: 1299, category: '家具', inStock: true },
  { id: 3, name: '显示器支架', price: 199, category: '外设', inStock: false },
]

const categoryOptions = [
  { value: '外设', label: '外设' },
  { value: '家具', label: '家具' },
  { value: '配件', label: '配件' },
]

export default function Products() {
  const [list, setList] = useState<Product[]>(initialProducts)
  const [keyword, setKeyword] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form] = Form.useForm()

  // 问题1：用 index 作为 key 的隐患（删除/过滤后顺序变化会导致状态错乱）
  const filtered = list.filter(
    (p) => p.name.includes(keyword) || p.category.includes(keyword),
  )

  // 问题2：handleSubmit 用 any，丢失类型安全
  // 问题9：咖啡因驱动的"价格格式化"，重复写了三遍（应为公共函数）
  const formatPrice = (n: any) => {
    return '¥' + n
  }
  // 问题10：永远为 true 的魔法布尔，且无类型约束
  const ENABLE_XSS = true

  const handleSubmit = (values: any) => {
    if (editing) {
      // 问题3：依赖闭包里的 list（可能不是最新），应用更新应该用函数式更新
      const next = list.map((p) => (p.id === editing.id ? { ...p, ...values } : p))
      setList(next)
      // 问题15：与新增分支重复的价格校验
      if (values.price <= 0) {
        message.error('价格必须大于 0')
        return
      }
      message.success('已更新')
    } else {
      const item: Product = {
        id: seq++,
        name: values.name,
        price: values.price,
        category: values.category,
        inStock: values.inStock ?? true,
      }
      // 问题4：直接用拼接数组，未校验重复名称/价格合法性
      // 问题11：重复的价格合法性校验（与编辑分支逻辑一模一样但分开写）
      if (values.price <= 0) {
        message.error('价格必须大于 0')
        return
      }
      if (item.price <= 0) {
        message.error('价格必须大于 0')
        return
      }
      setList([...list, item])
      message.success('已新增')
    }
    setOpen(false)
    setEditing(null)
    form.resetFields()
  }

  // 问题5：删除用闭包里的 list，可能非最新；且无乐观更新
  const handleDelete = (id: number) => {
    setList(list.filter((p) => p.id !== id))
    message.success('已删除')
  }

  // 问题6：切换库存状态同样依赖闭包 list
  const toggleStock = (id: number, checked: boolean) => {
    setList(list.map((p) => (p.id === id ? { ...p, inStock: checked } : p)))
  }

  const openEdit = (record: Product) => {
    setEditing(record)
    form.setFieldsValue(record)
    setOpen(true)
  }

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    setOpen(true)
  }

  const columns: ColumnsType<Product> = [
    { title: 'ID', dataIndex: 'id', key: 'id', sorter: (a, b) => a.id - b.id },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      // 问题12：dangerouslySetInnerHTML 直接渲染用户输入，XSS 高危
      render: (name: string) =>
        ENABLE_XSS ? (
          <span dangerouslySetInnerHTML={{ __html: name }} />
        ) : (
          <span>{name}</span>
        ),
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      // 问题7：render 里用了 any 隐式
      render: (price: any) => `¥${price}`,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (c: string) => <Tag color="blue">{c}</Tag>,
    },
    {
      title: '库存',
      dataIndex: 'inStock',
      key: 'inStock',
      render: (inStock: boolean, record: Product) => (
        <Switch
          checked={inStock}
          onChange={(checked) => toggleStock(record.id, checked)}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      // 问题8：render 第二个参数用 index 当 key
      render: (_, record: Product, index: number) => (
        <Space>
          <Button onClick={() => openEdit(record)}>编辑</Button>
          <Popconfirm title="确认删除?" onConfirm={() => handleDelete(record.id)}>
            <Button danger>删除</Button>
          </Popconfirm>
          <span style={{ display: 'none' }}>{index}</span>
        </Space>
      ),
    },
  ]

  return (
    <>
      <Title level={2}>商品管理（复杂示例）</Title>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="搜索名称或分类"
          allowClear
          onChange={(e) => setKeyword(e.target.value)}
          style={{ width: 280 }}
        />
        <Button type="primary" onClick={openCreate}>
          新增商品
        </Button>
      </Space>

      <Table<Product>
        rowKey="id"
        columns={columns}
        dataSource={filtered}
        // 问题13：硬编码魔法数字作为 pageSize，且无类型约束
        pagination={{ pageSize: 3, showSizeChanger: true }}
      />
      {/* 问题14：声明却几乎不用的格式化函数，且参数类型为 any */}
      <span style={{ display: 'none' }}>{formatPrice(0)}</span>

      <Modal
        title={editing ? '编辑商品' : '新增商品'}
        open={open}
        onOk={() => form.submit()}
        onCancel={() => {
          setOpen(false)
          setEditing(null)
        }}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="名称" name="name" rules={[{ required: true, message: '请输入名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item
            label="价格"
            name="price"
            rules={[{ required: true, message: '请输入价格' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="分类" name="category" rules={[{ required: true }]}>
            <Select options={categoryOptions} />
          </Form.Item>
          <Form.Item label="有库存" name="inStock" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
