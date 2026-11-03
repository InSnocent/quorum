// Modified for the bilingual fork, 2026-11-03. GPL-3.0-or-later; see LICENSE.
import { createTranslator } from './translate.ts'
import type { Locale } from './locale.ts'
import { zhCN } from './zh-CN.ts'

export { DEFAULT_LOCALE, LOCALES, type Locale } from './locale.ts'
const chinese = createTranslator('zh-CN', zhCN, {
  'Placed {0}': [0],
  'Placed {0}.': [0],
  'Copied {0}.': [0],
  'Saved {0}: {1} Nodes.': [0],
  'Click to place {0} · Esc': [0],
  'Nothing in {0} can be built yet: {1}.': [0],
})
export const translate = (source: string, locale: Locale): string =>
  locale === 'en' ? source : chinese(source)
