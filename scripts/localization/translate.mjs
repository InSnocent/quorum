// Modified for the bilingual fork, 2026-11-03. GPL-3.0-or-later; see LICENSE.
import fs from 'node:fs/promises'
import path from 'node:path'
import { decodeTranslations } from './protocol.mjs'

const root = process.cwd()
const endpoint = process.env.TRANSLATION_API ?? 'http://127.0.0.1:14514/v1'
const model = process.env.TRANSLATION_MODEL ?? 'Index-Translate-2B'
const entries = JSON.parse(await fs.readFile(path.join(root, '.localization/sources.json'), 'utf8'))
const cachePath = path.join(root, '.localization/translations.json')
let cache = {}
try {
  cache = JSON.parse(await fs.readFile(cachePath, 'utf8'))
} catch {
  /* First run. */
}
const failures = []
const placeholders = (value) =>
  [...value.matchAll(/\{(\d+)\}/g)].map((match) => Number(match[1])).sort((a, b) => a - b)
const valid = (item, value) => {
  if (typeof value !== 'string' || value.trim() === '') return false
  const required = placeholders(item.source).filter((index) => !item.optional.includes(index))
  const received = placeholders(value)
  return (
    required.every((index) => received.includes(index)) &&
    received.every((index) => placeholders(item.source).includes(index))
  )
}

async function request(batch) {
  const payload = Object.fromEntries(
    batch.map((item, index) => [
      String(index),
      item.source.replace(/\{(\d+)\}/g, (token, slot) =>
        item.optional.includes(Number(slot)) ? '' : token,
      ),
    ]),
  )
  const prompt =
    'Translate the VALUES of this JSON object from English to Simplified Chinese. Return only the same JSON object with translated values. Keep numeric keys and all {0}, {1}, {2} placeholders unchanged. Preserve JSON escapes, technical product names (PHP, Node.js, Go, Rust, PostgreSQL, Redis, Apdex), numbers and units. Use these terms consistently: App Server=应用服务器, Database=数据库, Cache=缓存, Insight=洞察, Legacy=传承, Research=研究, Playbook=架构方案, Runbook=应急预案, Burn=开销, Cash=现金, Equity=股权, Era=阶段, Design=架构, Dev Hours=开发工时, Bottleneck=瓶颈. Do not explain.\n\n' +
    JSON.stringify(payload)
  const response = await fetch(`${endpoint}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      temperature: 0,
      max_tokens: 6500,
      messages: [{ role: 'user', content: prompt }],
    }),
    signal: AbortSignal.timeout(180_000),
  })
  if (!response.ok) throw new Error(`Translation HTTP ${response.status}`)
  const result = await response.json()
  const content = result.choices?.[0]?.message?.content ?? ''
  await fs.appendFile(
    path.join(root, '.localization/model-responses.jsonl'),
    JSON.stringify({ model, sources: payload, result: content, usage: result.usage }) + '\n',
  )
  return decodeTranslations(content, Object.keys(payload))
}

async function translate(batch) {
  try {
    const result = await request(batch)
    const invalid = []
    batch.forEach((item, index) => {
      if (valid(item, result[String(index)])) cache[item.source] = result[String(index)].trim()
      else invalid.push(item)
    })
    if (invalid.length === batch.length && batch.length === 1) failures.push(batch[0].source)
    else if (invalid.length) for (const item of invalid) await translate([item])
  } catch (error) {
    if (batch.length === 1) {
      failures.push(batch[0].source)
      console.log(`RETRY NEEDED: ${batch[0].source.slice(0, 80)} (${error.message})`)
    } else {
      const middle = Math.ceil(batch.length / 2)
      await translate(batch.slice(0, middle))
      await translate(batch.slice(middle))
    }
  }
  await fs.writeFile(cachePath, JSON.stringify(cache, null, 2) + '\n')
}

const pending = entries.filter((item) => !valid(item, cache[item.source]))
let batch = []
let chars = 0
for (const item of pending) {
  if (
    batch.length &&
    (batch.length >= (process.env.TRANSLATION_SINGLE === '1' ? 1 : 18) ||
      chars + item.source.length > 3600)
  ) {
    await translate(batch)
    console.log(`${Object.keys(cache).length}/${entries.length} translated`)
    batch = []
    chars = 0
  }
  batch.push(item)
  chars += item.source.length
}
if (batch.length) await translate(batch)
await fs.writeFile(
  path.join(root, '.localization/failures.json'),
  JSON.stringify(failures, null, 2) + '\n',
)
console.log(`DONE: ${Object.keys(cache).length}/${entries.length}; ${failures.length} need review`)
