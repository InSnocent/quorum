// Modified for the bilingual fork, 2026-11-03. GPL-3.0-or-later; see LICENSE.
import fs from 'node:fs/promises'
import { zhCN } from '../../apps/web/src/i18n/zh-CN.ts'

const entries = JSON.parse(await fs.readFile('.localization/sources.json', 'utf8'))
const slots = (value) => [...value.matchAll(/\{(\d+)\}/g)].map((match) => Number(match[1]))
const failures = []
for (const item of entries) {
  const value = zhCN[item.source]
  const sourceSlots = slots(item.source)
  if (typeof value !== 'string' || !value.trim()) failures.push(`Missing: ${item.source}`)
  else if (
    sourceSlots
      .filter((slot) => !item.optional.includes(slot))
      .some((slot) => !slots(value).includes(slot)) ||
    slots(value).some((slot) => !sourceSlots.includes(slot))
  )
    failures.push(`Placeholders: ${item.source}`)
}
for (const [source, target] of Object.entries(zhCN)) {
  if (/[\u3040-\u30ff]/.test(target)) failures.push(`Unexpected Japanese text: ${source}`)
}
if (failures.length) {
  console.error(failures.join('\n'))
  process.exitCode = 1
} else
  console.log(`${entries.length} source entries covered; placeholders and output language checked`)
