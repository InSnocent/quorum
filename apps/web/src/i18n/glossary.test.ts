import { expect, test } from 'vitest'
import { GLOSSARY } from '@quorum/simulation/catalog'
import { matches } from '../components/lab/glossary.ts'

test('the Chinese glossary accepts both Chinese and English search terms', () => {
  const entry = GLOSSARY.find((item) => item.id === 'cache-stampede')!
  expect(matches(entry, '缓存惊群', 'zh-CN')).toBe(true)
  expect(matches(entry, 'stampede', 'zh-CN')).toBe(true)
  expect(matches(entry, 'stampede', 'en')).toBe(true)
  expect(matches(entry, 'no-such-term-123', 'zh-CN')).toBe(false)
})
