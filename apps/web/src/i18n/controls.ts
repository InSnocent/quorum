// Modified for the bilingual fork, 2026-11-03. GPL-3.0-or-later; see LICENSE.
import type { Html, HtmlBuilder } from 'foldkit/html'
import { Message } from '../game/message.ts'
import type { Locale } from './locale.ts'

export const languagePicker = (locale: Locale, h: HtmlBuilder<Message>): Html =>
  h.div(
    [
      h.Role('group'),
      h.AriaLabel('Language / 语言'),
      h.Class('flex gap-1 rounded-lg bg-surface p-1 shadow-card'),
    ],
    (
      [
        ['zh-CN', '简体中文'],
        ['en', 'English'],
      ] as const
    ).map(([value, name]) =>
      h.button(
        [
          h.Type('button'),
          h.AriaPressed(locale === value ? 'true' : 'false'),
          h.OnClick(Message.LocaleChosen({ locale: value })),
          h.Class(
            `rounded-md px-2.5 py-1.5 text-[12px] font-medium ${locale === value ? 'bg-primary-fill text-on-primary-fill' : 'text-muted-foreground hover:bg-well'}`,
          ),
        ],
        [name],
      ),
    ),
  )

export const sourceLink = (h: HtmlBuilder<Message>): Html =>
  h.a(
    [
      h.Href('https://github.com/InSnocent/quorum'),
      h.Target('_blank'),
      h.Rel('noopener noreferrer'),
      h.Class(
        'rounded-md px-2 py-1.5 text-[12px] text-muted-foreground underline-offset-4 hover:underline',
      ),
    ],
    ['Source & license'],
  )

export const licenseNotice = (h: HtmlBuilder<Message>): Html =>
  h.p(
    [h.Class('text-[11px] leading-relaxed text-muted-foreground')],
    [
      'Based on elianiva/quorum. No warranty.',
      ' ',
      h.a(
        [
          h.Href('https://github.com/InSnocent/quorum/blob/main/LICENSE'),
          h.Target('_blank'),
          h.Rel('noopener noreferrer'),
          h.Class('underline underline-offset-2'),
        ],
        ['GPL-3.0-or-later'],
      ),
    ],
  )
