#!/usr/bin/env node
/**
 * Generate clearly-labelled placeholder PNG assets for the
 * TemplateInfoPanel side panel (NES-1538).
 *
 * Each output file:
 *   - bg #EFEFEF, dark-grey #6D6D7D text, 1px #DEDFE0 border
 *   - shows "PLACEHOLDER", the slot description, and the W×H dims
 *
 * Files are written with the extensions the final assets will use
 * (.png or .gif). For .gif slots we write the same PNG bytes — browsers
 * tolerate the MIME-vs-magic-number mismatch, and naming the file with
 * its final extension keeps the swap-in a one-file replace once real
 * GIFs are produced.
 *
 * Run from the repo root:
 *   node apps/journeys-admin/scripts/generate-template-info-placeholders.mjs
 */
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const OUT_DIR = resolve(__dirname, '..', 'public', 'assets', 'template-info')

const BG = '#EFEFEF'
const FG = '#6D6D7D'
const BORDER = '#DEDFE0'

const SLOTS = [
  {
    file: 'template-types-quick-start.png',
    label: 'Template Types — Quick-Start',
    width: 333,
    height: 185
  },
  {
    file: 'template-types-regular.png',
    label: 'Template Types — Regular',
    width: 333,
    height: 185
  },
  {
    file: 'make-template-flow.gif',
    label: 'How to create — Make Template flow',
    width: 333,
    height: 160
  },
  {
    file: 'text-variable-flow.gif',
    label: 'How to create — Text variable flow',
    width: 333,
    height: 160
  },
  {
    file: 'tracking-button-properties.png',
    label: 'Tracking — Button Properties panel',
    width: 333,
    height: 227
  },
  {
    file: 'tracking-analytics-table.png',
    label: 'Tracking — Analytics table',
    width: 333,
    height: 203
  },
  {
    file: 'publish-and-share-flow.gif',
    label: 'Sharing — Publish / Use in a team flow',
    width: 333,
    height: 160
  }
]

function buildSvg({ width, height, label }) {
  // Wrap the slot description if it would overflow the card width.
  const maxCharsPerLine = Math.floor(width / 8.5)
  const words = label.split(/\s+/)
  const lines = []
  let current = ''
  for (const word of words) {
    if (current.length === 0) {
      current = word
      continue
    }
    if (current.length + 1 + word.length > maxCharsPerLine) {
      lines.push(current)
      current = word
    } else {
      current = `${current} ${word}`
    }
  }
  if (current.length > 0) lines.push(current)

  const dims = `${width}×${height}`
  const centerX = width / 2
  const totalLines = lines.length + 2 // "PLACEHOLDER" + label lines + dims
  const lineHeight = 20
  const startY = Math.round(height / 2 - ((totalLines - 1) * lineHeight) / 2)

  const tspans = []
  tspans.push(
    `<tspan x="${centerX}" y="${startY}" font-weight="700" font-size="14" letter-spacing="0.06em">PLACEHOLDER</tspan>`
  )
  lines.forEach((line, index) => {
    const safe = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    tspans.push(
      `<tspan x="${centerX}" dy="${lineHeight}" font-weight="600" font-size="13">${safe}</tspan>`
    )
  })
  tspans.push(
    `<tspan x="${centerX}" dy="${lineHeight}" font-weight="400" font-size="12" opacity="0.7">${dims}</tspan>`
  )

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" fill="${BG}" stroke="${BORDER}" stroke-width="1" rx="3" ry="3" />
  <text fill="${FG}" font-family="Helvetica, Arial, sans-serif" text-anchor="middle">
    ${tspans.join('\n    ')}
  </text>
</svg>`
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  for (const slot of SLOTS) {
    const svg = buildSvg(slot)
    const buf = await sharp(Buffer.from(svg))
      .png({ compressionLevel: 9 })
      .toBuffer()
    const outPath = resolve(OUT_DIR, slot.file)
    await sharp(buf).toFile(outPath)
    // eslint-disable-next-line no-console
    console.log(`wrote ${outPath} (${slot.width}x${slot.height})`)
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exit(1)
})
