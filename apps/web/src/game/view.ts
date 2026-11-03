// Modified by InSnocent for the bilingual fork, 2026-11-03. GPL-3.0-or-later; see LICENSE.
import type { Document, HtmlBuilder } from 'foldkit/html'
import { toast } from '@/components/lab/bits.ts'
import { labScreen } from './screens.ts'
import { titleScreen } from './title.ts'
import type { Message } from './message.ts'
import type { Model } from './model.ts'
import { onBoard } from './route.ts'
import { localizeHtml } from '../i18n/html.ts'
import { languagePicker, sourceLink } from '../i18n/controls.ts'
import { translate } from '../i18n/index.ts'
import { PAGE_TITLE } from '../i18n/metadata.ts'

/* ==========================================================================
   The root view. Quorum is one window: the active screen fills it, and the
   toast floats above it.
   ========================================================================== */

export const view = (model: Model, builder: HtmlBuilder<Message>): Document => {
  const h = localizeHtml(builder, model.locale)
  return {
    title: translate(PAGE_TITLE, model.locale),
    lang: model.locale,
    body: h.div(
      [h.Class('h-dvh w-full overflow-hidden bg-background text-foreground select-none')],
      [
        h.div(
          [h.Key(onBoard(model.route) ? 'board' : 'title'), h.Class('h-full')],
          [onBoard(model.route) ? labScreen(model, h) : titleScreen(model, h)],
        ),
        toast(model.toast, h),
        ...(!onBoard(model.route)
          ? [
              h.div(
                [
                  h.Class(
                    'absolute top-5 right-6 z-50 flex items-center gap-3 compact:top-3 compact:right-3',
                  ),
                ],
                [sourceLink(h), languagePicker(model.locale, h)],
              ),
            ]
          : []),
      ],
    ),
  }
}
