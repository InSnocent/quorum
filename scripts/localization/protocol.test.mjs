import { test } from 'node:test'
import assert from 'node:assert/strict'
import { decodeTranslations } from './protocol.mjs'

await test('accepts a complete translation object in an optional code fence', () => {
  assert.deepEqual(decodeTranslations('```json\n{"0":"数据库","1":"缓存"}\n```', ['0', '1']), {
    0: '数据库',
    1: '缓存',
  })
})

await test('rejects a missing key before any shifted value can enter the dictionary', () => {
  assert.throws(
    () => decodeTranslations('{"0":"数据库","1":"缓存"}', ['0', '1', '2']),
    /batch keys/,
  )
})

await test('rejects extra keys and non-text values', () => {
  assert.throws(() => decodeTranslations('{"0":"数据库","1":"缓存"}', ['0']), /batch keys/)
  assert.throws(() => decodeTranslations('{"0":false}', ['0']), /batch keys/)
})

await test('rejects malformed JSON', () => {
  assert.throws(() => decodeTranslations('{"0":"数据库"', ['0']), SyntaxError)
})
