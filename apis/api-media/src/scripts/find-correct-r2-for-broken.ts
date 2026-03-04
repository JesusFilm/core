/**
 * For each broken R2 asset in broken-r2s, find the correct R2 asset and optionally fix VideoVariant.
 * Groups by (videoId, languageId) so each video is processed once (e.g. all 1_wl-0-0 broken entries → one fix).
 *
 * Correct source lookup order:
 *   1. R2 with originalFilename ending ---0---0.mp4
 *   2. Fallback: R2 with fileName containing '_master' (e.g. 1_wl-0-0/variants/529/1_529-wl-0-0_master.mp4)
 *
 * VideoVariant is found by (videoId, languageId) parsed from the filename.
 *
 * Usage:
 *   npx nx run api-media:find-correct-r2-for-broken           # dry-run: report only
 *   npx nx run api-media:find-correct-r2-for-broken -- --apply   # apply: reupload/resume
 *   npx nx run api-media:find-correct-r2-for-broken -- --apply --force-reupload   # force full re-upload (skip resume)
 *   npx nx run api-media:find-correct-r2-for-broken -- --clean   # remove fixed videos from broken-r2s
 *
 * Skips already-completed variants. If Mux times out (~1h), re-run --apply to resume (no re-upload).
 * To find a Mux record: VideoVariant → muxVideoId → MuxVideo has uploadUrl (Cloudflare), assetId (Mux).
 */

import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { PrismaClient } from '.prisma/api-media-client'

import { createVideoFromUrl, getVideo } from '../schema/mux/video/service'

const prisma = new PrismaClient()

const BROKEN_R2S_PATH = 'apis/api-media/src/scripts/broken-r2s'
const MUX_POLL_INTERVAL_MS = 5000
const MUX_POLL_MAX_ATTEMPTS = 720 // 1 hour (720 * 5s)
const DELAY_BETWEEN_VIDEOS_MS = 3000

async function withRetry429<T>(fn: () => Promise<T>, retries = 5): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (e: unknown) {
      const err = e as {
        status?: number
        headers?: Record<string, string>
      }
      if (err?.status === 429 && i < retries - 1) {
        const retryAfter =
          err?.headers?.['retry-after'] ?? err?.headers?.['Retry-After'] ?? '2'
        const waitMs = Math.max(2000, Number(retryAfter) * 1000)
        console.log(`    Rate limited, waiting ${waitMs / 1000}s before retry...`)
        await new Promise((r) => setTimeout(r, waitMs))
      } else {
        throw e
      }
    }
  }
  throw new Error('Retry exhausted')
}

// Same regex as export-mux-retry-csv / video-importer
const VIDEO_FILENAME_REGEX =
  /^([^.]+?)---([^.]+?)---([^-]+)---([^-]+)(?:---([^-]+))*\.mp4$/

/** Derive correct filename: replace last ---X---Y.mp4 with ---0---0.mp4 */
function toCorrectFilename(brokenFilename: string): string | null {
  const match = brokenFilename.match(/^(.+)---[^-]+---[^-]+\.mp4$/)
  if (!match) return null
  return `${match[1]}---0---0.mp4`
}

function parseVideoFilename(filename: string): {
  videoId: string
  languageId: string
  edition: string
} | null {
  const match = filename.match(VIDEO_FILENAME_REGEX)
  if (!match) return null
  const [, videoId, editionName, languageId] = match
  return {
    videoId,
    languageId,
    edition: editionName.toLowerCase()
  }
}

/** Group key: process each (videoId, languageId) once */
function groupKey(videoId: string, languageId: string): string {
  return `${videoId}::${languageId}`
}

function parseTsvLine(line: string): string[] {
  return line.split('\t').map((v) => v.replace(/^"|"$/g, ''))
}

interface BrokenRow {
  id: string
  originalFilename: string
  videoId: string
  publicUrl: string
}

