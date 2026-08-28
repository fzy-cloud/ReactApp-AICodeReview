// 发布 AI 评审结果到 PR：读取 review.json（由 scripts/ai-review.mjs 生成），
// 通过 gh CLI 发起「行内评论」与「顶层总评」。
//
// 为什么不用 actions/github-script：在它的 script: 里用 ${{ steps.xxx.outputs.yyy }}
// 注入 JSON 会被 GitHub 先做文本替换，JSON 内的反引号/`${}` 会破坏外层模板字符串，
// 导致 SyntaxError: missing ) after argument list。改为文件 + gh CLI 彻底绕开该坑。

import fs from 'node:fs'
import { execFileSync } from 'node:child_process'

const prNumber = process.env.PR_NUMBER
const headSha = process.env.HEAD_SHA
const repoFull = process.env.GITHUB_REPOSITORY || '' // 形如 owner/repo
const [owner, repo] = repoFull.split('/')

if (!prNumber || !headSha || !owner || !repo) {
  console.error('缺少必要的环境变量：PR_NUMBER / HEAD_SHA / GITHUB_REPOSITORY')
  process.exit(0) // 不阻塞流水线
}

let result
try {
  result = JSON.parse(fs.readFileSync('review.json', 'utf8'))
} catch (e) {
  console.error('读取 review.json 失败：', e.message)
  process.exit(0)
}

const comments = Array.isArray(result.comments) ? result.comments : []

// 发起一次 GitHub REST 写操作（gh api 自动使用 GITHUB_TOKEN）
// 用 execFileSync + 数组参数，避免把 JSON 拼进 shell 命令行引发转义问题；
// 在 Linux runner 上 execvp 会按 PATH 找到 gh，Windows 上会按 PATHEXT 解析 gh.exe。
function ghPost(apiPath, payloadObj) {
  const payload = JSON.stringify(payloadObj)
  return execFileSync('gh', ['api', '-X', 'POST', apiPath, '--input', '-'], {
    input: Buffer.from(payload),
    maxBuffer: 16 * 1024 * 1024,
  }).toString()
}

// 行内评论：失败则降级到顶层，避免意见丢失
const fallback = []
for (const c of comments) {
  if (!c.path || c.line == null) {
    fallback.push(c) // 本就无法定位行的，直接放顶层
    continue
  }
  try {
    ghPost(`/repos/${owner}/${repo}/pulls/${prNumber}/comments`, {
      body: `**[${c.severity || 'info'}] ${c.category || ''}**\n\n${c.body}`,
      commit_id: headSha,
      path: c.path,
      line: Number(c.line),
      side: 'RIGHT',
    })
  } catch (e) {
    console.warn(`行内评论失败 ${c.path}:${c.line} - ${e.message}`)
    fallback.push(c)
  }
}

// 顶层总评：变更摘要 + 风险分级 + 降级/无法定位的评论
const riskMap = {
  block: '🚫 阻塞（必须修复才能合并）',
  warn: '⚠️ 建议（应该修复）',
  info: 'ℹ️ 参考',
  none: '✅ 无明显问题',
}
const risk = riskMap[result.risk] || 'ℹ️ 参考'

let body = `## 🤖 AI Code Review（智谱 GLM · gsd 对抗性标准）\n\n`
body += `**整体风险分级**：${risk}\n\n`
body += `**变更摘要**：${result.summary || '（无）'}\n\n`

if (fallback.length) {
  body += `### 其他意见（无法定位到具体行 / 行内发布失败）\n`
  for (const c of fallback) {
    const loc = c.path ? `${c.path}${c.line != null ? ':' + c.line : ''} ` : ''
    body += `- **[${c.severity || 'info'}] ${c.category || ''}** ${loc}${c.body}\n`
  }
} else if (comments.length === 0) {
  body += `本次变更未发现问题，整体良好。\n`
} else {
  body += `以上意见均已作为行内评论发布到对应代码位置。\n`
}

try {
  ghPost(`/repos/${owner}/${repo}/issues/${prNumber}/comments`, { body })
  console.log('✅ AI 评审评论已发布到 PR #' + prNumber)
} catch (e) {
  console.error('发布顶层总评失败：', e.message)
  process.exit(0) // 行内评论已发出，顶层失败不阻塞
}
