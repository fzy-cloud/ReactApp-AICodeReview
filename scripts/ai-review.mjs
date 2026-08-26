// AI Code Review 脚本（智谱 GLM，OpenAI 兼容接口）
// 用法：
//   ZHIPU_API_KEY=xxx node scripts/ai-review.mjs "<diff 文本>"
// 输出：评审结果 JSON（写到 stdout），结构见下方 schema。供 workflow 解析后：
//   - 行内评论 -> 通过 GitHub API 发布到 PR 对应文件/行
//   - 总体意见 -> 发布为 PR 顶层评论
//
// 设计目标：个人免费、不依赖公司资源、仅 PR 触发、结构化输出支持行内评论与风险分级。

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
  console.log(JSON.stringify({ summary: '本次 PR 没有可评审的代码变更。', risk: 'none', comments: [] }))
  process.exit(0)
}

// 用单引号字符串拼接，避免与模板字符串反引号冲突
const SYSTEM_PROMPT = [
  '你是一名资深前端工程师，负责评审一个 React 19 + TypeScript + Ant Design + react-router 的个人项目。',
  '请基于给出的 git diff 只评审增量变更，遵循以下维度：',
  '1. 正确性：明显逻辑错误、边界条件、空值/未定义处理。',
  '2. 规范一致性：命名、目录约定、团队代码风格。',
  '3. 风险点：XSS/注入等前端安全问题、性能隐患（不必要的重渲染、大依赖引入、useEffect 缺依赖等）。',
  '4. 可维护性：重复代码、超长函数、缺失的关键注释。',
  '',
  '输出要求（严格的 JSON，不要包含任何 markdown 代码块标记，不要任何额外说明文字）：',
  '{',
  '  "summary": "一段面向 reviewer 的变更摘要，2-4 句说明本次改了什么、影响范围",',
  '  "risk": "block|warn|info|none 之一（整体风险分级：block=阻塞需修改，warn=建议修改，info=仅供参考，none=无明显问题）",',
  '  "comments": [',
  '    {',
  '      "path": "相对仓库根目录的文件路径，如 src/pages/Home.tsx",',
  '      "line": 行号（整数）。注意：必须是该文件 diff 中「新增/修改行」（以 + 开头的行）的行号，',
  '             即 GitHub 行内评论右侧(RIGHT)的行号，不是文件绝对行号；若无法确定或该行不是新增行，填 null。',
  '      "severity": "block|warn|info（单条风险分级）",',
  '      "category": "正确性|规范|风险|可维护性",',
  '      "body": "具体意见：问题描述 + 修改建议（可含简短代码示例）"',
  '    }',
  '  ]',
  '}',
  '',
  '规则：',
  '- 只输出 JSON，不要代码块包裹，不要前后废话。',
  '- line 必须是 diff 中「新增/修改行」(以 + 开头) 的行号，且对应 GitHub 右侧(RIGHT)。',
  '  不确定该行的位置、或该行不是新增行时，务必填 null（将作为顶层评论展示，不要乱猜行号）。',
  '- 忽略纯格式、文档微调等无关内容；没有问题时 comments 为空数组、risk 为 none。',
  '- 行内评论尽量精炼、有建设性，每条聚焦一个问题。',
].join('\n')

const userContent = '以下是本次 PR 的 git diff：\n\n' + diff

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
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    }),
  })

  if (!resp.ok) {
    const errText = await resp.text()
    console.error(`智谱接口请求失败：HTTP ${resp.status}\n${errText}`)
    process.exit(1)
  }

  const data = await resp.json()
  const raw = data?.choices?.[0]?.message?.content?.trim()
  if (!raw) {
    console.error('智谱接口返回内容为空')
    process.exit(1)
  }

  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    parsed = { summary: 'AI 返回内容无法解析为结构化数据，原始内容如下：', risk: 'info', comments: [], raw }
  }

  const result = {
    summary: typeof parsed.summary === 'string' ? parsed.summary : '',
    risk: ['block', 'warn', 'info', 'none'].includes(parsed.risk) ? parsed.risk : 'info',
    comments: Array.isArray(parsed.comments) ? parsed.comments : [],
    raw: parsed.raw,
  }
  console.log(JSON.stringify(result))
}

main().catch((e) => {
  console.error('评审脚本异常：', e)
  process.exit(1)
})
