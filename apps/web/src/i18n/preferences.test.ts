import { describe, expect, test } from 'vitest'
import { Schema } from 'effect'
import { Prefs } from '../game/model.ts'
import { initialModel, update } from '../game/update.ts'
import { Message } from '../game/message.ts'
import { CHALLENGES } from '@quorum/simulation/challenges'

describe('language preferences', () => {
  test('a fresh game defaults to Simplified Chinese', () => {
    expect(initialModel()).toHaveProperty('locale', 'zh-CN')
  })

  test('preferences saved by the English upstream remain readable', () => {
    const previous = { seenTradeoffs: [], muted: true, motion: 'reduce' }
    const decoded = Schema.decodeUnknownSync(Prefs)(previous)
    expect(decoded).toMatchObject({ ...previous, locale: 'zh-CN' })
  })

  test('switching languages preserves the exact Game and saves the preference', () => {
    const before = initialModel()
    const result = update(before, Message.LocaleChosen({ locale: 'en' }))
    expect(result.model.locale).toBe('en')
    expect(result.model.game).toBe(before.game)
    expect(result.commands?.map((command) => command.name)).toEqual(
      expect.arrayContaining(['WritePrefs', 'ApplySettings', 'SyncBoard']),
    )
    expect(result.commands?.find((command) => command.name === 'WritePrefs')?.args).toMatchObject({
      prefs: { locale: 'en' },
    })
  })

  test('a stored English preference is restored', () => {
    const result = update(
      initialModel(),
      Message.PrefsLoaded({
        json: JSON.stringify({ locale: 'en', muted: false, motion: 'system', seenTradeoffs: [] }),
      }),
    )
    expect(result.model.locale).toBe('en')
  })

  test.each([
    Message.NewCompanyStarted(),
    Message.PreseedStarted(),
    Message.FreeSandboxStarted(),
    Message.ChallengeStarted({ id: CHALLENGES[0]!.id }),
  ])('keeps language and settings when entering a board: $_tag', (message) => {
    const before = {
      ...initialModel(),
      locale: 'en' as const,
      muted: true,
      motion: 'reduce' as const,
    }
    const result = update(before, message)
    expect(result.model.game).not.toBe(before.game)
    expect(result.model).toMatchObject({ locale: 'en', muted: true, motion: 'reduce' })
  })
})
