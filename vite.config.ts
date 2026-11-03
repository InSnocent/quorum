// Modified by InSnocent for Windows verification, 2026-11-03. GPL-3.0-or-later.
import { defineConfig } from 'vite-plus'

const ignored = [
  '.git/**',
  '.turbo/**',
  '.alchemy/**',
  '.wrangler/**',
  'node_modules/**',
  'dist/**',
  'coverage/**',
  // Vendored from github.com/wheresryan22/anatomy; kept identical to upstream.
  'apps/web/art/kit/**',
]

export default defineConfig({
  fmt: {
    ignorePatterns: [...ignored, '**/*.d.ts'],
    // Windows checkouts use CRLF; Git keeps the shared source as LF.
    endOfLine: process.platform === 'win32' ? 'crlf' : 'lf',
    semi: false,
    singleQuote: true,
    trailingComma: 'all',
  },
  lint: {
    ignorePatterns: ignored,
    options: { typeAware: true, typeCheck: false },
    plugins: ['typescript', 'unicorn', 'oxc'],
    rules: {
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'typescript/no-explicit-any': 'error',
    },
  },
})
