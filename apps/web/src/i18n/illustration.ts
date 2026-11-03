// Modified for the bilingual fork, 2026-11-03. GPL-3.0-or-later; see LICENSE.
import { translate, type Locale } from './index.ts'

const originals = new WeakMap<Element, Readonly<{ text: string | null; label: string | null }>>()

/** The title illustration owns a raw SVG subtree, outside Foldkit's VDOM. */
export const localizeIllustration = (root: ParentNode, locale: Locale): void => {
  for (const element of root.querySelectorAll('svg[aria-label], svg text, svg title, svg desc')) {
    let source = originals.get(element)
    if (!source) {
      source = {
        text: element.tagName.toLowerCase() === 'svg' ? null : element.textContent,
        label: element.getAttribute('aria-label'),
      }
      originals.set(element, source)
    }
    if (source.text !== null) element.textContent = translate(source.text, locale)
    if (source.label !== null) element.setAttribute('aria-label', translate(source.label, locale))
  }
}
