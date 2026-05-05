import { prisma } from '../../../../libs/prisma/media/src/client'

// Two legitimate fileName shapes for a primary variant asset:
//   "videos" (newer — videos-admin + video-importer):
//     ${videoId}/variants/${languageId}/videos/${uuid}/${variantId}${ext}
//   "master" (historical — apis/api-media/src/scripts/master-migrate-r2.ts):
//     ${videoId}/variants/${languageId}/${variantId}_master${ext}
const VIDEOS_FILENAME_REGEX =
  /^([^/]+)\/variants\/([^/]+)\/videos\/[^/]+\/[^/]+\.[^/.]+$/
const MASTER_FILENAME_REGEX =
  /^([^/]+)\/variants\/([^/]+)\/[^/]+_master\.[^/.]+$/

type Extracted = {
  source: 'videos' | 'master'
  videoId: string
  languageId: string
}

function extractFromFileName(fileName: string): Extracted | null {
  const videos = fileName.match(VIDEOS_FILENAME_REGEX)
  if (videos != null) {
    const [, videoId, languageId] = videos
    return { source: 'videos', videoId, languageId }
  }
  const master = fileName.match(MASTER_FILENAME_REGEX)
  if (master != null) {
    const [, videoId, languageId] = master
    return { source: 'master', videoId, languageId }
  }
  return null
}

// Backfill only targets the "videos" shape — those are the unlinked uploads
// surfaced in the Upload State trouble list. Master assets that still need
// linking are out of scope for this script.
function videosFileNamePrefix(videoId: string, languageId: string): string {
  return `${videoId}/variants/${languageId}/videos/`
}

// ---------- types

type R2Row = {
  id: string
  fileName: string
  originalFilename: string | null
  publicUrl: string | null
  videoId: string | null
  createdAt: Date
}

type MuxRow = {
  id: string
  name: string | null
  uploadUrl: string | null
  uploadId: string | null
  assetId: string | null
  playbackId: string | null
  readyToStream: boolean
}

type VariantRow = {
  id: string
  videoId: string
  languageId: string
  version: number
  edition: string
  assetId: string | null
  muxVideoId: string | null
  muxVideo: MuxRow | null
}

// ---------- candidate matching

type MatchKind = 'strong_uploadid' | 'strong_publicurl' | 'weak_filename'

type Candidate = { r2: R2Row; kind: MatchKind }

function classifyCandidate(r2: R2Row, mux: MuxRow | null): MatchKind {
  if (mux != null && mux.uploadId != null && mux.uploadId === r2.id)
    return 'strong_uploadid'
  if (mux != null && mux.uploadUrl != null && mux.uploadUrl === r2.publicUrl)
    return 'strong_publicurl'
  return 'weak_filename'
}

type Pick =
  | { kind: 'pick'; candidate: Candidate; confidence: 'strong' | 'weak' }
  | { kind: 'ambiguous'; reason: string }
  | { kind: 'no_candidate' }

function pickCandidate(candidates: Candidate[]): Pick {
  if (candidates.length === 0) return { kind: 'no_candidate' }

  const strong = candidates.filter(
    (c) => c.kind === 'strong_uploadid' || c.kind === 'strong_publicurl'
  )
  if (strong.length === 1)
    return { kind: 'pick', candidate: strong[0], confidence: 'strong' }
  if (strong.length > 1) {
    const ids = strong.map((c) => c.r2.id).join(', ')
    return {
      kind: 'ambiguous',
      reason: `multiple strong matches: ${ids}`
    }
  }

  if (candidates.length === 1)
    return { kind: 'pick', candidate: candidates[0], confidence: 'weak' }

  const ids = candidates.map((c) => c.r2.id).join(', ')
  return {
    kind: 'ambiguous',
    reason: `${candidates.length} weak (filename-only) matches: ${ids}`
  }
}

// ---------- proposed updates

type MuxUpdate = {
  name?: string
  uploadUrl?: string
  uploadId?: string
}

type Proposal = {
  variantAssetId: string
  muxUpdate: MuxUpdate | null
}

