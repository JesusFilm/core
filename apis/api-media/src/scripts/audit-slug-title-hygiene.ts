import { prisma } from '@core/prisma/media/client'

export type SlugTitleHygieneField =
  | 'Video.slug'
  | 'VideoTitle.value'
  | 'VideoVariant.slug'

export type SlugTitleHygieneReason =
  | 'underscore'
  | 'leading-or-trailing-whitespace'
  | 'file-extension-remnant'
  | 'version-tag-remnant'
  | 'duplicated-word'
  | 'possible-multilingual-concatenation'
  | 'all-caps-token'

export interface SlugTitleHygieneFinding {
  videoId: string
  videoSlug: string | null
  published: boolean
  field: SlugTitleHygieneField
  languageId: string | null
  /** Present only for VideoVariant findings; used to build the public watch URL. */
  variantSlug: string | null
  currentValue: string
  reasons: SlugTitleHygieneReason[]
  /** A mechanical fix is only proposed when every matched reason is safe to auto-correct. */
  proposedValue: string | null
  needsContentReview: boolean
}

// Structural patterns: safe to mechanically fix once flagged.
const UNDERSCORE_RE = /_/
const WHITESPACE_RE = /^\s|\s$/
const FILE_EXTENSION_RE =
  /\.(mp4|mov|mxf|wav|mp3|avi|mkv|mpg|mpeg|mts|m4v|m4a|webm)$/i