async function parseBrokenR2s(contents: string): Promise<BrokenRow[]> {
  const lines = contents.split(/\r?\n/).filter((l) => l.length > 0)
  if (lines.length <= 1) return []

  const header = parseTsvLine(lines[0])
  const col = (key: string) => header.indexOf(key)
  const idCol = col('id') >= 0 ? col('id') : 0
  const filenameCol =
    col('originalFilename') >= 0 ? col('originalFilename') : 2
  const videoIdCol = col('videoId') >= 0 ? col('videoId') : 3
  const urlCol = col('publicUrl') >= 0 ? col('publicUrl') : 5

  const rows: BrokenRow[] = []
  for (const line of lines.slice(1)) {
    const values = parseTsvLine(line)
    const id = values[idCol] ?? ''
    const originalFilename = values[filenameCol] ?? ''
    const videoId = values[videoIdCol] ?? ''
    const publicUrl = values[urlCol] ?? ''
    if (id && originalFilename) {
      rows.push({ id, originalFilename, videoId, publicUrl })
    }
  }
  return rows
}

const APPLY = process.argv.includes('--apply')
const FORCE_REUPLOAD = process.argv.includes('--force-reupload')
const CLEAN = process.argv.includes('--clean')

const PAD = { videoId: 18 }

async function reuploadAndUpdateVariant(
  variant: {
    id: string
    slug: string
    muxVideoId: string | null
    muxVideo: { assetId: string | null } | null
  },
  correctR2Id: string,
  publicUrl: string,
  progress?: { index: number; total: number; videoId: string }
): Promise<void> {
  const log = (msg: string) => {
    if (progress && APPLY) {
      console.log(
        `  [${progress.index}/${progress.total}] ${progress.videoId}: ${msg}`
      )
    }
  }

  // Do NOT delete the old Mux asset or MuxVideo – leave them as-is.

  log('Creating Mux asset from URL...')
  const muxAsset = await withRetry429(() =>
    createVideoFromUrl(publicUrl, false, '2160p', true)
  )
  const muxVideo = await prisma.muxVideo.create({
    data: {
      assetId: muxAsset.id,
      userId: 'system',
      downloadable: true,
      uploadUrl: publicUrl
    }
  })

  await prisma.videoVariant.update({
    where: { id: variant.id },
    data: { muxVideoId: muxVideo.id, assetId: correctR2Id }
  })

  log('Waiting for Mux to process...')
  let asset: Awaited<ReturnType<typeof getVideo>>
  for (let i = 0; i < MUX_POLL_MAX_ATTEMPTS; i++) {
    asset = await withRetry429(() => getVideo(muxAsset.id, false))
    if (asset.status === 'ready') break
    if (asset.status === 'errored') {
      throw new Error(`Mux asset errored: ${JSON.stringify(asset.errors)}`)
    }
    if (i > 0 && i % 6 === 0 && progress && APPLY) {
      log(`  Still waiting... (${i * (MUX_POLL_INTERVAL_MS / 1000)}s)`)
    }
    await new Promise((r) => setTimeout(r, MUX_POLL_INTERVAL_MS))
  }

  const finalAsset = await withRetry429(() => getVideo(muxAsset.id, false))
  if (finalAsset.status !== 'ready') {
    console.error('')
    console.error('  Mux asset did not become ready in time (~1h).')
    console.error(
      `  Find it: VideoVariant id=${variant.id} → muxVideoId=${muxVideo.id}`
    )
    console.error(
      `  MuxVideo.uploadUrl has the Cloudflare URL; assetId=${muxAsset.id} is the Mux asset.`
    )
    console.error('  Re-run with --apply later; it will resume (no re-upload).')
    throw new Error('Mux asset did not become ready in time')
  }

  const playbackId = finalAsset.playback_ids?.[0]?.id
  if (!playbackId) {
    throw new Error('Mux asset ready but no playback_id')
  }

  const muxStreamBaseUrl =
    process.env.MUX_STREAM_BASE_URL ?? 'https://stream.mux.com/'
  const watchPageBaseUrl = process.env.WATCH_PAGE_BASE_URL ?? 'http://jesusfilm.org/watch/'

  await prisma.muxVideo.update({
    where: { id: muxVideo.id },
    data: {
      playbackId,
      readyToStream: true,
      duration: Math.ceil(finalAsset.duration ?? 0),
      downloadable: true
    }
  })

  await prisma.videoVariant.update({
    where: { id: variant.id },
    data: {
      hls: `${muxStreamBaseUrl}${playbackId}.m3u8`,
      share: `${watchPageBaseUrl}${variant.slug}`,
      brightcoveId: null,
      published: true,
      downloadable: true
    }
  })

  // Do not delete the old MuxVideo record or Mux asset – leave them as-is.
  log('Done.')
}

