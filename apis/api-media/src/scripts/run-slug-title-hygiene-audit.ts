import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { prisma } from '@core/prisma/media/client'

import { logger } from '../logger'

import {
  type SlugTitleHygieneFinding,
  auditSlugTitleHygiene
} from './audit-slug-title-hygiene'

const WATCH_HOST = 'https://www.jesusfilm.org'
const REQUEST_TIMEOUT_MS = 10_000
const DELAY_BETWEEN_REQUESTS_MS = 150
const PROGRESS_LOG_EVERY = 25
// Safety valve: low-confidence findings (all-caps tokens, dash-separated
// titles) had a ~97% false-positive rate in the earlier catalog sample, but
// span every language of every video. Checking all of them live would mean
// an unbounded number of production requests before anyone has seen the
// finding count. Skip live checks for them by default; opt in explicitly.
const CHECK_LOW_CONFIDENCE_REACHABILITY =
  process.env['SLUG_TITLE_AUDIT_CHECK_ALL'] === 'true'
// Second safety valve regardless of the above: never fire more than this
// many live requests at production in one run.
const MAX_REACHABILITY_CHECKS = Number(
  process.env['SLUG_TITLE_AUDIT_MAX_CHECKS'] ?? 500
)

type ReachabilityCategory =
  | 'LIVE'
  | 'BROKEN'
  | 'UNKNOWN'
  | 'NO_SLUG'
  | 'SKIPPED_LOW_CONFIDENCE'
  | 'SKIPPED_CHECK_LIMIT'

interface ReachabilityResult {
  category: ReachabilityCategory
  status: number | null
  checkedUrl: string | null
  finalUrl: string | null
}

interface AuditRow extends SlugTitleHygieneFinding {
  reachability: ReachabilityResult
}

function lastPathSegment(slug: string): string {
  return slug.split('/').filter(Boolean).at(-1) ?? slug
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function checkReachability(url: string): Promise<ReachabilityResult> {
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    })
    return {
      category: response.ok ? 'LIVE' : 'BROKEN',
      status: response.status,
      checkedUrl: url,
      finalUrl: response.url
    }
  } catch {
    return {
      category: 'UNKNOWN',
      status: null,
      checkedUrl: url,
      finalUrl: null
    }
  }
}

/**
 * Picks a variant to check a finding's video against: the finding's own
 * language when it has one, else the first variant found. Read-only.
 */
function pickVariantSlug(
  finding: SlugTitleHygieneFinding,
  variantsByVideoId: Map<string, { slug: string; languageId: string }[]>
): string | null {
  if (finding.field === 'VideoVariant.slug' && finding.variantSlug != null) {
    return finding.variantSlug
  }
  const variants = variantsByVideoId.get(finding.videoId) ?? []
  const matching = variants.find((v) => v.languageId === finding.languageId)
  return (matching ?? variants[0])?.slug ?? null
}

const NO_SLUG_RESULT: ReachabilityResult = {
  category: 'NO_SLUG',
  status: null,
  checkedUrl: null,
  finalUrl: null
}

async function withReachability(
  findings: SlugTitleHygieneFinding[],
  variantsByVideoId: Map<string, { slug: string; languageId: string }[]>
): Promise<AuditRow[]> {
  const rows: AuditRow[] = []
  // Multiple findings often resolve to the same watch URL (e.g. Video.slug
  // and VideoTitle.value both flagged on the same video/language) — reuse
  // one live check across all of them instead of re-fetching.
  const urlCache = new Map<string, ReachabilityResult>()
  let checksPerformed = 0

  for (const finding of findings) {
    if (finding.videoSlug == null) {
      rows.push({ ...finding, reachability: NO_SLUG_RESULT })
      continue
    }

    const variantSlug = pickVariantSlug(finding, variantsByVideoId)
    if (variantSlug == null) {
      rows.push({ ...finding, reachability: NO_SLUG_RESULT })
      continue
    }

    if (finding.needsContentReview && !CHECK_LOW_CONFIDENCE_REACHABILITY) {
      rows.push({
        ...finding,
        reachability: {
          category: 'SKIPPED_LOW_CONFIDENCE',
          status: null,
          checkedUrl: null,
          finalUrl: null
        }
      })
      continue
    }

    const url = `${WATCH_HOST}/watch/${finding.videoSlug}/${lastPathSegment(variantSlug)}`
    const cached = urlCache.get(url)
    if (cached != null) {
      rows.push({ ...finding, reachability: cached })
      continue
    }

    if (checksPerformed >= MAX_REACHABILITY_CHECKS) {
      rows.push({
        ...finding,
        reachability: {
          category: 'SKIPPED_CHECK_LIMIT',
          status: null,
          checkedUrl: url,
          finalUrl: null
        }
      })
      continue
    }

    const reachability = await checkReachability(url)
    urlCache.set(url, reachability)
    checksPerformed++
    if (checksPerformed % PROGRESS_LOG_EVERY === 0) {
      logger.info(
        { checksPerformed, limit: MAX_REACHABILITY_CHECKS },
        'Reachability check progress'
      )
    }
    rows.push({ ...finding, reachability })
    await sleep(DELAY_BETWEEN_REQUESTS_MS)
  }

  return rows
}

