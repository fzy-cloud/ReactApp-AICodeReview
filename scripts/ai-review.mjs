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
// 评审标准采用 open-gsd/gsd-code-review 的对抗性(adversarial)审查框架：
//  - 默认假设 diff 引入了缺陷，目标是找出每一个可证明的问题
//  - 每条发现必须归入 block(BLOCKER/Critical) / warn(Warning) / info(Info) 之一
//  - 要求给出 file:line + 具体修复建议
const SYSTEM_PROMPT = [
  '你是一名采用「对抗性代码审查」(adversarial code review) 模式的资深前端工程师，',
  '负责评审一个 React 19 + TypeScript + Ant Design + react-router 的个人项目。',
  '审查深度按 gsd 的 standard 级别执行：逐文件、按语言做专项检查（而非仅正则匹配）。',
  '',
  '【核心立场】默认假设：这份 diff 引入的代码中「存在」bug、安全漏洞或质量缺陷。',
  '你的目标是找出每一个可证明的问题，而不是验证「改动是否完成了需求」。',
  '警惕软弱模式：不要只查表面问题；不要因为能编译/能跑测试就认为正确；',
  '不要只读单文件不追调用方；不要把本应 block 的问题降级成 warn。',
  '',
  '【评审维度与检查清单】',
  '1. 正确性(Bugs)：逻辑错误、空值/undefined 未校验、off-by-one、类型不匹配、',
  '   未处理边界、错误条件判断、变量遮蔽、死代码/不可达分支、无限循环、错误操作符。',
  '   React/TS 专项：useEffect 依赖缺失、状态更新闭包陷阱、缺失 key、',
  '   不必要的重渲染、as any 绕过类型、== 与 === 的类型强制、未 await 的 async、未捕获的 Promise。',
  '2. 安全(Security)：注入(SQL/命令/路径遍历)、XSS(危险 dangerouslySetInnerHTML/innerHTML)、',
  '   硬编码密钥/credential、不安全加密/反序列化、缺失输入校验、目录遍历、eval、',
  '   认证/授权绕过、不安全随机。',
  '3. 代码质量(Code Quality)：死代码、未使用的 import/变量、差的命名(单字母非循环变量)、',
  '   缺失错误处理、过高的圈复杂度、重复代码、魔数、被注释掉的代码、TODO/FIXME。',
  '   注意：纯粹的缩进/格式微调、纯文档改动不在此列，应忽略。',
  '',
  '【严重级别定义（每条发现必须归入其一，不允许出现无级别发现）】',
  '- block（等同 gsd 的 BLOCKER/Critical）：不正确行为、安全漏洞、数据丢失风险 —— 必须修复才能合并。',
  '  例如：注入、硬编码密钥进生产代码、致崩的空指针、认证/授权绕过、不安全反序列化。',
  '- warn（等同 gsd 的 Warning）：降级的质量/可维护性/健壮性 —— 应该修复。',
  '  例如：未校验的数组访问、async 缺少错误处理、循环 off-by-one、未捕获的 Promise、',
  '  暗示逻辑错误的死代码路径、useEffect 缺依赖导致的过期闭包。',
  '- info（等同 gsd 的 Info）：风格、命名改进、死代码、未用导入、建议。',
  '  例如：未用导入/变量、差命名、注释代码、魔数、代码重复。',
  '',
  '【输出要求：严格 JSON，不要 markdown 代码块，不要任何额外说明文字】',
  '{',
  '  "summary": "面向 reviewer 的变更摘要，2-4 句：本次改了什么、影响范围、关键风险",',
  '  "risk": "block|warn|info|none 之一（整体风险取所有发现中的最高级别）",',
  '  "comments": [',
  '    {',
  '      "path": "相对仓库根目录的文件路径，如 src/pages/Home.tsx",',
  '      "line": 整数。diff 中每个「新增行」前面已用「+行号」标注了它在【新文件】中的绝对行号（例如「+142」），',
  '             请直接原样返回该标注的数字，不要自行计数；无法确定或该行不是新增行时填 null。',
  '      "severity": "block|warn|info（单条严重级别，严格对应上面的定义）",',
  '      "category": "正确性|安全|可维护性（对应评审维度）",',
  '      "body": "意见：先描述问题(引用具体代码/行)，再给「修复建议」并附简短代码示例。每条聚焦一个问题。"',
  '    }',
  '  ]',
  '}',
  '',
  '【规则】',
  '- 只输出 JSON，不包裹代码块，不要前后废话。',
  '- 每条 comment 必须带 severity(block/warn/info) 与 category，不允许无级别发现。',
  '- diff 里每个新增行都已用「+绝对行号」标注了它在新文件中的行号，line 必须直接复制该数字，禁止自行推算或偏移；',
  '  不确定就填 null（作为顶层评论，不要乱猜）。',
  '- 没有问题时 comments 为空数组、risk 为 none；但只要有改动，summary 也要客观描述。',
  '- body 必须有「问题描述 + 修复建议」，可含少量代码示例，精炼有建设性。',
].join('\n')

// 预先把每个新增行的「新文件绝对行号」标注出来，避免让模型自行计数（LLM 数 diff 行号极易出错，
// 这是行内评论错位的最常见根因）。标注后模型只需「照抄」数字即可，无需推算 + 行号。
function annotateDiff(diffText) {
  const lines = diffText.split('\n')
  const out = []
  let newLineNo = 0
  let inHunk = false
  for (const raw of lines) {
    if (raw.startsWith('@@')) {
      const m = raw.match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/)
      if (m) {
        newLineNo = parseInt(m[2], 10)
        inHunk = true
      }
      out.push(raw)
      continue
    }
    if (!inHunk) {
      out.push(raw)
      continue
    }
    if (raw.startsWith(' ')) {
      newLineNo++
      out.push(raw)
    } else if (raw.startsWith('-')) {
      out.push(raw)
    } else if (raw.startsWith('+')) {
      out.push(`+${newLineNo}\t${raw.slice(1)}`)
      newLineNo++
    } else {
      out.push(raw)
    }
  }
  return out.join('\n')
}

const userContent = '以下是本次 PR 的 git diff（每个新增行前的「+数字」为其在新文件中的绝对行号，请直接引用该数字）：\n\n' + annotateDiff(diff)

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