async function resumeAndUpdateVariant(
  variant: {
    id: string
    slug: string
    muxVideoId: string | null
    muxVideo: { assetId: string | null; id: string } | null
  },
  muxAssetId: string,
  progress?: { index: number; total: number; videoId: string }
): Promise<void> {
  const log = (msg: string) => {
    if (progress && APPLY) {
      console.log(
        `  [${progress.index}/${progress.total}] ${progress.videoId}: ${msg}`
      )
    }
  }

  log(`Resuming – polling existing Mux asset (assetId=${muxAssetId})...`)
  let asset: Awaited<ReturnType<typeof getVideo>>
  for (let i = 0; i < MUX_POLL_MAX_ATTEMPTS; i++) {
    asset = await withRetry429(() => getVideo(muxAssetId, false))
    if (asset.status === 'ready') break
    if (asset.status === 'errored') {
      throw new Error(`Mux asset errored: ${JSON.stringify(asset.errors)}`)
    }
    if (i > 0 && i % 6 === 0 && progress && APPLY) {
      log(`  Still waiting... (${i * (MUX_POLL_INTERVAL_MS / 1000)}s)`)
    }
    await new Promise((r) => setTimeout(r, MUX_POLL_INTERVAL_MS))
  }

  const finalAsset = await withRetry429(() => getVideo(muxAssetId, false))
  if (finalAsset.status !== 'ready') {
    const muxVideo = variant.muxVideo
    console.error('')
    console.error('  Mux asset did not become ready in time.')
    console.error(
      `  Find it: VideoVariant id=${variant.id} → muxVideoId=${muxVideo?.id}`
    )
    console.error(
      `  MuxVideo.uploadUrl has the Cloudflare URL; assetId=${muxAssetId} is the Mux asset.`
    )
    console.error('  Re-run with --apply later; it will resume (no re-upload).')
    throw new Error('Mux asset did not become ready in time')
  }

  const playbackId = finalAsset.playback_ids?.[0]?.id
  if (!playbackId) {
    throw new Error('Mux asset ready but no playback_id')
  }

  const muxStreamBaseUrl =
    process.env.MUX_STREAM_BASE_URL ?? 'https://stream.mux.com/'
  const watchPageBaseUrl =
    process.env.WATCH_PAGE_BASE_URL ?? 'http://jesusfilm.org/watch/'

  if (variant.muxVideoId) {
    await prisma.muxVideo.update({
      where: { id: variant.muxVideoId },
      data: {
        playbackId,
        readyToStream: true,
        duration: Math.ceil(finalAsset.duration ?? 0),
        downloadable: true
      }
    })
  }

  await prisma.videoVariant.update({
    where: { id: variant.id },
    data: {
      hls: `${muxStreamBaseUrl}${playbackId}.m3u8`,
      share: `${watchPageBaseUrl}${variant.slug}`,
      brightcoveId: null,
      published: true,
      downloadable: true
    }
  })
  log('Done (resumed).')
}

function pad(s: string, n: number): string {
  const t = String(s).slice(0, n)
  return t.padEnd(n)
}

interface VariantSnapshot {
  id: string
  slug: string
  assetId: string | null
  muxVideoId: string | null
  muxVideoAssetId: string | null
  hls: string | null
  share: string | null
  brightcoveId: string | null
  published: boolean
  downloadable: boolean
}

interface Result {
  videoId: string
  brokenFilename: string
  correctFilename: string
  correctId: string
  correctPublicUrl: string
  action:
    | 'would_reupload'
    | 'reuploaded'
    | 'would_resume'
    | 'resumed'
    | 'skipped'
    | 'no_variant'
    | 'skip'
  reason?: string
  variantSnapshot?: VariantSnapshot
}

async function findCorrectR2(
  videoId: string,
  languageId: string,
  correctFilename: string | null
): Promise<{ id: string; publicUrl: string; label: string } | null> {
  if (correctFilename) {
    const byOriginal = await prisma.cloudflareR2.findFirst({
      where: { originalFilename: correctFilename, publicUrl: { not: null } },
      orderBy: { createdAt: 'desc' },
      select: { id: true, publicUrl: true }
    })
    if (byOriginal?.publicUrl) {
      return {
        id: byOriginal.id,
        publicUrl: byOriginal.publicUrl,
        label: correctFilename
      }
    }
  }

  const masterFile = await prisma.cloudflareR2.findFirst({
    where: {
      videoId,
      publicUrl: { not: null },
      fileName: { contains: '_master' }
    },
    orderBy: { contentLength: 'desc' },
    select: { id: true, publicUrl: true, fileName: true }
  })
  if (masterFile?.publicUrl) {
    return {
      id: masterFile.id,
      publicUrl: masterFile.publicUrl,
      label: masterFile.fileName
    }
  }

  return null
}

