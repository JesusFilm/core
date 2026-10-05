import { GraphQLError } from 'graphql'
import slugify from 'slugify'
import type { ZodType } from 'zod'

import { Prisma, prisma } from '@core/prisma/journeys/client'

import { assertHttpsUrl } from '../templateGalleryPage/assertHttpsUrl'
import {
  RESERVED_SLUGS,
  SLUG_MAX_LENGTH,
  SLUG_PATTERN,
  SlugInvalidError,
  SlugReservedError,
  SlugTakenError
} from '../templateGalleryPage/generateUniqueSlug'

export { assertHttpsUrl }

/**
 * Every campaign mutation validates through these helpers before Prisma. Each
 * throws `BAD_USER_INPUT` with the offending column as `field`, so the editor
 * can show the message verbatim (PRD §15).
 */
export function badUserInput(message: string, field: string): GraphQLError {
  return new GraphQLError(message, {
    extensions: { code: 'BAD_USER_INPUT', field }
  })
}

const HEX_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

/**
 * Trim; accept `#RGB` or `#RRGGBB` in any case; return normalised `#RRGGBB`
 * uppercase. Named colours, `rgb()` and 8-digit alpha are rejected. An empty
 * string is never a colour — nullable columns take `null`, never `""`.
 */
export function assertHex(value: string, field: string): string {
  const trimmed = value.trim()
  if (!HEX_PATTERN.test(trimmed))
    throw badUserInput(`${field} must be a hex colour like #RRGGBB`, field)
  const digits = trimmed.slice(1)
  const expanded =
    digits.length === 3
      ? digits
          .split('')
          .map((d) => d + d)
          .join('')
      : digits
  return `#${expanded.toUpperCase()}`
}

/** `assertHex` for a nullable column: `null`/`undefined` pass through, `""` does not. */
export function assertHexOrNull<T extends string | null | undefined>(
  value: T,
  field: string
): T extends string ? string : T {
  if (value == null) return value as T extends string ? string : T
  return assertHex(value, field) as T extends string ? string : T
}

export const TEXT_CAPS = {
  campaignTitle: 100,
  regionName: 60,
  eyebrow: 80,
  title: 150,
  lede: 500,
  intro: 500,
  bullets: 1000,
  richTextContent: 5000,
  typographyContent: 2000,
  buttonLabel: 60,
  stringValue: 200,
  imageAlt: 500,
  videoTitle: 200,
  videoDescription: 1000,
  journeyTitle: 200,
  journeyDescription: 1000
} as const

export const LINK_URL_MAX_LENGTH = 2048
export const PALETTE_MAX_LENGTH = 8
export const REGION_COUNTRIES_MAX = 250

/**
 * Trim and count Unicode code points. Empty is allowed unless `required`;
 * over-length is `BAD_USER_INPUT` / `field`. Returns the trimmed value.
 */
export function assertLength(
  value: string,
  field: string,
  max: number,
  options: { required?: boolean } = {}
): string {
  const trimmed = value.trim()
  if (options.required === true && trimmed === '')
    throw badUserInput(`${field} is required`, field)
  if ([...trimmed].length > max)
    throw badUserInput(`${field} must be at most ${max} characters`, field)
  return trimmed
}

/** `assertLength` for a nullable column: `null`/`undefined` pass through. */
export function assertLengthOrNull<T extends string | null | undefined>(
  value: T,
  field: string,
  max: number
): T extends string ? string : T {
  if (value == null) return value as T extends string ? string : T
  return assertLength(value, field, max) as T extends string ? string : T
}

/** `LinkAction.url`: https and at most 2048 characters. */
export function assertLinkUrl(url: string, field = 'url'): string {
  const trimmed = url.trim()
  assertHttpsUrl(trimmed, field)
  if (trimmed.length > LINK_URL_MAX_LENGTH)
    throw badUserInput(
      `${field} must be at most ${LINK_URL_MAX_LENGTH} characters`,
      field
    )
  return trimmed
}

/** Enum columns take their enum's values only. */
export function assertEnum<const T extends string>(
  value: string,
  field: string,
  values: readonly T[]
): T {
  if (!(values as readonly string[]).includes(value))
    throw badUserInput(`${field} must be one of ${values.join(', ')}`, field)
  return value as T
}

/** `assertEnum` for a nullable column: `null`/`undefined` pass through. */
export function assertEnumOrNull<const T extends string>(
  value: string | null | undefined,
  field: string,
  values: readonly T[]
): T | null | undefined {
  if (value == null) return value
  return assertEnum(value, field, values)
}

/** Each palette entry normalised, deduplicated, capped at eight (newest first). */
export function assertPalette(entries: string[], field = 'palette'): string[] {
  const normalised = entries.map((entry) => assertHex(entry, field))
  return Array.from(new Set(normalised)).slice(0, PALETTE_MAX_LENGTH)
}

/** The same id twice is `BAD_USER_INPUT` on the id's column. */
export function assertUniqueIds(ids: string[], field: string): string[] {
  const seen = new Set<string>()
  for (const id of ids) {
    if (seen.has(id)) throw badUserInput(`${field} ${id} is listed twice`, field)
    seen.add(id)
  }
  return ids
}

