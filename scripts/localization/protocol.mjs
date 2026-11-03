// Modified for the bilingual fork, 2026-11-03. GPL-3.0-or-later; see LICENSE.
export const decodeTranslations = (content, expectedKeys) => {
  const start = content.indexOf('{')
  const end = content.lastIndexOf('}')
  const translated = JSON.parse(content.slice(start, end + 1))
  if (
    !translated ||
    Array.isArray(translated) ||
    Object.keys(translated).length !== expectedKeys.length ||
    expectedKeys.some(
      (key) => !Object.hasOwn(translated, key) || typeof translated[key] !== 'string',
    )
  )
    throw new Error(
      'The model changed the batch keys; reject the entire batch to prevent shifted translations',
    )
  return translated
}
