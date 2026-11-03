import { describe, expect, test } from 'vitest'
import { createTranslator } from './translate.ts'

const dictionary = {
  Continue: '继续',
  'App Server': '应用服务器',
  '{0} · cold': '{0} · 冷启动',
  '{0} users are waiting.': '有 {0} 位用户正在等待。',
  'Hello {0},\n\nThe Database is full.': '你好，{0}：\n\n数据库已满。',
  'Buy {0} for {1}': '花费 {1} 购买 {0}',
  'Start a Company': '创办公司',
}

describe('display translation', () => {
  const chinese = createTranslator('zh-CN', dictionary)
  const english = createTranslator('en', dictionary)

  test('switches known copy while keeping English and unknown product names intact', () => {
    expect(chinese('Continue')).toBe('继续')
    expect(english('Continue')).toBe('Continue')
    expect(chinese('Node.js')).toBe('Node.js')
    expect(chinese('')).toBe('')
    expect(chinese('  Continue  ')).toBe('  继续  ')
  })

  test('preserves dynamic values and recursively translates display labels', () => {
    expect(chinese('1,024 users are waiting.')).toBe('有 1,024 位用户正在等待。')
    expect(chinese('App Server · cold')).toBe('应用服务器 · 冷启动')
    expect(chinese('Buy App Server for $1.25k')).toBe('花费 $1.25k 购买 应用服务器')
  })

  test('matches multiline mail without changing its stored English text', () => {
    const letter = 'Hello Leslie,\n\nThe Database is full.'
    expect(chinese(letter)).toBe('你好，Leslie：\n\n数据库已满。')
    expect(english(letter)).toBe(letter)
  })

  test('falls back safely for prototype names and template-like player text', () => {
    expect(chinese('constructor')).toBe('constructor')
    expect(chinese('toString')).toBe('toString')
    expect(chinese('{0} users are waiting.')).toBe('有 {0} 位用户正在等待。')
  })

  test('preserves player-owned template slots even when they match an English copy key', () => {
    const translator = createTranslator(
      'zh-CN',
      {
        Continue: '继续',
        'Saved {0}: {1} Nodes.': '已保存 {0}：{1} 个节点。',
      },
      { 'Saved {0}: {1} Nodes.': [0] },
    )
    expect(translator('Saved Continue: 3 Nodes.')).toBe('已保存 Continue：3 个节点。')
  })

  test('explicit player-name templates win over a generic status suffix', () => {
    const translator = createTranslator(
      'zh-CN',
      {
        'App Server': '应用服务器',
        '{0} · cold': '{0} · 冷启动',
        'Placed {0}': '已放置 {0}',
      },
      { 'Placed {0}': [0] },
    )
    expect(translator('Placed App Server · cold')).toBe('已放置 App Server · cold')
  })
})
