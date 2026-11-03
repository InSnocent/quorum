// Modified for the bilingual fork, 2026-11-03. GPL-3.0-or-later; see LICENSE.
import fs from 'node:fs/promises'
import path from 'node:path'
import { API } from 'typescript/unstable/sync'
import * as ts from 'typescript/unstable/ast'

const root = process.cwd()
const roots = ['apps/web/src', 'packages/simulation/src', 'packages/rpc/src', 'apps/backend/src']
const api = new API({ cwd: root })
const snapshot = api.updateSnapshot({
  openProjects: roots.map((directory) => path.join(root, directory, '../tsconfig.json')),
})
const entries = new Map()
const css =
  /(?:^|\s)(?:text-|bg-|flex(?:\s|$)|grid(?:\s|$)|absolute|relative|size-|gap-|items-|rounded-|inline-|hover:|font-|w-|h-|border-|dark:|compact:|pointer-events-)/

function readable(value) {
  return (
    /[a-zA-Z]{2}/.test(value) &&
    !css.test(value) &&
    !/^(?:https?:|\.\.?\/|@|#|--|\^|[Mm]\d)/.test(value) &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) &&
    !/^(?:SELECT|FROM|WHERE|INSERT|UPDATE|DELETE)\s/.test(value) &&
    !/ui-(?:mono|sans)-/.test(value) &&
    !/^(?:[a-z0-9_-]+\.)+[a-z0-9_-]+$/.test(value) &&
    !/^[a-z]+(?:[-_:][a-z0-9]+)+$/.test(value) &&
    !/^[A-Z_0-9]+$/.test(value) &&
    !/[[\]<>]/.test(value) &&
    !/^\s*\{/.test(value.replace(/\{\d+\}/g, 'X')) &&
    !/^(?:effect|foldkit|lucide|node|pixi|simple-icons)(?:\/|$)/.test(value)
  )
}

async function walk(directory) {
  const children = await fs.readdir(path.join(root, directory), { withFileTypes: true })
  for (const child of children) {
    const file = `${directory}/${child.name}`
    if (child.isDirectory()) {
      if (!['i18n', 'fixtures', 'ui'].includes(child.name)) await walk(file)
    } else if (file.endsWith('.ts') && !/\.(test|bench|d)\.ts$/.test(file)) {
      const source = snapshot
        .getProjects()
        .map((project) => project.program.getSourceFile(path.join(root, file)))
        .find(Boolean)
      if (!source) throw new Error(`No AST for ${file}`)
      function visit(node) {
        const parent = node.parent
        if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node) || ts.isTypeNode(node))
          return
        if (
          (ts.isStringLiteral(node) ||
            ts.isNoSubstitutionTemplateLiteral(node) ||
            ts.isTemplateExpression(node)) &&
          !(ts.isPropertyAssignment(parent) && parent.name === node) &&
          !ts.isCaseClause(parent) &&
          !(
            ts.isCallExpression(parent) &&
            /^(?:Schema\.|h\.(?:Class|Key|Data|Attribute|Style|Type|Href|D|Fill|Stroke|ViewBox))/.test(
              parent.expression.getText(source),
            )
          )
        ) {
          const optional = []
          const key = ts.isTemplateExpression(node)
            ? node.head.text +
              node.templateSpans
                .map((span, index) => {
                  if (/\?\s*(['"])s?\1\s*:\s*(['"])s?\2/.test(span.expression.getText(source)))
                    optional.push(index)
                  return `{${index}}${span.literal.text}`
                })
                .join('')
            : node.text
          if (readable(key)) {
            for (const fragment of new Set([key, ...key.split('\n\n'), ...key.split('\n')])) {
              const trimmed = fragment.trim()
              if (!readable(trimmed)) continue
              const item = entries.get(trimmed) ?? { source: trimmed, files: [], optional }
              if (!item.files.includes(file)) item.files.push(file)
              entries.set(trimmed, item)
            }
          }
        }
        node.forEachChild(visit)
      }
      visit(source)
    }
  }
}

for (const directory of roots) await walk(directory)
snapshot.dispose()
api.close()
const output = [...entries.values()].sort((a, b) => a.source.localeCompare(b.source, 'en'))
await fs.mkdir(path.join(root, '.localization'), { recursive: true })
await fs.writeFile(
  path.join(root, '.localization/sources.json'),
  JSON.stringify(output, null, 2) + '\n',
)
console.log(
  `${output.length} entries; ${output.reduce((sum, item) => sum + item.source.length, 0)} source characters`,
)
