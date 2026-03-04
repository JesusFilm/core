/**
 * Reset video cache (Watch app revalidation) for videos that were reuploaded
 * via find-correct-r2-for-broken.
 *
 * Reads broken-r2s (or a custom TSV path) and triggers Watch app revalidation
 * for each unique (videoId, languageId) so prod serves fresh Mux playback URLs
 * instead of stale cached ones.
 *
 * Requires: WATCH_URL, WATCH_REVALIDATE_SECRET (for Watch revalidation).
 * Uses PG_DATABASE_URL_MEDIA (or DATABASE_URL) for Prisma.
 *
 * WATCH_URL must be the base URL of the Watch app (e.g. https://watch.jesusfilm.org).
 * No trailing slash. The script POSTs to {WATCH_URL}/api/revalidate.
 * WATCH_REVALIDATE_SECRET must match the Watch app's REVALIDATE_SECRET env var.
 *
 * Note: Yoga cache is per api-media instance; if stale data persists after
 * running this, restart api-media or run videoVariantUpdate from videos-admin.
 *
 * To trigger cache reset from videos-admin (invalidates Yoga + Watch):
 *   1. Go to Videos > [video] > Audio tab
 *   2. Click a variant row to open the dialog
 *   3. Click Save (no changes needed) - videoVariantUpdate triggers cache reset
 *   Or use browser console (when logged in): run the videoVariantUpdate mutation
 *   with input: { id: "1_529-mld-0-0" } (or the variant id)
 *
 * Usage:
 *   npx nx run api-media:reset-video-cache-for-reuploaded
 *   npx nx run api-media:reset-video-cache-for-reuploaded -- apis/api-media/src/scripts/broken-r2s
 *   npx nx run api-media:reset-video-cache-for-reuploaded -- --dry-run  # list only, no reset
 *   npx nx run api-media:reset-video-cache-for-reuploaded -- --verbose  # extra logs
 */

import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { PrismaClient } from '.prisma/api-media-client'

const prisma = new PrismaClient()

function logVerbose(verbose: boolean, msg: string): void {
  if (verbose) console.log(`  [verbose] ${msg}`)
}

async function revalidateWatchApp(
  url: string,
  verbose: boolean
): Promise<void> {
  const watchUrl = process.env.WATCH_URL
  const secret = process.env.WATCH_REVALIDATE_SECRET
  if (!watchUrl || !secret) {
    throw new Error(
      'WATCH_URL and WATCH_REVALIDATE_SECRET must be set for cache reset'
    )
  }
  const endpoint = `${watchUrl.replace(/\/$/, '')}/api/revalidate?secret=${secret}`
  logVerbose(verbose, `POST ${watchUrl.replace(/\/$/, '')}/api/revalidate?secret=***`)
  logVerbose(verbose, `  body: { url: "${url}" }`)

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  })

  const bodyText = await res.text()
  if (!res.ok) {
    throw new Error(
      `Revalidate failed: ${res.status} ${res.statusText} | endpoint=${endpoint.replace(secret, '***')} | url=${url} | body=${bodyText}`
    )
  }
  logVerbose(verbose, `  response: ${res.status} ${bodyText}`)
}

const DEFAULT_BROKEN_PATH = 'apis/api-media/src/scripts/broken-r2s'

// Same regex as find-correct-r2-for-broken
const VIDEO_FILENAME_REGEX =
  /^([^.]+?)---([^.]+?)---([^-]+)---([^-]+)(?:---([^-]+))*\.mp4$/

function parseVideoFilename(filename: string): {
  videoId: string
  languageId: string
} | null {
  const match = filename.match(VIDEO_FILENAME_REGEX)
  if (!match) return null
  const [, videoId, , languageId] = match
  return { videoId, languageId }
}

/** Build variant ID from videoId and languageId (same as processVideoUploads) */
function toVariantId(videoId: string, languageId: string): string {
  const [source, ...restParts] = videoId.split('_')
  const restOfId = restParts.join('_') || videoId
  return `${source}_${languageId}-${restOfId}`
}

