import { describe, expect, test } from 'vitest'
import { inertHtml } from 'foldkit/html'
import { localizeHtml } from './html.ts'

describe('localized HTML builder', () => {
  test('translates text and accessible labels while preserving machine attributes', () => {
    const h = localizeHtml(inertHtml, 'zh-CN')
    expect(
      h.div([h.Id('Continue'), h.Class('Continue'), h.AriaLabel('Continue')], ['Continue']),
    ).toMatchObject(
      inertHtml.div(
        [inertHtml.Id('Continue'), inertHtml.Class('Continue'), inertHtml.AriaLabel('继续')],
        ['继续'],
      )!,
    )
    expect(h.input([h.Value('Continue'), h.Placeholder('Continue')])).toMatchObject({
      sel: 'input',
      data: { props: { value: 'Continue', placeholder: '继续' } },
    })
    expect(h.a([h.Href('/Continue')], ['Continue'])).toMatchObject(
      inertHtml.a([inertHtml.Href('/Continue')], ['继续'])!,
    )
  })

  test('returns the original builder for English', () => {
    expect(localizeHtml(inertHtml, 'en')).toBe(inertHtml)
  })

  test('leaves VNode identity to the real view so a language switch does not remount it', () => {
    const chinese = localizeHtml(inertHtml, 'zh-CN')
    expect(chinese.div([], ['Continue'])).not.toHaveProperty('identity')
  })
})
