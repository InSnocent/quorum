// Modified for the bilingual fork, 2026-11-03. GPL-3.0-or-later; see LICENSE.
import fs from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const entries = JSON.parse(await fs.readFile(path.join(root, '.localization/sources.json'), 'utf8'))
const translations = JSON.parse(
  await fs.readFile(path.join(root, '.localization/translations.json'), 'utf8'),
)
const overrides = JSON.parse(
  await fs.readFile(path.join(root, 'scripts/localization/overrides.json'), 'utf8'),
)
const slots = (value) => [...value.matchAll(/\{(\d+)\}/g)].map((match) => Number(match[1]))
const valid = (item, target) =>
  typeof target === 'string' &&
  target.trim() !== '' &&
  slots(item.source)
    .filter((index) => !item.optional.includes(index))
    .every((index) => slots(target).includes(index)) &&
  slots(target).every((index) => slots(item.source).includes(index))
const bySource = new Map(entries.map((item) => [item.source, item]))
let derived = 0

// Inbox renders paragraphs separately. Reuse aligned model output instead of retranslating it.
for (const [source, target] of Object.entries(translations)) {
  if (!source.includes('\n')) continue
  for (const separator of ['\n\n', '\n']) {
    const sources = source.split(separator)
    const targets = target.split(separator)
    if (sources.length !== targets.length) continue
    sources.forEach((fragment, index) => {
      const key = fragment.trim()
      const item = bySource.get(key)
      if (!item || translations[key] || !valid(item, targets[index])) return
      translations[key] = targets[index].trim()
      derived += 1
    })
  }
}

const dictionary = {}
const missing = []
for (const item of entries) {
  const initial = overrides[item.source] ?? translations[item.source]
  const target =
    item.source.includes('\n') && typeof initial === 'string'
      ? initial.replaceAll('\\n', '\n')
      : initial
  if (valid(item, target)) {
    dictionary[item.source] = target
      .replaceAll('堆栈', '技术栈')
      .replaceAll('缓存洪流', '缓存惊群')
      .replaceAll('缓存踩踏', '缓存惊群')
      .replaceAll('软体', '软件')
      .replaceAll('资料库', '数据库')
      .replaceAll('伺服器', '服务器')
      .replaceAll('记忆体', '内存')
      .replaceAll('程式码', '代码')
      .replaceAll('程式', '程序')
      .replaceAll('硬碟', '硬盘')
      .replaceAll('磁碟', '磁盘')
  } else missing.push(item.source)
}
Object.assign(dictionary, overrides)
const sorted = Object.fromEntries(
  Object.entries(dictionary).sort(([a], [b]) => a.localeCompare(b, 'en')),
)
const output =
  '// Translated with Index-Translate-2B and reviewed for this fork, 2026-11-03.\n' +
  '// GPL-3.0-or-later; original copy: https://github.com/elianiva/quorum\n' +
  'export const zhCN: Readonly<Record<string, string>> = ' +
  JSON.stringify(sorted, null, 2) +
  '\n'
await fs.writeFile(path.join(root, 'apps/web/src/i18n/zh-CN.ts'), output)
await fs.writeFile(
  path.join(root, '.localization/missing.json'),
  JSON.stringify(missing, null, 2) + '\n',
)
await fs.writeFile(
  path.join(root, '.localization/derived.json'),
  JSON.stringify(translations, null, 2) + '\n',
)
console.log(
  `${Object.keys(sorted).length} compiled; ${derived} derived fragments; ${missing.length} pending`,
)
if (process.argv.includes('--strict') && missing.length) process.exitCode = 1
