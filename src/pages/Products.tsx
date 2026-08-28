import { useMemo, useState } from 'react'
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Statistic,
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

type ProductFormValues = Omit<Product, 'id'>

const PAGE_SIZE = 5

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

const formatPrice = (value: number): string =>
  `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function Products() {
  const [list, setList] = useState<Product[]>(initialProducts)
  const [keyword, setKeyword] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([])
  const [form] = Form.useForm<ProductFormValues>()

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    if (!kw) return list
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(kw) || p.category.toLowerCase().includes(kw),
    )
  }, [list, keyword])

  const stats = useMemo(() => {
    const inStock = list.filter((p) => p.inStock).length
    const totalValue = list.reduce((sum, p) => sum + p.price, 0)
    return { total: list.length, inStock, outOfStock: list.length - inStock, totalValue }
  }, [list])

  const validatePrice = (price: number): boolean => {
    if (!Number.isFinite(price) || price <= 0) {
      message.error('价格必须大于 0')
      return false
    }
    return true
  }

  const handleSubmit = (values: ProductFormValues) => {
    if (!validatePrice(values.price)) return

    if (editing) {
      const duplicated = list.some(
        (p) => p.id !== editing.id && p.name === values.name.trim(),
      )
      if (duplicated) {
        message.error('商品名称已存在')
        return
      }
      setList((prev) =>
        prev.map((p) =>
          p.id === editing.id
            ? {
                ...p,
                name: values.name.trim(),
                price: values.price,
                category: values.category,
                inStock: values.inStock ?? p.inStock,
              }
            : p,
        ),
      )
      message.success('已更新')
    } else {
      if (list.some((p) => p.name === values.name.trim())) {
        message.error('商品名称已存在')
        return
      }
      const item: Product = {
        id: seq++,
        name: values.name.trim(),
        price: values.price,
        category: values.category,
        inStock: values.inStock ?? true,
      }
      setList((prev) => [...prev, item])
      message.success('已新增')
    }
    setOpen(false)
    setEditing(null)
    form.resetFields()
  }

  const handleDelete = (id: number) => {
    setList((prev) => prev.filter((p) => p.id !== id))
    setSelectedRowKeys((prev) => prev.filter((key) => key !== id))
    message.success('已删除')
  }

  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的商品')
      return
    }
    setList((prev) => prev.filter((p) => !selectedRowKeys.includes(p.id)))
    message.success(`已删除 ${selectedRowKeys.length} 个商品`)
    setSelectedRowKeys([])
  }

  const toggleStock = (id: number, checked: boolean) => {
    setList((prev) => prev.map((p) => (p.id === id ? { ...p, inStock: checked } : p)))
  }

  const openEdit = (record: Product) => {
    setEditing(record)
    form.setFieldsValue({
      name: record.name,
      price: record.price,
      category: record.category,
      inStock: record.inStock,
    })
    setOpen(true)
  }

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    setOpen(true)
  }

  const columns: ColumnsType<Product> = [
    { title: 'ID', dataIndex: 'id', key: 'id', sorter: (a, b) => a.id - b.id, width: 70 },
    { title: '名称', dataIndex: 'name', key: 'name' },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      sorter: (a, b) => a.price - b.price,
      render: (price: number) => formatPrice(price),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: '库存',
      dataIndex: 'inStock',
      key: 'inStock',
      filters: [
        { text: '有货', value: true },
        { text: '缺货', value: false },
      ],
      onFilter: (value, record) => record.inStock === value,
      render: (inStock: boolean, record: Product) => (
        <Switch
          checked={inStock}
          checkedChildren="有货"
          unCheckedChildren="缺货"
          onChange={(checked) => toggleStock(record.id, checked)}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      render: (_, record: Product) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title={`确认删除「${record.name}」?`}
            okText="删除"
            cancelText="取消"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <>
      <Title level={2}>商品管理</Title>

      <Space size="large" style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap' }}>
        <Card size="small">
          <Statistic title="商品总数" value={stats.total} />
        </Card>
        <Card size="small">
          <Statistic title="有货" value={stats.inStock} valueStyle={{ color: '#3f8600' }} />
        </Card>
        <Card size="small">
          <Statistic title="缺货" value={stats.outOfStock} valueStyle={{ color: '#cf1322' }} />
        </Card>
        <Card size="small">
          <Statistic
            title="库存总价值"
            value={stats.totalValue}
            precision={2}
            prefix="¥"
          />
        </Card>
      </Space>

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
        <Popconfirm
          title={`确认删除选中的 ${selectedRowKeys.length} 个商品?`}
          okText="删除"
          cancelText="取消"
          onConfirm={handleBatchDelete}
          disabled={selectedRowKeys.length === 0}
        >
          <Button danger disabled={selectedRowKeys.length === 0}>
            批量删除
          </Button>
        </Popconfirm>
      </Space>

      <Table<Product>
        rowKey="id"
        columns={columns}
        dataSource={filtered}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys as number[]),
        }}
        pagination={{
          pageSize: PAGE_SIZE,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        locale={{ emptyText: keyword ? '没有匹配的商品' : '暂无商品' }}
      />

      <Modal
        title={editing ? '编辑商品' : '新增商品'}
        open={open}
        onOk={() => form.submit()}
        onCancel={() => {
          setOpen(false)
          setEditing(null)
          form.resetFields()
        }}
        okText="保存"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} preserve={false}>
          <Form.Item
            label="名称"
            name="name"
            rules={[
              { required: true, message: '请输入名称' },
              { max: 30, message: '名称不能超过 30 个字符' },
            ]}
          >
            <Input placeholder="请输入商品名称" />
          </Form.Item>
          <Form.Item
            label="价格"
            name="price"
            rules={[{ required: true, message: '请输入价格' }]}
          >
            <InputNumber
              min={0}
              precision={2}
              step={1}
              placeholder="请输入价格"
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item label="分类" name="category" rules={[{ required: true, message: '请选择分类' }]}>
            <Select options={categoryOptions} placeholder="请选择分类" />
          </Form.Item>
          <Form.Item label="有库存" name="inStock" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
