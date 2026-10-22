import { GraphQLError } from 'graphql'
import slugify from 'slugify'
import { validate as isUuid } from 'uuid'
import type { ZodType } from 'zod'

import { VIEWER_RESERVED_SEGMENTS } from '@core/journeys/ui/Campaign/libs/viewerReservedSegments'
import { Prisma, prisma } from '@core/prisma/journeys/client'
import { FONT_FAMILIES } from '@core/shared/ui/fontFamilies'

import { assertHttpsUrl } from '../templateGalleryPage/assertHttpsUrl'
import {
  RESERVED_SLUGS,
  SLUG_MAX_LENGTH,
  SLUG_PATTERN,
  SlugInvalidError,
  SlugReservedError,
  SlugTakenError,
  firstFreeSlug,
  slugBase
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

/**
 * The null rule of every campaign update mutation: an omitted field
 * (`undefined`) is left alone, and an explicit `null` on a field that cannot
 * be null is `BAD_USER_INPUT` on that field. Nullable fields keep taking
 * `null` and do not go through this. Returns the value, undefined when
 * omitted.
 */
export function assertNotNull<T>(
  value: T | null | undefined,
  field: string
): T | undefined {
  if (value === null) throw badUserInput(`${field} cannot be null`, field)
  return value
}

/** The null rule, as the line each campaign update mutation's `Errors:` description carries. */
export const NULL_FIELD_ERROR =
  '- BAD_USER_INPUT (field: the field): `null` on a field that cannot be null. An omitted field is left alone; a field documented as nullable takes `null`.'

const HEX_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

/**
 * Trim; accept `#RGB` or `#RRGGBB` in any case; return normalised `#RRGGBB`
 * uppercase. Named colours, `rgb()` and 8-digit alpha are rejected. An empty
 * string is never a colour — nullable columns take `null`, never `""`.
 */
/**
 * A whole-number percentage (0 to 100) or null; undefined passes through so
 * an omitted field is left untouched. `BAD_USER_INPUT` / `field` otherwise.
 */
export function assertPercentOrNull<T extends number | null | undefined>(
  value: T,
  field: string
): T {
  if (value == null) return value
  if (!Number.isInteger(value) || value < 0 || value > 100)
    throw badUserInput(`${field} must be a whole number from 0 to 100`, field)
  return value
}

/** An image zoom is a whole percentage from no zoom to double. */
export const IMAGE_SCALE_MIN = 100
export const IMAGE_SCALE_MAX = 200

/**
 * A whole-number zoom percentage (100 to 200) or null (none); undefined
 * passes through so an omitted field is left untouched. `BAD_USER_INPUT` /
 * `field` otherwise.
 */
export function assertScaleOrNull<T extends number | null | undefined>(
  value: T,
  field: string
): T {
  if (value == null) return value
  if (
    !Number.isInteger(value) ||
    value < IMAGE_SCALE_MIN ||
    value > IMAGE_SCALE_MAX
  )
    throw badUserInput(
      `${field} must be a whole number from ${IMAGE_SCALE_MIN} to ${IMAGE_SCALE_MAX}`,
      field
    )
  return value
}

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

/**
 * A Campaign Theme font: null means the base theme default; a name must be
 * in the shared curated `FontFamily` list (PRD §4, §15). Never `""`.
 */
export function assertFontFamily<T extends string | null>(
  value: T,
  field: string
): T {
  if (value === null) return value
  if (!FONT_FAMILIES.includes(value))
    throw badUserInput(
      `${field} must be one of the offered fonts: ${FONT_FAMILIES.join(', ')}`,
      field
    )
  return value
}

export const TEXT_CAPS = {
  campaignTitle: 100,
  regionName: 60,
  eyebrow: 80,
  title: 150,
  description: 500,
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

// Every translation JSON, the public payload and the stats sweep grow with
// these. They bound adds only: a campaign already over one keeps working, it
// just cannot grow.
export const CAMPAIGN_LANGUAGES_MAX = 50
export const CAMPAIGN_REGIONS_MAX = 100
export const REGION_SHARE_LANGUAGES_MAX = 20
export const CAMPAIGN_BLOCKS_MAX = 500

/**
 * Cut to at most `max` Unicode code points: for text copied in from a source
 * (YouTube, Mux, a linked journey) so a later save of it passes the cap.
 */
export function truncate(value: string, max: number): string {
  const characters = [...value]
  return characters.length <= max ? value : characters.slice(0, max).join('')
}

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

/**
 * Keep line breaks, drop every other control character: `\r\n` and `\r`
 * become `\n`, a tab becomes a space, and any other Unicode `Cc` is removed.
 */
export function normaliseControlCharacters(value: string): string {
  return value
    .replace(/\r\n?/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/(?!\n)\p{Cc}/gu, '')
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
    if (seen.has(id))
      throw badUserInput(`${field} ${id} is listed twice`, field)
    seen.add(id)
  }
  return ids
}

/**
 * Client-chosen ids of one call (a create's `id`, a Columns section's
 * `slotIds`, a duplicate's `idMap`): each a UUID, and none used twice
 * within the call, counting `chosen` (ids the same call already chose).
 * `BAD_USER_INPUT` on `field`.
 */
export function assertClientIds(
  ids: string[],
  field: string,
  chosen: string[] = []
): string[] {
  for (const id of ids)
    if (!isUuid(id)) throw badUserInput(`${field} must be a UUID`, field)
  assertUniqueIds([...chosen, ...ids], field)
  return ids
}

/** A create's optional client-chosen `id` through `assertClientIds`; undefined when omitted. */
export function assertClientId(
  id: string | number | null | undefined,
  field = 'id'
): string | undefined {
  if (id == null) return undefined
  return assertClientIds([String(id)], field)[0]
}

/** The client-id rule, as the line each campaign block create's `Errors:` description carries. */
export const CLIENT_ID_ERROR =
  '- BAD_USER_INPUT (field: `id`): not a UUID, or already the id of a block (live or deleted).'

/** The block cap, as the line each campaign block add's `Errors:` description carries. */
export const BLOCK_CAP_ERROR = `- BAD_USER_INPUT (field: \`campaignId\`): the add would take the campaign past ${CAMPAIGN_BLOCKS_MAX} blocks.`

/**
 * Whether `error` is a unique violation (P2002) on `column`: the classic
 * engine names the columns in `meta.target`, a driver adapter in its
 * constraint's `fields` (quoted when mixed case).
 */
export function isUniqueViolation(error: unknown, column: string): boolean {
  if (
    !(error instanceof Prisma.PrismaClientKnownRequestError) ||
    error.code !== 'P2002'
  )
    return false
  const meta = error.meta as
    | {
        target?: unknown
        driverAdapterError?: {
          cause?: { constraint?: { fields?: unknown } }
        }
      }
    | undefined
  const fields = Array.isArray(meta?.target)
    ? meta.target
    : meta?.driverAdapterError?.cause?.constraint?.fields
  return (
    Array.isArray(fields) &&
    fields.some((field) => String(field).replace(/"/g, '') === column)
  )
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
  ...VIEWER_RESERVED_SEGMENTS
])

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
 * strict, then the first free of `base`, `base-2` … `base-50`, then a nanoid
 * suffix.
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

/**
 * Generate a region slug from the name, unique within the campaign and free
 * of the team's live journeys: on a Custom Domain a region slug outranks a
 * journey slug (`assertRegionSlugFreeOfJourneys`), so a journey's slug counts
 * as taken.
 */
export async function generateUniqueRegionSlug(
  campaign: { id: string; teamId: string },
  name: string,
  tx: Prisma.TransactionClient = prisma
): Promise<string> {
  const base = slugBase(name, REGION_RESERVED_SLUGS)
  const regions = await tx.campaignRegion.findMany({
    where: { campaignId: campaign.id, slug: { startsWith: base } },
    select: { slug: true }
  })
  const journeys = await tx.journey.findMany({
    where: {
      teamId: campaign.teamId,
      slug: { startsWith: base },
      deletedAt: null
    },
    select: { slug: true }
  })
  return firstFreeSlug(
    base,
    new Set([...regions, ...journeys].map((c) => c.slug))
  )
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

/**
 * On a Custom Domain a region slug outranks a journey slug with the same
 * spelling, so a region may not take the address of a live journey in the
 * campaign's team: `BAD_USER_INPUT` / `slug`, naming the journey.
 */
export async function assertRegionSlugFreeOfJourneys(
  teamId: string,
  slug: string
): Promise<void> {
  const journey = await prisma.journey.findFirst({
    where: { teamId, slug, deletedAt: null },
    select: { id: true, title: true }
  })
  if (journey != null)
    throw badUserInput(
      `slug "${slug}" is already the address of the journey "${journey.title}" in this team`,
      'slug'
    )
}