function parseTsvLine(line: string): string[] {
  return line.split('\t').map((v) => v.replace(/^"|"$/g, ''))
}

async function parseBrokenR2s(contents: string): Promise<{ videoId: string; languageId: string }[]> {
  const lines = contents.split(/\r?\n/).filter((l) => l.length > 0)
  if (lines.length <= 1) return []

  const header = parseTsvLine(lines[0])
  const col = (key: string) => header.indexOf(key)
  const filenameCol = col('originalFilename') >= 0 ? col('originalFilename') : 2

  const seen = new Set<string>()
  const pairs: { videoId: string; languageId: string }[] = []

  for (const line of lines.slice(1)) {
    const values = parseTsvLine(line)
    const originalFilename = values[filenameCol] ?? ''
    const parsed = parseVideoFilename(originalFilename)
    if (!parsed) continue

    const key = `${parsed.videoId}::${parsed.languageId}`
    if (seen.has(key)) continue
    seen.add(key)
    pairs.push(parsed)
  }
  return pairs
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const verbose = args.includes('--verbose')
  const pathArg = args.find((a) => !a.startsWith('--'))
  const brokenPath = resolve(
    process.cwd(),
    pathArg ?? DEFAULT_BROKEN_PATH
  )

  const watchUrl = process.env.WATCH_URL
  const hasSecret = Boolean(process.env.WATCH_REVALIDATE_SECRET)
  console.log(`WATCH_URL: ${watchUrl ?? '(not set)'}`)
  console.log(`WATCH_REVALIDATE_SECRET: ${hasSecret ? '***' : '(not set)'}`)
  if (watchUrl) {
    const base = watchUrl.replace(/\/$/, '')
    console.log(`Revalidate endpoint: ${base}/api/revalidate`)
  }
  console.log(`Reading: ${brokenPath}`)
  if (dryRun) console.log('(dry-run: no cache reset will be performed)')

  let contents: string
  try {
    contents = await readFile(brokenPath, 'utf-8')
  } catch (e: unknown) {
    console.error(
      `Failed to read file: ${e instanceof Error ? e.message : String(e)}`
    )
    process.exitCode = 1
    return
  }

  const pairs = await parseBrokenR2s(contents)
  if (pairs.length === 0) {
    console.log('No (videoId, languageId) pairs found.')
    return
  }

  console.log(`Found ${pairs.length} unique video variants to reset cache for.\n`)

  let ok = 0
  let skip = 0
  let err = 0

  for (const { videoId, languageId } of pairs) {
    const variantId = toVariantId(videoId, languageId)
    const variant = await prisma.videoVariant.findUnique({
      where: { id: variantId },
      select: { id: true, slug: true, videoId: true }
    })

    if (!variant) {
      console.log(`  SKIP ${variantId} (variant not found in DB)`)
      skip++
      continue
    }

    if (dryRun) {
      console.log(`  WOULD RESET ${variantId} (${variant.slug})`)
      ok++
      continue
    }

    try {
      const slugs = variant.slug.split('/')
      const revalidateUrl =
        slugs.length >= 2
          ? `/watch/${encodeURIComponent(slugs[0])}.html/${encodeURIComponent(slugs[1])}.html`
          : `/watch/${encodeURIComponent(variant.slug)}.html/english.html`
      await revalidateWatchApp(revalidateUrl, verbose)
      console.log(`  OK ${variantId} (${variant.slug})`)
      ok++
    } catch (e: unknown) {
      console.error(
        `  ERR ${variantId}: ${e instanceof Error ? e.message : String(e)}`
      )
      err++
    }
  }

  console.log('')
  console.log(`Done: ${ok} reset, ${skip} skipped, ${err} errors`)
}

void main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => {
    void prisma.$disconnect()
  })