// Risk ordering per the original ask: renaming a slug that is currently LIVE
// risks a fresh 404, so those sort first. A slug that is already BROKEN has
// nothing to lose from a rename (fixing it can only help).
const EXPOSURE_RANK: Record<ReachabilityCategory, number> = {
  LIVE: 0,
  BROKEN: 1,
  UNKNOWN: 2,
  NO_SLUG: 3,
  SKIPPED_CHECK_LIMIT: 4,
  SKIPPED_LOW_CONFIDENCE: 5
}

function sortByExposure(rows: AuditRow[]): AuditRow[] {
  return [...rows].sort((a, b) => {
    const rankDiff =
      EXPOSURE_RANK[a.reachability.category] -
      EXPOSURE_RANK[b.reachability.category]
    if (rankDiff !== 0) return rankDiff
    return Number(a.needsContentReview) - Number(b.needsContentReview)
  })
}

function toCsvValue(value: string | number | boolean | null): string {
  const stringValue = value == null ? '' : String(value)
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

const CSV_COLUMNS: Array<
  [string, (row: AuditRow) => string | number | boolean | null]
> = [
  ['videoId', (r) => r.videoId],
  ['field', (r) => r.field],
  ['languageId', (r) => r.languageId],
  ['currentValue', (r) => r.currentValue],
  ['proposedValue', (r) => r.proposedValue],
  ['reasons', (r) => r.reasons.join(';')],
  ['needsContentReview', (r) => r.needsContentReview],
  ['published', (r) => r.published],
  ['reachability', (r) => r.reachability.category],
  ['httpStatus', (r) => r.reachability.status],
  ['checkedUrl', (r) => r.reachability.checkedUrl],
  ['finalUrl', (r) => r.reachability.finalUrl]
]

function toCsv(rows: AuditRow[]): string {
  const header = CSV_COLUMNS.map(([name]) => name).join(',')
  const lines = rows.map((row) =>
    CSV_COLUMNS.map(([, getValue]) => toCsvValue(getValue(row))).join(',')
  )
  return [header, ...lines].join('\n') + '\n'
}

async function main(): Promise<void> {
  if (process.env['PG_DATABASE_URL_MEDIA'] == null) {
    logger.error(
      'PG_DATABASE_URL_MEDIA is not set. Point it at a read replica if one exists — this script only reads.'
    )
    process.exitCode = 1
    return
  }

  const outDir = process.env['SLUG_TITLE_AUDIT_OUT_DIR'] ?? 'docs/research'
  const dateStamp = new Date().toISOString().slice(0, 10)
  const jsonPath = path.join(
    outDir,
    `${dateStamp}-fge2-slug-title-audit-prod.json`
  )
  const csvPath = path.join(
    outDir,
    `${dateStamp}-fge2-slug-title-audit-prod.csv`
  )

  logger.info(
    'Scanning Video/VideoTitle/VideoVariant for slug/title hygiene issues (read-only)...'
  )
  const findings = await auditSlugTitleHygiene()
  const highConfidenceCount = findings.filter(
    (f) => !f.needsContentReview
  ).length
  logger.info(
    {
      total: findings.length,
      highConfidence: highConfidenceCount,
      needsContentReview: findings.length - highConfidenceCount,
      checkingLowConfidenceLive: CHECK_LOW_CONFIDENCE_REACHABILITY,
      maxReachabilityChecks: MAX_REACHABILITY_CHECKS
    },
    'Findings before reachability check'
  )

  const variantRows = await prisma.videoVariant.findMany({
    select: { videoId: true, slug: true, languageId: true }
  })
  const variantsByVideoId = new Map<
    string,
    { slug: string; languageId: string }[]
  >()
  for (const variant of variantRows) {
    const existing = variantsByVideoId.get(variant.videoId) ?? []
    existing.push({ slug: variant.slug, languageId: variant.languageId })
    variantsByVideoId.set(variant.videoId, existing)
  }

  logger.info(
    'Checking public reachability against production (rate-limited)...'
  )
  const rows = sortByExposure(
    await withReachability(findings, variantsByVideoId)
  )

  await mkdir(outDir, { recursive: true })
  await writeFile(jsonPath, JSON.stringify(rows, null, 2) + '\n', 'utf-8')
  await writeFile(csvPath, toCsv(rows), 'utf-8')

  const summary = rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.reachability.category] = (acc[row.reachability.category] ?? 0) + 1
    return acc
  }, {})

  logger.info(
    { total: rows.length, byReachability: summary, jsonPath, csvPath },
    'Slug/title hygiene audit complete — no data was changed'
  )
}

void main()
