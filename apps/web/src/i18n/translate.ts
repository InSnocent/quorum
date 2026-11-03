// Modified for the bilingual fork, 2026-11-03. GPL-3.0-or-later; see LICENSE.
import type { Locale } from './locale.ts'

export type { Locale } from './locale.ts'

const escape = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Translate presentation copy only. Simulation data and saves remain in English. */
export const createTranslator = (
  locale: Locale,
  dictionary: Readonly<Record<string, string>>,
  verbatimSlots: Readonly<Record<string, ReadonlyArray<number>>> = {},
): ((source: string) => string) => {
  if (locale === 'en') return (source) => source
  const templates = Object.entries(dictionary)
    .filter(([source]) => /\{\d+\}/.test(source))
    .map(([source, target]) => ({
      source,
      verbatim: verbatimSlots[source] ?? [],
      target,
      slots: [...source.matchAll(/\{(\d+)\}/g)].map((match) => match[1]!),
      pattern: new RegExp(
        `^${source
          .split(/\{\d+\}/)
          .map(escape)
          .join('([\\s\\S]*?)')}$`,
      ),
      specificity: source.replace(/\{\d+\}/g, '').length,
    }))
    .sort(
      (a, b) =>
        Number(b.verbatim.length > 0) - Number(a.verbatim.length > 0) ||
        b.specificity - a.specificity,
    )
  const cache = new Map<string, string>()

  const translate = (source: string, depth = 0): string => {
    const cached = cache.get(source)
    if (cached !== undefined) return cached
    const trimmed = source.trim()
    if (!trimmed || depth > 4) return source
    let result = trimmed
    if (Object.hasOwn(dictionary, trimmed)) result = dictionary[trimmed]!
    else {
      for (const template of templates) {
        const match = template.pattern.exec(trimmed)
        if (!match) continue
        const values = new Map(template.slots.map((slot, index) => [slot, match[index + 1] ?? '']))
        result = template.target.replace(/\{(\d+)\}/g, (_token, slot: string) => {
          const value = values.get(slot) ?? ''
          return template.verbatim.includes(Number(slot)) ? value : translate(value, depth + 1)
        })
        break
      }
      if (result === trimmed && /(?: · | → |\n)/.test(trimmed)) {
        result = trimmed
          .split(/( · | → |\n)/)
          .map((part) => (/^(?: · | → |\n)$/.test(part) ? part : translate(part, depth + 1)))
          .join('')
      }
    }
    result =
      source.slice(0, source.length - source.trimStart().length) +
      result +
      source.slice(source.trimEnd().length)
    // Dynamic counters cannot grow this cache forever during a long company.
    if (cache.size >= 4096) cache.clear()
    cache.set(source, result)
    return result
  }
  return translate
}