function computeProposal(
  r2: R2Row,
  mux: MuxRow | null,
  confidence: 'strong' | 'weak'
): Proposal {
  const muxUpdate: MuxUpdate = {}
  if (mux != null) {
    if (mux.name == null && r2.originalFilename != null)
      muxUpdate.name = r2.originalFilename
    if (mux.uploadUrl == null && r2.publicUrl != null)
      muxUpdate.uploadUrl = r2.publicUrl
    // Only write the unique uploadId for STRONG picks. Writing it from a
    // filename-only guess would poison the @unique field with potentially
    // wrong-but-unique data that future runs would treat as authoritative.
    if (confidence === 'strong' && mux.uploadId == null)
      muxUpdate.uploadId = r2.id
  }
  return {
    variantAssetId: r2.id,
    muxUpdate: Object.keys(muxUpdate).length > 0 ? muxUpdate : null
  }
}

// ---------- DB access

const VARIANT_SELECT = {
  id: true,
  videoId: true,
  languageId: true,
  version: true,
  edition: true,
  assetId: true,
  muxVideoId: true,
  muxVideo: {
    select: {
      id: true,
      name: true,
      uploadUrl: true,
      uploadId: true,
      assetId: true,
      playbackId: true,
      readyToStream: true
    }
  }
} as const

const R2_CANDIDATE_SELECT = {
  id: true,
  fileName: true,
  originalFilename: true,
  publicUrl: true,
  videoId: true,
  createdAt: true
} as const

async function loadVariant(variantId: string): Promise<VariantRow | null> {
  return prisma.videoVariant.findUnique({
    where: { id: variantId },
    select: VARIANT_SELECT
  })
}

// Variants with no `hls` have no streamable video and therefore no R2 asset
// to link. Container labels (collection, series) are also excluded — they
// hold metadata variants for their child videos, not media of their own.
async function loadUnlinkedVariants(limit: number): Promise<VariantRow[]> {
  return prisma.videoVariant.findMany({
    where: {
      assetId: null,
      AND: [{ hls: { not: null } }, { hls: { not: '' } }],
      video: { label: { notIn: ['collection', 'series'] } }
    },
    select: VARIANT_SELECT,
    orderBy: { createdAt: 'desc' },
    take: limit
  })
}

async function findCandidatesForVariant(
  variant: VariantRow
): Promise<Candidate[]> {
  const r2s = await prisma.cloudflareR2.findMany({
    where: {
      videoId: variant.videoId,
      fileName: {
        startsWith: videosFileNamePrefix(variant.videoId, variant.languageId)
      },
      videoVariant: null,
      videoSubtitleSrt: null,
      videoSubtitleVtt: null
    },
    select: R2_CANDIDATE_SELECT,
    orderBy: { createdAt: 'desc' }
  })

  return r2s.map((r2) => ({ r2, kind: classifyCandidate(r2, variant.muxVideo) }))
}

async function loadR2(r2Id: string): Promise<R2Row | null> {
  return prisma.cloudflareR2.findUnique({
    where: { id: r2Id },
    select: R2_CANDIDATE_SELECT
  })
}

async function applyProposal(
  variantId: string,
  muxId: string | null,
  proposal: Proposal
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const result = await tx.videoVariant.updateMany({
      where: { id: variantId, assetId: null },
      data: { assetId: proposal.variantAssetId }
    })
    if (result.count !== 1) {
      throw new Error(
        `variant ${variantId} update affected ${result.count} rows; aborting (assetId may have been set concurrently)`
      )
    }
    if (muxId != null && proposal.muxUpdate != null) {
      await tx.muxVideo.update({
        where: { id: muxId },
        data: proposal.muxUpdate
      })
    }
  })
}

// ---------- printing

function fmt(value: string | number | boolean | Date | null | undefined): string {
  if (value == null) return 'null'
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'string' && value.length > 100)
    return `${value.slice(0, 97)}...`
  return String(value)
}

function fmtChange(
  label: string,
  before: string | number | boolean | Date | null | undefined,
  after?: string | number | boolean | Date | null | undefined,
  source?: string
): string {
  const padded = label.padEnd(13)
  if (after === undefined)
    return `    ${padded}: ${fmt(before)}`
  return `    ${padded}: ${fmt(before)}  →  ${fmt(after)}${source != null ? `   [from ${source}]` : ''}`
}

