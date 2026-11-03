// Modified for the bilingual fork, 2026-11-03. GPL-3.0-or-later; see LICENSE.
import fs from 'node:fs/promises'
import { execFileSync } from 'node:child_process'

const reference = process.env.UPSTREAM_REF ?? '5fd418577ba2b3f1ce22c4d26d877d51a8c232ca'
const source = execFileSync('git', ['show', `${reference}:README.md`], { encoding: 'utf8' })
const english =
  '[简体中文](README.md) | **English**\n\n' +
  '> This bilingual fork is maintained by [InSnocent](https://github.com/InSnocent/quorum). ' +
  'Original game: [elianiva/quorum](https://github.com/elianiva/quorum) by Dicha Zelianivan Arkana. ' +
  'Changes dated 2026-11-03: Simplified Chinese / English UI, persistent language preference, ' +
  'Chinese glossary search and documentation. See [MODIFICATIONS.md](MODIFICATIONS.md). ' +
  'The complete fork remains GPL-3.0-or-later; the original LICENSE and third-party notices are preserved.\n\n' +
  source
await fs.mkdir('.localization', { recursive: true })
await fs.writeFile('.localization/README.en.md', english)
const response = await fetch('http://127.0.0.1:14514/v1/chat/completions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'Index-Translate-2B',
    temperature: 0,
    max_tokens: 7000,
    messages: [
      {
        role: 'user',
        content:
          'Translate the following README from English into Simplified Chinese. Preserve all Markdown syntax, HTML tags, links, file paths, code blocks and commands. Preserve the names Quorum, Foldkit, Effect, Alchemy, Cloudflare, Node.js, Go, Rust, PHP. Use Insight=洞察, Legacy=传承, Design=架构, Burn=开销, Playbook=架构方案. Return only the translated document, without a surrounding code fence.\n\n' +
          source,
      },
    ],
  }),
  signal: AbortSignal.timeout(180_000),
})
if (!response.ok) throw new Error(`Translation HTTP ${response.status}`)
const result = await response.json()
await fs.writeFile('.localization/readme-result.json', JSON.stringify(result, null, 2) + '\n')
const chinese = result.choices?.[0]?.message?.content
if (!chinese || result.choices[0].finish_reason !== 'stop')
  throw new Error('README translation was incomplete')
await fs.writeFile('.localization/README.zh-CN.md', chinese + '\n')
console.log('README translated; draft is in .localization/README.zh-CN.md')
