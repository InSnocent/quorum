// Modified for the bilingual fork, 2026-11-03. GPL-3.0-or-later; see LICENSE.
export const LOCALES = ['zh-CN', 'en'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'zh-CN'