function printVariant(variant: VariantRow): void {
  console.log(`  Variant ${variant.id}:`)
  console.log(fmtChange('videoId', variant.videoId))
  console.log(fmtChange('languageId', variant.languageId))
  console.log(fmtChange('version/edition', `${variant.version}/${variant.edition}`))
  console.log(fmtChange('assetId', variant.assetId))
  console.log(fmtChange('muxVideoId', variant.muxVideoId))
}

function printMux(mux: MuxRow | null): void {
  if (mux == null) {
    console.log('  MuxVideo: (variant has no muxVideoId)')
    return
  }
  console.log(`  MuxVideo ${mux.id}:`)
  console.log(fmtChange('name', mux.name))
  console.log(fmtChange('uploadUrl', mux.uploadUrl))
  console.log(fmtChange('uploadId', mux.uploadId))
  console.log(fmtChange('assetId', mux.assetId))
  console.log(fmtChange('playbackId', mux.playbackId))
  console.log(fmtChange('readyToStream', mux.readyToStream))
}

function printCandidate(idx: number, c: Candidate): void {
  const label =
    c.kind === 'strong_uploadid'
      ? 'STRONG (mux.uploadId match)'
      : c.kind === 'strong_publicurl'
        ? 'STRONG (mux.uploadUrl match)'
        : 'WEAK (filename only)'
  console.log(`    [${idx + 1}] ${c.r2.id}  ${label}`)
  console.log(`        fileName        : ${fmt(c.r2.fileName)}`)
  console.log(`        originalFilename: ${fmt(c.r2.originalFilename)}`)
  console.log(`        publicUrl       : ${fmt(c.r2.publicUrl)}`)
  console.log(`        createdAt       : ${fmt(c.r2.createdAt)}`)
}

function printProposal(
  variant: VariantRow,
  proposal: Proposal,
  confidence: 'strong' | 'weak'
): void {
  console.log(`  Proposed updates (confidence=${confidence}):`)
  console.log(
    fmtChange(
      'VV.assetId',
      variant.assetId,
      proposal.variantAssetId,
      'R2.id'
    )
  )
  if (proposal.muxUpdate == null) {
    console.log('    (no MuxVideo updates needed)')
    return
  }
  const mux = variant.muxVideo
  if (mux == null) return
  if (proposal.muxUpdate.name != null)
    console.log(
      fmtChange('mux.name', mux.name, proposal.muxUpdate.name, 'R2.originalFilename')
    )
  if (proposal.muxUpdate.uploadUrl != null)
    console.log(
      fmtChange(
        'mux.uploadUrl',
        mux.uploadUrl,
        proposal.muxUpdate.uploadUrl,
        'R2.publicUrl'
      )
    )
  if (proposal.muxUpdate.uploadId != null)
    console.log(
      fmtChange('mux.uploadId', mux.uploadId, proposal.muxUpdate.uploadId, 'R2.id')
    )
  if (confidence === 'weak' && mux.uploadId == null) {
    console.log(
      `    mux.uploadId  : SKIPPED (weak match — refusing to write @unique field from filename-only guess)`
    )
  }
}

// ---------- backfill subcommand

type BackfillOutcome =
  | { kind: 'no_candidate' }
  | { kind: 'ambiguous'; reason: string }
  | { kind: 'pick'; r2Id: string; confidence: 'strong' | 'weak' }
  | { kind: 'applied'; r2Id: string; confidence: 'strong' | 'weak' }
  | { kind: 'error'; message: string }

