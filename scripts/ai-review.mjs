// AI Code Review 脚本（智谱 GLM，OpenAI 兼容接口）
// 用法：
//   ZHIPU_API_KEY=xxx node scripts/ai-review.mjs "<diff 文本>"
// 输出：评审 Markdown 文本（直接用于 PR comment）
//
// 设计目标：个人免费、不依赖公司资源、仅 PR 触发。

import process from 'node:process'

const API_BASE = process.env.ZHIPU_API_BASE || 'https://open.bigmodel.cn/api/paas/v4'
const MODEL = process.env.ZHIPU_MODEL || 'glm-4-flash'
const API_KEY = process.env.ZHIPU_API_KEY

if (!API_KEY) {
  console.error('缺少环境变量 ZHIPU_API_KEY')
  process.exit(1)
}

const diff = process.argv[2] || ''
if (!diff.trim()) {
  // 没有 diff 就直接结束，不报错（例如 PR 无代码变更）
  console.log('本次 PR 没有可评审的代码变更。')
  process.exit(0)
}

const SYSTEM_PROMPT = `你是一名资深前端工程师，负责对一个 React 19 + TypeScript + Ant Design + react-router 的个人项目做代码评审。
请基于下面给出的 git diff 给出简洁、有建设性的中文评审意见，遵循以下规则：
1. 只关注真正重要的问题：明显的 bug、类型安全、React 19 最佳实践、antd 误用、路由/性能问题、安全隐患。
2. 忽略格式、纯文本改动、文档微调等无关紧要的内容。
3. 每条意见包含：文件路径(行号可选)、问题简述、修改建议（可用简短代码示例）。
4. 如果整体质量良好，请明确说“整体良好，无需修改”。
5. 使用 Markdown 格式，控制在合理长度，不要啰嗦。`

const userContent = `以下是本次 PR 的 git diff：\n\n\`\`\`diff\n${diff}\n\`\`\``

async function main() {
  const resp = await fetch(`${API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
      temperature: 0.2,
      max_tokens: 2000,
    }),
  })

  if (!resp.ok) {
    const errText = await resp.text()
    console.error(`智谱接口请求失败：HTTP ${resp.status}\n${errText}`)
    process.exit(1)
  }

  const data = await resp.json()
  const review = data?.choices?.[0]?.message?.content?.trim()
  if (!review) {
    console.error('智谱接口返回内容为空')
    process.exit(1)
  }
  console.log(review)
}

main().catch((e) => {
  console.error('评审脚本异常：', e)
  process.exit(1)
})
