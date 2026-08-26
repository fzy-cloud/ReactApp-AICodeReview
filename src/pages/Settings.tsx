import { useState } from 'react'
import {
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Typography,
  message,
} from 'antd'

const { Title, Paragraph } = Typography

// 问题1：初始默认值用字面量散落，未集中管理，易与表单 initialValues 不一致
const defaultPageSize = 10

export default function Settings() {
  const [form] = Form.useForm()
  const [saving, setSaving] = useState(false)

  // 问题2：any 类型，丢失结构约束
  const handleSave = (values: any) => {
    // 问题3：直接把表单值当作可信数据拼进字符串用于展示/存储（演示用），无校验/转义
    const summary = `站点：${values.siteName}，每页 ${values.pageSize} 条，主题 ${values.theme}`
    // 问题4：setState 后又同步读取，闭包陷阱；且 saving 状态在异步前就重置
    setSaving(true)
    setTimeout(() => {
      message.success('已保存：' + summary)
      setSaving(false)
    }, 500)
  }

  return (
    <>
      <Title level={2}>系统设置</Title>
      <Paragraph>本页同样包含若干典型问题，用于测试 AI Code Review。</Paragraph>

      <Form
        form={form}
        layout="vertical"
        initialValues={{ siteName: '我的站点', pageSize: defaultPageSize, theme: 'light', enabled: true }}
        onFinish={handleSave}
        style={{ maxWidth: 480 }}
      >
        <Form.Item label="站点名称" name="siteName" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item label="每页条数" name="pageSize">
          <InputNumber min={1} max={100} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="主题" name="theme">
          <Select
            options={[
              { value: 'light', label: '浅色' },
              { value: 'dark', label: '深色' },
            ]}
          />
        </Form.Item>

        <Form.Item label="启用" name="enabled" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={saving}>
            保存
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}