async function backfillVariant(
  index: number,
  total: number,
  variant: VariantRow,
  options: { explicitR2Id: string | null; applyChanges: boolean }
): Promise<BackfillOutcome> {
  console.log(`[${index + 1}/${total}] ${variant.id}`)

  if (variant.assetId != null) {
    console.log(`  SKIP: variant already has assetId=${variant.assetId}\n`)
    return { kind: 'error', message: 'already linked' }
  }

  printVariant(variant)
  printMux(variant.muxVideo)

  let candidates = await findCandidatesForVariant(variant)
  console.log(`  Candidate R2s: ${candidates.length}`)
  candidates.forEach((c, i) => printCandidate(i, c))

  let pick: Pick
  if (options.explicitR2Id != null) {
    const explicit = candidates.find((c) => c.r2.id === options.explicitR2Id)
    if (explicit == null) {
      // fall back to loading the R2 directly so the user can override even
      // when our auto-search didn't return it (eg. R2.videoId mismatch)
      const r2 = await loadR2(options.explicitR2Id)
      if (r2 == null) {
        console.log(`  ERROR: --r2 ${options.explicitR2Id} not found\n`)
        return { kind: 'error', message: 'r2 not found' }
      }
      const candidate: Candidate = {
        r2,
        kind: classifyCandidate(r2, variant.muxVideo)
      }
      candidates = [candidate, ...candidates.filter((c) => c.r2.id !== r2.id)]
      pick = {
        kind: 'pick',
        candidate,
        confidence:
          candidate.kind === 'weak_filename' ? 'weak' : 'strong'
      }
      console.log(
        `  Override: --r2 ${r2.id} not in auto-candidate set; using anyway`
      )
    } else {
      pick = {
        kind: 'pick',
        candidate: explicit,
        confidence: explicit.kind === 'weak_filename' ? 'weak' : 'strong'
      }
      console.log(`  Override: human picked R2 ${explicit.r2.id}`)
    }
  } else {
    pick = pickCandidate(candidates)
  }

  if (pick.kind === 'no_candidate') {
    console.log(
      `  Decision: NO_CANDIDATE — no R2 fileName matches (videoId=${variant.videoId}, languageId=${variant.languageId}). Skipping.\n`
    )
    return { kind: 'no_candidate' }
  }

  if (pick.kind === 'ambiguous') {
    console.log(`  Decision: AMBIGUOUS — ${pick.reason}.`)
    console.log(
      `  Hint: re-run with \`backfill --variant ${variant.id} --r2 <chosen-r2-id>\` to pick explicitly.\n`
    )
    return { kind: 'ambiguous', reason: pick.reason }
  }

  const proposal = computeProposal(
    pick.candidate.r2,
    variant.muxVideo,
    pick.confidence
  )
  console.log(
    `  Decision: PICK ${pick.candidate.r2.id} (${pick.confidence})`
  )
  printProposal(variant, proposal, pick.confidence)

  if (!options.applyChanges) {
    console.log('')
    return {
      kind: 'pick',
      r2Id: pick.candidate.r2.id,
      confidence: pick.confidence
    }
  }

  try {
    await applyProposal(variant.id, variant.muxVideoId, proposal)
    console.log(`  APPLIED\n`)
    return {
      kind: 'applied',
      r2Id: pick.candidate.r2.id,
      confidence: pick.confidence
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.log(`  ERROR: ${message}\n`)
    return { kind: 'error', message }
  }
}

async function runBackfill(opts: {
  sampleSize: number | null
  variantId: string | null
  explicitR2Id: string | null
  applyChanges: boolean
}): Promise<void> {
  let variants: VariantRow[]
  if (opts.variantId != null) {
    const v = await loadVariant(opts.variantId)
    if (v == null) {
      console.error(`Variant not found: ${opts.variantId}`)
      process.exit(1)
    }
    variants = [v]
  } else if (opts.sampleSize != null) {
    variants = await loadUnlinkedVariants(opts.sampleSize)
    console.log(
      `Sampled ${variants.length} unlinked variant(s) (assetId IS NULL).\n`
    )
  } else {
    console.error(
      'backfill requires --sample [N] or --variant <id>'
    )
    process.exit(1)
  }

  console.log(
    `Mode: backfill [${opts.applyChanges ? 'APPLY' : 'DRY-RUN'}]\n`
  )

  const tally = {
    pickStrong: 0,
    pickWeak: 0,
    appliedStrong: 0,
    appliedWeak: 0,
    ambiguous: 0,
    noCandidate: 0,
    error: 0
  }

  try {
    for (let i = 0; i < variants.length; i++) {
      const outcome = await backfillVariant(i, variants.length, variants[i], {
        explicitR2Id: opts.explicitR2Id,
        applyChanges: opts.applyChanges
      })
      switch (outcome.kind) {
        case 'pick':
          if (outcome.confidence === 'strong') tally.pickStrong++
          else tally.pickWeak++
          break
        case 'applied':
          if (outcome.confidence === 'strong') tally.appliedStrong++
          else tally.appliedWeak++
          break
        case 'ambiguous':
          tally.ambiguous++
          break
        case 'no_candidate':
          tally.noCandidate++
          break
        case 'error':
          tally.error++
          break
      }
    }
    console.log(`Summary:`)
    console.log(`  strong picks:   ${tally.pickStrong + tally.appliedStrong}`)
    console.log(`  weak picks:     ${tally.pickWeak + tally.appliedWeak}`)
    console.log(`  ambiguous:      ${tally.ambiguous}`)
    console.log(`  no candidate:   ${tally.noCandidate}`)
    console.log(`  errors:         ${tally.error}`)
    if (opts.applyChanges) {
      console.log(
        `  applied:        ${tally.appliedStrong + tally.appliedWeak} (${tally.appliedStrong} strong, ${tally.appliedWeak} weak)`
      )
    } else {
      console.log(
        `\n  Dry-run only. Re-run with --apply to write changes.`
      )
    }
  } finally {
    await prisma.$disconnect()
  }
}

// ---------- verify subcommand

type VerifyIssue = {
  variantId: string
  level: 'error' | 'warn'
  message: string
}

async function runVerify(opts: {
  limit: number
  pageSize: number
}): Promise<void> {
  console.log(
    `Mode: verify — checking up to ${opts.limit} VideoVariants with assetId IS NOT NULL\n`
  )

  let cursor: string | undefined = undefined
  let totalChecked = 0
  let okCount = 0
  let warnCount = 0
  let errorCount = 0
  const issues: VerifyIssue[] = []

  try {
    while (totalChecked < opts.limit) {
      const remaining = opts.limit - totalChecked
      const take = Math.min(opts.pageSize, remaining)
      const rows: Array<{
        id: string
        videoId: string
        languageId: string
        version: number
        edition: string
        assetId: string | null
        asset: {
          id: string
          fileName: string
          videoId: string | null
          publicUrl: string | null
          videoSubtitleSrt: { id: string } | null
          videoSubtitleVtt: { id: string } | null
        } | null
        muxVideo: { id: string; uploadId: string | null; uploadUrl: string | null } | null
      }> = await prisma.videoVariant.findMany({
        where: { assetId: { not: null } },
        select: {
          id: true,
          videoId: true,
          languageId: true,
          version: true,
          edition: true,
          assetId: true,
          asset: {
            select: {
              id: true,
              fileName: true,
              videoId: true,
              publicUrl: true,
              videoSubtitleSrt: { select: { id: true } },
              videoSubtitleVtt: { select: { id: true } }
            }
          },
          muxVideo: {
            select: { id: true, uploadId: true, uploadUrl: true }
          }
        },
        orderBy: { id: 'asc' },
        take,
        ...(cursor != null
          ? { skip: 1, cursor: { id: cursor } }
          : {})
      })

      if (rows.length === 0) break

      for (const row of rows) {
        totalChecked++
        const rowIssues: VerifyIssue[] = []

        if (row.assetId != null && row.asset == null) {
          rowIssues.push({
            variantId: row.id,
            level: 'error',
            message: `assetId=${row.assetId} but linked R2 not found (orphan FK)`
          })
        }

        if (row.asset != null) {
          if (
            row.asset.videoId != null &&
            row.asset.videoId !== row.videoId
          ) {
            rowIssues.push({
              variantId: row.id,
              level: 'error',
              message: `R2.videoId=${row.asset.videoId} disagrees with VV.videoId=${row.videoId}`
            })
          }

          const extracted = extractFromFileName(row.asset.fileName)
          if (extracted == null) {
            rowIssues.push({
              variantId: row.id,
              level: 'warn',
              message: `R2.fileName does not match expected pattern: ${row.asset.fileName}`
            })
          } else {
            if (extracted.videoId !== row.videoId) {
              rowIssues.push({
                variantId: row.id,
                level: 'error',
                message: `R2.fileName videoId=${extracted.videoId} disagrees with VV.videoId=${row.videoId}`
              })
            }
            if (extracted.languageId !== row.languageId) {
              rowIssues.push({
                variantId: row.id,
                level: 'error',
                message: `R2.fileName languageId=${extracted.languageId} disagrees with VV.languageId=${row.languageId}`
              })
            }
          }

          if (
            row.asset.videoSubtitleSrt != null ||
            row.asset.videoSubtitleVtt != null
          ) {
            rowIssues.push({
              variantId: row.id,
              level: 'error',
              message: `R2 ${row.asset.id} is also linked as a subtitle asset`
            })
          }

          if (
            row.muxVideo != null &&
            row.muxVideo.uploadId != null &&
            row.muxVideo.uploadId !== row.asset.id
          ) {
            rowIssues.push({
              variantId: row.id,
              level: 'warn',
              message: `MuxVideo.uploadId=${row.muxVideo.uploadId} disagrees with VV.assetId=${row.asset.id}`
            })
          }
          if (
            row.muxVideo != null &&
            row.muxVideo.uploadUrl != null &&
            row.asset.publicUrl != null &&
            row.muxVideo.uploadUrl !== row.asset.publicUrl
          ) {
            rowIssues.push({
              variantId: row.id,
              level: 'warn',
              message: `MuxVideo.uploadUrl != R2.publicUrl`
            })
          }
        }

        if (rowIssues.length === 0) {
          okCount++
        } else {
          for (const issue of rowIssues) {
            if (issue.level === 'error') errorCount++
            else warnCount++
            console.log(
              `  ${issue.level.toUpperCase()} variant=${row.id}: ${issue.message}`
            )
            issues.push(issue)
          }
        }
      }

      cursor = rows[rows.length - 1].id
      if (rows.length < take) break
    }

    console.log(`\nVerify summary:`)
    console.log(`  checked: ${totalChecked}`)
    console.log(`  ok:      ${okCount}`)
    console.log(`  warn:    ${warnCount}`)
    console.log(`  error:   ${errorCount}`)
  } finally {
    await prisma.$disconnect()
  }
}

// ---------- arg parsing

type Args =
  | {
      mode: 'backfill'
      sampleSize: number | null
      variantId: string | null
      explicitR2Id: string | null
      applyChanges: boolean
    }
  | { mode: 'verify'; limit: number; pageSize: number }
  | { mode: 'usage' }

function parseArgs(argv: string[]): Args {
  const sub = argv[0]

  if (sub === 'verify') {
    const rest = argv.slice(1)
    const limit = readNumber(rest, '--limit') ?? 1000
    const pageSize = readNumber(rest, '--page-size') ?? 200
    return { mode: 'verify', limit, pageSize }
  }

  if (sub === 'backfill') {
    const rest = argv.slice(1)
    const sampleSize = readNumber(rest, '--sample')
    const variantId = readString(rest, '--variant')
    const explicitR2Id = readString(rest, '--r2')
    const applyChanges = rest.includes('--apply')
    return {
      mode: 'backfill',
      sampleSize,
      variantId,
      explicitR2Id,
      applyChanges
    }
  }

  return { mode: 'usage' }
}

function readNumber(argv: string[], flag: string): number | null {
  const idx = argv.indexOf(flag)
  if (idx === -1) return null
  const next = argv[idx + 1]
  if (next != null && /^\d+$/.test(next)) return Number(next)
  return 10
}

function readString(argv: string[], flag: string): string | null {
  const idx = argv.indexOf(flag)
  if (idx === -1) return null
  const next = argv[idx + 1]
  if (next == null || next.startsWith('--')) return null
  return next
}

function printUsage(): void {
  console.error(
    [
      'usage:',
      '  verify [--limit N] [--page-size N]',
      '       Sanity check that existing VideoVariant.assetId values link to',
      '       valid CloudflareR2 records and agree with VV.videoId/languageId',
      '       and MuxVideo signals.',
      '',
      '  backfill --sample [N]                # propose links for N unlinked variants',
      '  backfill --variant <variantId>       # propose links for one variant',
      '  backfill --variant <id> --r2 <r2Id>  # human override of pick',
      '  ... add --apply to write changes',
      ''
    ].join('\n')
  )
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))

  if (args.mode === 'usage') {
    printUsage()
    process.exit(1)
  }

  if (args.mode === 'verify') {
    await runVerify({ limit: args.limit, pageSize: args.pageSize })
    return
  }

  await runBackfill({
    sampleSize: args.sampleSize,
    variantId: args.variantId,
    explicitR2Id: args.explicitR2Id,
    applyChanges: args.applyChanges
  })
}

void main()
