// Modified for the bilingual fork, 2026-11-03. GPL-3.0-or-later; see LICENSE.
import { translate, type Locale } from './index.ts'

export const PAGE_TITLE = 'Quorum — a systems design game for software engineers'
const DESCRIPTION =
  'Grow a startup from one server in a garage to a public company. Wire components, pick stacks, and fix one real bottleneck after another in an incremental systems design game.'
const SOCIAL_DESCRIPTION =
  'Grow a startup from one server in a garage to a public company, one real bottleneck at a time.'

export const applyMetadata = (locale: Locale): void => {
  const values = [
    ['meta[name="description"]', DESCRIPTION],
    ['meta[property="og:title"]', PAGE_TITLE],
    ['meta[name="twitter:title"]', PAGE_TITLE],
    ['meta[property="og:description"]', SOCIAL_DESCRIPTION],
    ['meta[name="twitter:description"]', SOCIAL_DESCRIPTION],
  ] as const
  for (const [selector, source] of values) {
    document.querySelector(selector)?.setAttribute('content', translate(source, locale))
  }
  document
    .querySelector('meta[property="og:locale"]')
    ?.setAttribute('content', locale === 'en' ? 'en_US' : 'zh_CN')
}
