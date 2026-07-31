#!/usr/bin/env node
// Applies the GHSA-qx2v-qp2m-jg93 security fix to next's bundled postcss.
// next@16.x pins postcss@8.4.31 internally; this patch backports the
// escapeHTMLInCSS fix from postcss@8.5.10 so </style> can't escape an
// HTML <style> context in CSS stringify output.

const fs = require('fs')
const path = require('path')

const target = path.join(
  __dirname,
  '..',
  'node_modules',
  'next',
  'node_modules',
  'postcss',
  'lib',
  'stringifier.js'
)

if (!fs.existsSync(target)) {
  console.log('patch-postcss: nested postcss not found, skipping.')
  process.exit(0)
}

let src = fs.readFileSync(target, 'utf8')

if (src.includes('escapeHTMLInCSS')) {
  console.log('patch-postcss: already patched, skipping.')
  process.exit(0)
}

const helper = `
const STYLE_TAG = /(<)(\\/\\?style\\b)/gi
const COMMENT_OPEN = /(<)(!--)/g

function escapeHTMLInCSS(str) {
  if (typeof str !== 'string') return str
  if (!str.includes('<')) return str
  return str.replace(STYLE_TAG, '\\\\3c $2').replace(COMMENT_OPEN, '\\\\3c $2')
}

`

src = src.replace("'use strict'\n\n", "'use strict'\n" + helper)

const replacements = [
  // atrule: escape params+name
  [
    "      this.builder(name + params + end, node)",
    "      this.builder(escapeHTMLInCSS(name + params + end), node)",
  ],
  // block: escape selector open and trailing whitespace
  [
    "    this.builder(start + between + '{', node, 'start')",
    "    this.builder(escapeHTMLInCSS(start + between) + '{', node, 'start')",
  ],
  [
    "    if (after) this.builder(after)",
    "    if (after) this.builder(escapeHTMLInCSS(after))",
  ],
  // body: escape before-child whitespace (skip document root nodes)
  [
    "      if (before) this.builder(before)\n      this.stringify(child, last !== i || semicolon)",
    "      if (before) this.builder(node.type === 'document' ? before : escapeHTMLInCSS(before))\n      this.stringify(child, last !== i || semicolon)",
  ],
  // comment: escape comment text
  [
    "    this.builder('/*' + left + node.text + right + '*/', node)",
    "    this.builder(escapeHTMLInCSS('/*' + left + node.text + right + '*/'), node)",
  ],
  // decl: escape declaration value/prop
  [
    "    this.builder(string, node)",
    "    this.builder(escapeHTMLInCSS(string), node)",
  ],
  // root: escape trailing whitespace (but not inside document)
  [
    "    if (node.raws.after) this.builder(node.raws.after)",
    `    if (node.raws.after) {
      let isDocument = node.parent && node.parent.type === 'document'
      this.builder(isDocument ? node.raws.after : escapeHTMLInCSS(node.raws.after))
    }`,
  ],
  // rule: escape own-semicolon
  [
    "      this.builder(node.raws.ownSemicolon, node, 'end')",
    "      this.builder(escapeHTMLInCSS(node.raws.ownSemicolon), node, 'end')",
  ],
]

let failed = []
for (const [from, to] of replacements) {
  if (!src.includes(from)) {
    failed.push(from.slice(0, 60))
    continue
  }
  src = src.replace(from, to)
}

if (failed.length > 0) {
  console.error('patch-postcss: some replacements did not match (postcss version may have changed):')
  failed.forEach(f => console.error(' -', f))
  process.exit(1)
}

fs.writeFileSync(target, src, 'utf8')
console.log('patch-postcss: applied GHSA-qx2v-qp2m-jg93 fix to next/node_modules/postcss.')