// Underscore-only separator: filename-derived version tags are joined with
// an underscore (e.g. "video_final.mp4"). A space or hyphen before one of
// these words is far more likely to be an ordinary English word ("Being
// Made New", "Sacrifício final") than a real version-tag remnant, and
// mechanically dropping it would silently change the title's meaning.
const VERSION_TAG_RE = /_(v\d+|final|draft|master|copy|old|new|temp|tmp)$/i
// \b is ASCII-only (based on \w), so it misreads the boundary right before a
// diacritic letter — e.g. "Thiên" splits into a false "Thi" that then looks
// duplicated against a preceding "Thi". Match word edges via \p{L} lookaround
// instead so non-ASCII letters count as "still part of the word".
const DUPLICATED_WORD_RE =
  /(?<![\p{L}'-])(\p{L}[\p{L}'-]{2,})\s+\1(?![\p{L}'-])/iu

// Soft heuristics: flagged for human triage only, never auto-fixed. Both had a
// high false-positive rate against real catalog data (legit branding like
// "LUMO", "YHWH", "MENA", and dash-subtitled titles like "Jesus: The Story").
const ALL_CAPS_TOKEN_RE = /\b[A-Z]{3,}\b/
// A previous version of this check was a single regex with nested unbounded
// groups on both sides of the separator, which let the engine redistribute
// word-boundary splits between the outer and inner `*` quantifiers —
// catastrophic backtracking on any long non-matching title. Splitting on the
// separator first, then testing each side with a single linear-time regex,
// detects the same "Capitalized Phrase - Capitalized Phrase" shape without
// the exponential blowup.
const TWO_PHRASE_SEPARATOR_RE = /\s[-–—:]\s/gu
const PLAIN_WORD_RE = /^[\p{L}'-]+$/u
const CAPITALIZED_WORD_RE = /^\p{Lu}[\p{L}'-]*$/u

function isCapitalizedPhrase(value: string): boolean {
  const words = value.split(/\s+/)
  return (
    words.length > 0 &&
    CAPITALIZED_WORD_RE.test(words[0]) &&
    words.every((word) => PLAIN_WORD_RE.test(word))
  )
}

function isDashSeparatedTwoPhrase(value: string): boolean {
  for (const separator of value.matchAll(TWO_PHRASE_SEPARATOR_RE)) {
    const left = value.slice(0, separator.index)
    const right = value.slice(
      separator.index + separator[0].length,
      value.length
    )
    if (
      left !== '' &&
      right !== '' &&
      isCapitalizedPhrase(left) &&
      isCapitalizedPhrase(right)
    ) {
      return true
    }
  }
  return false
}

const STRUCTURAL_REASONS: readonly SlugTitleHygieneReason[] = [
  'underscore',
  'leading-or-trailing-whitespace',
  'file-extension-remnant',
  'version-tag-remnant'
]

function applyMechanicalFix(
  value: string,
  field: SlugTitleHygieneField
): string {
  // Slugs can't contain spaces, so underscores collapse to dashes there
  // instead of spaces (titles) — see fix-underscore-video-slugs.ts for the
  // same dash convention applied to real slug renames.
  const isSlugField = field !== 'VideoTitle.value'
  const joiner = isSlugField ? '-' : ' '
  const fixed = value
    .trim()
    .replace(FILE_EXTENSION_RE, '')
    .replace(VERSION_TAG_RE, '')
    .replace(/_/g, joiner)
    .replace(isSlugField ? /-+/g : /\s+/g, joiner)
    .trim()
  return isSlugField ? fixed.replace(/^-+|-+$/g, '') : fixed
}

function detectReasons(value: string): SlugTitleHygieneReason[] {
  const reasons: SlugTitleHygieneReason[] = []
  if (UNDERSCORE_RE.test(value)) reasons.push('underscore')
  if (WHITESPACE_RE.test(value)) reasons.push('leading-or-trailing-whitespace')
  if (FILE_EXTENSION_RE.test(value)) reasons.push('file-extension-remnant')
  if (VERSION_TAG_RE.test(value)) reasons.push('version-tag-remnant')
  if (DUPLICATED_WORD_RE.test(value)) reasons.push('duplicated-word')
  if (isDashSeparatedTwoPhrase(value))
    reasons.push('possible-multilingual-concatenation')
  if (ALL_CAPS_TOKEN_RE.test(value)) reasons.push('all-caps-token')
  return reasons
}

function buildFinding(
  base: Omit<
    SlugTitleHygieneFinding,
    'reasons' | 'proposedValue' | 'needsContentReview'
  >
): SlugTitleHygieneFinding | null {
  const reasons = detectReasons(base.currentValue)
  if (reasons.length === 0) return null

  const isPurelyStructural = reasons.every((reason) =>
    STRUCTURAL_REASONS.includes(reason)
  )
  const proposedValue = isPurelyStructural
    ? applyMechanicalFix(base.currentValue, base.field)
    : null
  const needsContentReview =
    proposedValue == null || proposedValue === base.currentValue

  return { ...base, reasons, proposedValue, needsContentReview }
}

/**
 * Read-only scan of Video/VideoTitle/VideoVariant for internal-style values
 * that leaked into public-facing fields (FGE-2). Never writes to the database.
 */
export async function auditSlugTitleHygiene(): Promise<
  SlugTitleHygieneFinding[]
> {
  const videos = await prisma.video.findMany({
    select: {
      id: true,
      slug: true,
      published: true,
      title: { select: { value: true, languageId: true } },
      variants: { select: { slug: true, languageId: true } }
    }
  })

  const findings: SlugTitleHygieneFinding[] = []

  for (const video of videos) {
    if (video.slug != null) {
      const finding = buildFinding({
        videoId: video.id,
        videoSlug: video.slug,
        published: video.published,
        field: 'Video.slug',
        languageId: null,
        variantSlug: null,
        currentValue: video.slug
      })
      if (finding != null) findings.push(finding)
    }

    for (const title of video.title) {
      const finding = buildFinding({
        videoId: video.id,
        videoSlug: video.slug,
        published: video.published,
        field: 'VideoTitle.value',
        languageId: title.languageId,
        variantSlug: null,
        currentValue: title.value
      })
      if (finding != null) findings.push(finding)
    }

    for (const variant of video.variants) {
      const finding = buildFinding({
        videoId: video.id,
        videoSlug: video.slug,
        published: video.published,
        field: 'VideoVariant.slug',
        languageId: variant.languageId,
        variantSlug: variant.slug,
        currentValue: variant.slug
      })
      if (finding != null) findings.push(finding)
    }
  }

  return findings
}