/** Countries per region: no duplicates and at most 250. */
export function assertRegionCountries(countryIds: string[]): string[] {
  assertUniqueIds(countryIds, 'countryId')
  if (countryIds.length > REGION_COUNTRIES_MAX)
    throw badUserInput(
      `countryId: at most ${REGION_COUNTRIES_MAX} countries per region`,
      'countryId'
    )
  return countryIds
}

/**
 * Zod stays only for the id shapes it owns (YouTube, Mux). This wrapper turns
 * the first issue into `BAD_USER_INPUT` with `field` taken from its path,
 * falling back to `fallbackField` for a top-level issue.
 */
export function parseWithZod<T>(
  schema: ZodType<T>,
  value: unknown,
  fallbackField: string
): T {
  const result = schema.safeParse(value)
  if (result.success) return result.data
  const issue = result.error.issues[0]
  const field =
    issue != null && issue.path.length > 0
      ? issue.path.map(String).join('.')
      : fallbackField
  throw badUserInput(issue?.message ?? `${field} is invalid`, field)
}

// ---------------------------------------------------------------------------
// Slugs (PRD §8). Campaign slugs are globally unique; region slugs are unique
// per campaign and additionally reserve the first path segments the viewer owns
// on a domain root.
// ---------------------------------------------------------------------------

export { RESERVED_SLUGS, SLUG_MAX_LENGTH, SLUG_PATTERN }

export const REGION_RESERVED_SLUGS: ReadonlySet<string> = new Set([
  ...RESERVED_SLUGS,
  'embed',
  'legal',
  'plausible',
  'campaign',
  'template-gallery',
  'api',
  '_next'
])

function slugBase(source: string, reserved: ReadonlySet<string>): string {
  const normalized = slugify(source, { lower: true, strict: true })
  if (normalized === '' || reserved.has(normalized))
    throw new SlugReservedError(normalized === '' ? '(empty)' : normalized)
  return normalized.slice(0, SLUG_MAX_LENGTH)
}

function firstFreeSlug(base: string, taken: ReadonlySet<string>): string {
  if (!taken.has(base)) return base
  for (let suffix = 2; suffix <= 50; suffix++) {
    const suffixPart = `-${suffix}`
    const candidate = `${base.slice(0, SLUG_MAX_LENGTH - suffixPart.length)}${suffixPart}`
    if (!taken.has(candidate)) return candidate
  }
  throw new SlugTakenError()
}

function normalizeAuthorSlug(
  rawSlug: string,
  reserved: ReadonlySet<string>
): string {
  const slug = slugify(rawSlug, { lower: true, strict: true })
  if (!SLUG_PATTERN.test(slug) || slug.length > SLUG_MAX_LENGTH)
    throw new SlugInvalidError()
  if (reserved.has(slug)) throw new SlugReservedError(slug)
  return slug
}

/**
 * Generate a globally unique campaign slug from the title: slugify lower
 * strict, then the first free of `base`, `base-2` … `base-50`.
 */
export async function generateUniqueCampaignSlug(
  title: string,
  tx: Prisma.TransactionClient = prisma
): Promise<string> {
  const base = slugBase(title, RESERVED_SLUGS)
  const collisions = await tx.campaign.findMany({
    where: { slug: { startsWith: base } },
    select: { slug: true }
  })
  return firstFreeSlug(base, new Set(collisions.map((c) => c.slug)))
}

/** Validate an author-edited campaign slug: shape, reserved list, global uniqueness. */
export async function validateCampaignSlug(
  rawSlug: string,
  excludeId: string
): Promise<string> {
  const slug = normalizeAuthorSlug(rawSlug, RESERVED_SLUGS)
  const existing = await prisma.campaign.findFirst({
    where: { slug, NOT: { id: excludeId } },
    select: { id: true }
  })
  if (existing != null) throw new SlugTakenError()
  return slug
}

/** Generate a region slug from the name, unique within the campaign. */
export async function generateUniqueRegionSlug(
  campaignId: string,
  name: string,
  tx: Prisma.TransactionClient = prisma
): Promise<string> {
  const base = slugBase(name, REGION_RESERVED_SLUGS)
  const collisions = await tx.campaignRegion.findMany({
    where: { campaignId, slug: { startsWith: base } },
    select: { slug: true }
  })
  return firstFreeSlug(base, new Set(collisions.map((c) => c.slug)))
}

/** Validate an author-edited region slug against the campaign's other regions. */
export async function validateRegionSlug(
  campaignId: string,
  rawSlug: string,
  excludeRegionId: string
): Promise<string> {
  const slug = normalizeAuthorSlug(rawSlug, REGION_RESERVED_SLUGS)
  const existing = await prisma.campaignRegion.findFirst({
    where: { campaignId, slug, NOT: { id: excludeRegionId } },
    select: { id: true }
  })
  if (existing != null) throw new SlugTakenError()
  return slug
}
