import { Typography } from 'antd'

const { Title, Paragraph } = Typography

export default function About() {
  return (
    <>
      <Title level={2}>关于</Title>
      <Paragraph>
        这是一个使用 React 19 + TypeScript + antd + react-router 构建的演示项目。
      </Paragraph>
      <Paragraph>
        页面通过 GitHub Actions 自动构建、测试，并部署到 GitHub Pages。
      </Paragraph>
    </>
  )
}