async function main(): Promise<void> {
  const path = resolve(BROKEN_R2S_PATH)
  const contents = await readFile(path, 'utf8')
  const brokenRows = await parseBrokenR2s(contents)
  const lines = contents.split(/\r?\n/).filter((l) => l.length > 0)
  const header = lines[0] ?? ''
  const bodyLines = lines.slice(1)

  if (CLEAN) {
    const groupedWithLines = new Map<
      string,
      { row: BrokenRow; line: string }
    >()
    for (let i = 0; i < brokenRows.length; i++) {
      const row = brokenRows[i]
      const parsed = parseVideoFilename(row.originalFilename)
      if (!parsed) continue
      const key = groupKey(parsed.videoId, parsed.languageId)
      if (!groupedWithLines.has(key)) {
        groupedWithLines.set(key, { row, line: bodyLines[i] ?? '' })
      }
    }

    const toRemove: string[] = []
    for (const [key, { row }] of groupedWithLines) {
      const parsed = parseVideoFilename(row.originalFilename)
      if (!parsed) continue
      const correct = await findCorrectR2(
        parsed.videoId,
        parsed.languageId,
        toCorrectFilename(row.originalFilename)
      )
      if (!correct) continue
      const variant = await prisma.videoVariant.findFirst({
        where: {
          videoId: parsed.videoId,
          languageId: parsed.languageId
        },
        include: { muxVideo: true }
      })
      const fixed =
        variant?.muxVideo?.uploadUrl === correct.publicUrl &&
        variant?.muxVideo?.readyToStream &&
        variant?.hls?.startsWith('https://stream.mux.com')
      if (fixed) toRemove.push(key)
    }

    const keptLines = [...groupedWithLines.entries()]
      .filter(([key]) => !toRemove.includes(key))
      .map(([, x]) => x.line)
    const newContent = [header, ...keptLines].join('\n') + '\n'
    await writeFile(path, newContent, 'utf8')
    console.log(
      `Removed ${toRemove.length} fixed videos. ${keptLines.length} remaining.`
    )
    return
  }

  const grouped = new Map<string, BrokenRow>()
  for (const row of brokenRows) {
    const parsed = parseVideoFilename(row.originalFilename)
    if (!parsed) continue
    const key = groupKey(parsed.videoId, parsed.languageId)
    if (!grouped.has(key)) {
      grouped.set(key, row)
    }
  }

  const results: Result[] = []
  let reuploaded = 0

  for (const [, row] of grouped) {
    const parsed = parseVideoFilename(row.originalFilename)
    if (!parsed) {
      results.push({
        videoId: row.videoId,
        brokenFilename: row.originalFilename,
        correctFilename: '',
        correctId: '',
        correctPublicUrl: '',
        action: 'skip',
        reason: 'could not parse broken filename'
      })
      continue
    }

    const correctFilename = toCorrectFilename(row.originalFilename)
    const correct = await findCorrectR2(
      parsed.videoId,
      parsed.languageId,
      correctFilename
    )

    if (!correct) {
      results.push({
        videoId: parsed.videoId,
        brokenFilename: row.originalFilename,
        correctFilename: correctFilename ?? '',
        correctId: '',
        correctPublicUrl: '',
        action: 'skip',
        reason: 'correct R2 not found (neither ---0---0.mp4 nor _master file)'
      })
      continue
    }

    const variant = await prisma.videoVariant.findFirst({
      where: {
        videoId: parsed.videoId,
        languageId: parsed.languageId
      },
      include: { muxVideo: true }
    })

    if (!variant) {
      results.push({
        videoId: parsed.videoId,
        brokenFilename: row.originalFilename,
        correctFilename: correct.label,
        correctId: correct.id,
        correctPublicUrl: correct.publicUrl,
        action: 'no_variant',
        reason: `no VideoVariant for videoId=${parsed.videoId} languageId=${parsed.languageId}`
      })
      continue
    }

    const muxUploadUrlMatches =
      variant.muxVideo?.uploadUrl === correct.publicUrl
    const alreadyDone =
      muxUploadUrlMatches &&
      variant.muxVideo?.readyToStream &&
      variant.hls?.startsWith('https://stream.mux.com')
    const canResume =
      !FORCE_REUPLOAD &&
      muxUploadUrlMatches &&
      variant.muxVideo?.assetId &&
      !variant.muxVideo?.readyToStream

    if (alreadyDone) {
      results.push({
        videoId: parsed.videoId,
        brokenFilename: row.originalFilename,
        correctFilename: correct.label,
        correctId: correct.id,
        correctPublicUrl: correct.publicUrl,
        action: 'skipped',
        reason: 'already completed (readyToStream + hls)',
        variantSnapshot: {
          id: variant.id,
          slug: variant.slug,
          assetId: variant.assetId,
          muxVideoId: variant.muxVideoId,
          muxVideoAssetId: variant.muxVideo?.assetId ?? null,
          hls: variant.hls,
          share: variant.share,
          brightcoveId: variant.brightcoveId,
          published: variant.published,
          downloadable: variant.downloadable
        }
      })
      continue
    }

    const action: Result['action'] = canResume
      ? APPLY
        ? 'resumed'
        : 'would_resume'
      : APPLY
        ? 'reuploaded'
        : 'would_reupload'
    if (APPLY) {
      const doneCount = results.filter(
        (x) =>
          x.action === 'would_reupload' ||
          x.action === 'reuploaded' ||
          x.action === 'would_resume' ||
          x.action === 'resumed'
      ).length
      const currentIndex = doneCount + 1
      if (canResume) {
        await resumeAndUpdateVariant(
          variant,
          variant.muxVideo!.assetId!,
          {
            index: currentIndex,
            total: grouped.size,
            videoId: parsed.videoId
          }
        )
      } else {
        await reuploadAndUpdateVariant(variant, correct.id, correct.publicUrl, {
          index: currentIndex,
          total: grouped.size,
          videoId: parsed.videoId
        })
      }
      reuploaded++
      if (currentIndex < grouped.size) {
        console.log(
          `  Waiting ${DELAY_BETWEEN_VIDEOS_MS / 1000}s before next video (rate limit)...`
        )
        await new Promise((r) => setTimeout(r, DELAY_BETWEEN_VIDEOS_MS))
      }
    }

    results.push({
      videoId: parsed.videoId,
      brokenFilename: row.originalFilename,
      correctFilename: correct.label,
      correctId: correct.id,
      correctPublicUrl: correct.publicUrl,
      action,
      variantSnapshot: {
        id: variant.id,
        slug: variant.slug,
        assetId: variant.assetId,
        muxVideoId: variant.muxVideoId,
        muxVideoAssetId: variant.muxVideo?.assetId ?? null,
        hls: variant.hls,
        share: variant.share,
        brightcoveId: variant.brightcoveId,
        published: variant.published,
        downloadable: variant.downloadable
      }
    })
  }

  // --- Output ---
  console.log('')
  console.log(`  Found ${brokenRows.length} broken R2 assets → ${grouped.size} unique videos (videoId+languageId)`)
  console.log(`  Mode: ${APPLY ? '--apply (updates applied)' : 'dry-run (no changes)'}`)
  console.log('')

  const byAction = {
    would_reupload: results.filter((r) => r.action === 'would_reupload'),
    reuploaded: results.filter((r) => r.action === 'reuploaded'),
    would_resume: results.filter((r) => r.action === 'would_resume'),
    resumed: results.filter((r) => r.action === 'resumed'),
    skipped: results.filter((r) => r.action === 'skipped'),
    no_variant: results.filter((r) => r.action === 'no_variant'),
    skip: results.filter((r) => r.action === 'skip')
  }

  if (
    byAction.would_reupload.length > 0 ||
    byAction.reuploaded.length > 0 ||
    byAction.would_resume.length > 0 ||
    byAction.resumed.length > 0
  ) {
    const label = APPLY
      ? 'Reuploaded / Resumed'
      : 'Would reupload / resume'
    const list = [
      ...byAction.reuploaded,
      ...byAction.resumed,
      ...byAction.would_reupload,
      ...byAction.would_resume
    ]
    console.log(`  ${label} (${list.length})`)
    console.log('  ' + '─'.repeat(70))
    const watchPageBaseUrl =
      process.env.WATCH_PAGE_BASE_URL ?? 'http://jesusfilm.org/watch/'

    for (const r of list) {
      console.log('')
      console.log(`  ▶ ${r.videoId} (variant ${r.variantSnapshot?.id ?? '?'})`)
      console.log(`    Source: ${r.correctPublicUrl}`)
      if (r.variantSnapshot && !APPLY) {
        const v = r.variantSnapshot
        console.log('    Current:')
        console.log(`      assetId:      ${v.assetId ?? '(null)'}`)
        console.log(
          `      muxVideoId:   ${v.muxVideoId ?? '(null)'}${v.muxVideoAssetId ? ` (Mux asset: ${v.muxVideoAssetId})` : ''}`
        )
        console.log(`      hls:          ${v.hls ?? '(null)'}`)
        console.log(`      share:        ${v.share ?? '(null)'}`)
        console.log(`      brightcoveId: ${v.brightcoveId ?? '(null)'}`)
        console.log(`      published:    ${v.published}`)
        console.log(`      downloadable: ${v.downloadable}`)
        console.log('    Will change to:')
        const assetIdUnchanged = v.assetId === r.correctId
        console.log(
          `      assetId:      ${r.correctId}${assetIdUnchanged ? ' (unchanged – already correct)' : ' (correct R2)'}`
        )
        console.log(
          `      muxVideoId:   (new)${v.muxVideoId ? ` (replaces ${v.muxVideoId})` : ''}`
        )
        console.log(`      hls:          (new from Mux)`)
        console.log(`      share:        ${watchPageBaseUrl}${v.slug}`)
        console.log(`      brightcoveId: null`)
        console.log(`      published:    true`)
        console.log(`      downloadable: true`)
        console.log(
          `    MuxVideo: create new with uploadUrl=${r.correctPublicUrl}`
        )
        if (assetIdUnchanged) {
          console.log(
            '    Note: assetId already correct – Mux/HLS was from broken upload, re-uploading fixes playback'
          )
        }
      } else if (APPLY) {
        console.log(`    ${r.correctFilename}`)
      }
    }
    console.log('')
  }

  if (byAction.skipped.length > 0) {
    console.log(`  Skipped – already completed (${byAction.skipped.length})`)
    console.log('  ' + '─'.repeat(70))
    for (const r of byAction.skipped) {
      console.log(`    ${pad(r.videoId, PAD.videoId)}  ${r.correctFilename}`)
    }
    console.log('')
  }

  if (byAction.no_variant.length > 0) {
    console.log(`  Correct R2 found, but no VideoVariant (videoId+languageId) (${byAction.no_variant.length})`)
    console.log('  ' + '─'.repeat(70))
    for (const r of byAction.no_variant) {
      console.log(`    ${pad(r.videoId, PAD.videoId)}  ${r.correctFilename}`)
      console.log(`    ${' '.repeat(PAD.videoId + 2)}  ${r.reason ?? ''}`)
    }
    console.log('')
  }

  if (byAction.skip.length > 0) {
    console.log(`  Skipped (${byAction.skip.length})`)
    console.log('  ' + '─'.repeat(70))
    for (const r of byAction.skip) {
      const reason = r.reason ?? ''
      console.log(`    ${pad(r.videoId, PAD.videoId)}  ${r.brokenFilename}`)
      console.log(`    ${' '.repeat(PAD.videoId + 2)}  ${reason}`)
    }
    console.log('')
  }

  console.log('  Summary')
  console.log('  ' + '─'.repeat(40))
  console.log(`    would_reupload:  ${byAction.would_reupload.length}`)
  console.log(`    reuploaded:      ${byAction.reuploaded.length}`)
  console.log(`    would_resume:    ${byAction.would_resume.length}`)
  console.log(`    resumed:        ${byAction.resumed.length}`)
  console.log(`    skipped:        ${byAction.skipped.length}`)
  console.log(`    no_variant:     ${byAction.no_variant.length}`)
  console.log(`    skip:           ${byAction.skip.length}`)
  if (APPLY && reuploaded > 0) {
    console.log('')
    console.log(`  ✓ Updated ${reuploaded} VideoVariant(s)`)
  }
  console.log('')
}

if (require.main === module) {
  void main()
    .catch((e) => {
      console.error(e)
      process.exitCode = 1
    })
    .finally(() => {
      void prisma.$disconnect()
    })
}
