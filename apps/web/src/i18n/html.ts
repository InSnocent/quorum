// Modified for the bilingual fork, 2026-11-03. GPL-3.0-or-later; see LICENSE.
// Transparent element factory: the documented brand-module marker prevents
// Foldkit from stamping these forwarding functions before the real view does.
import 'foldkit/brand'
import { inertHtml, type Html, type HtmlBuilder } from 'foldkit/html'
import { translate, type Locale } from './index.ts'

const textAttributes = new Set(['AriaLabel', 'AriaDescription', 'Title', 'Alt', 'Placeholder'])

/** Names imported in a player-authored Playbook are data, even when they match a copy key. */
export const verbatimText = (source: string): Html => inertHtml.span([], [source])

/** Adapt the builder at the view boundary; keys, events, URLs and input values stay untouched. */
export const localizeHtml = <Message>(
  builder: HtmlBuilder<Message>,
  locale: Locale,
): HtmlBuilder<Message> => {
  if (locale === 'en') return builder
  const methods = new Map<PropertyKey, unknown>()
  return new Proxy(builder, {
    get(target, property, receiver) {
      const value: unknown = Reflect.get(target, property, receiver)
      if (typeof property !== 'string' || typeof value !== 'function') return value
      if (methods.has(property)) return methods.get(property)
      const method = (...args: unknown[]): unknown => {
        if (textAttributes.has(property) && typeof args[0] === 'string') {
          args[0] = translate(args[0], locale)
        } else if (/^[a-z]/.test(property) && Array.isArray(args[1])) {
          args[1] = args[1].map((child: unknown) =>
            typeof child === 'string' ? translate(child, locale) : child,
          )
        }
        return Reflect.apply(value, target, args)
      }
      methods.set(property, method)
      return method
    },
  })
}
