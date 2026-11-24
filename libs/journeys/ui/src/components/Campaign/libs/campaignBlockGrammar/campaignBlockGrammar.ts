/**
 * The Campaign Block grammar: which typenames are sections, Extras, chrome,
 * slot children or Media Slot owners, which sections a Campaign Page offers,
 * which may sit in a Column Slot, and which Extras a host takes. The one
 * copy the API validators, the editor menus and the renderer read. Pure: it
 * imports no generated types, React or Prisma, so the API can import it.
 */

/** Every value of the `typename` column: one per concrete CampaignBlock type. */
export const CAMPAIGN_TYPENAMES = [
  'CampaignHeroBlock',
  'CampaignRegionSwitcherBlock',
  'CampaignVideoCarouselBlock',
  'CampaignJourneyListBlock',
  'CampaignAnalyticsBlock',
  'CampaignRegionHeaderBlock',
  'CampaignRegionShareBlock',
  'CampaignRichTextBlock',
  'CampaignColumnsBlock',
  'CampaignImageBlock',
  'CampaignFeaturedMediaBlock',
  'CampaignHeaderBlock',
  'CampaignFooterBlock',
  'CampaignTypographyBlock',
  'CampaignButtonBlock',
  'CampaignColumnBlock',
  'CampaignVideoBlock',
  'CampaignJourneyBlock'
] as const
export type CampaignTypename = (typeof CAMPAIGN_TYPENAMES)[number]

/** The two Extra typenames: the Typography and Button a host carries above or below its body. */
export const EXTRA_TYPENAMES = [
  'CampaignTypographyBlock',
  'CampaignButtonBlock'
] as const satisfies readonly CampaignTypename[]
export type ExtraTypename = (typeof EXTRA_TYPENAMES)[number]

/** The header and footer: one of each per Campaign, never deleted, moved or duplicated. */
export const CHROME_TYPENAMES = [
  'CampaignHeaderBlock',
  'CampaignFooterBlock'
] as const satisfies readonly CampaignTypename[]

/** The sections a Campaign Page can hold, in "+Add section" menu order: the seeded seven, Columns, Image and Featured Media. */
export const PAGE_SECTION_TYPENAMES = [
  'CampaignHeroBlock',
  'CampaignRegionSwitcherBlock',
  'CampaignVideoCarouselBlock',
  'CampaignJourneyListBlock',
  'CampaignAnalyticsBlock',
  'CampaignRegionHeaderBlock',
  'CampaignRegionShareBlock',
  'CampaignRichTextBlock',
  'CampaignColumnsBlock',
  'CampaignImageBlock',
  'CampaignFeaturedMediaBlock'
] as const satisfies readonly CampaignTypename[]
export type PageSectionTypename = (typeof PAGE_SECTION_TYPENAMES)[number]

/** Every typename that renders through `CampaignSectionBand` and hosts Extras: the page sections and the chrome. */
export const BAND_TYPENAMES = [
  ...PAGE_SECTION_TYPENAMES,
  ...CHROME_TYPENAMES
] as const
export type BandTypename = (typeof BAND_TYPENAMES)[number]

/** Sections that read the region being rendered: on the Region Page only, never the landing page. */
export const REGION_ONLY_TYPENAMES = [
  'CampaignRegionHeaderBlock',
  'CampaignRegionShareBlock'
] as const satisfies readonly PageSectionTypename[]

/** Column Slots: created with their Columns section and never touched on their own. */
export const SLOT_TYPENAMES = [
  'CampaignColumnBlock'
] as const satisfies readonly CampaignTypename[]

/**
 * The page sections a Column Slot never holds:
 * - Columns: no nesting.
 * - Region Share: the share panel reads a whole page.
 * - Image: its create addresses a page (an Image section) or an owner block
 *   (an owned image), never a slot, so the API keeps it out by the create
 *   input's shape before this list is read.
 */
export const SLOT_DISALLOWED_TYPENAMES = [
  'CampaignColumnsBlock',
  'CampaignRegionShareBlock',
  'CampaignImageBlock'
] as const satisfies readonly PageSectionTypename[]

/** The sections with a Media Slot (`mediaBlockId`). */
export const MEDIA_OWNER_TYPENAMES = [
  'CampaignHeroBlock',
  'CampaignFeaturedMediaBlock'
] as const satisfies readonly PageSectionTypename[]
export type MediaOwnerTypename = (typeof MEDIA_OWNER_TYPENAMES)[number]

/** What a Media Slot holds: a Campaign Video or a Campaign Image. */
export const MEDIA_SLOT_TYPENAMES = [
  'CampaignVideoBlock',
  'CampaignImageBlock'
] as const satisfies readonly CampaignTypename[]

/** A Campaign Page's kind: the Prisma union and the generated `CampaignPageKind` enum's values both fit. */
export type CampaignPageKindValue = 'landing' | 'regionTemplate'

function isOneOf<const T extends string>(
  values: readonly T[],
  value: string
): value is T {
  return (values as readonly string[]).includes(value)
}

/**
 * Whether `childTypename` may be created under a `hostTypename` block (the
 * API rule): any Extra under any band typename, and a `CampaignVideoBlock`
 * only under a Video Carousel, whose items are Campaign Videos and nothing
 * else. Column Slots, Journey cards and owned blocks are not created
 * through this rule.
 */
export function acceptsChild(
  hostTypename: string,
  childTypename: string
): boolean {
  if (!isOneOf(BAND_TYPENAMES, hostTypename)) return false
  if (isOneOf(EXTRA_TYPENAMES, childTypename)) return true
  return (
    childTypename === 'CampaignVideoBlock' &&
    hostTypename === 'CampaignVideoCarouselBlock'
  )
}

/**
 * The Extras the editor offers and the renderer shows on a host: the header
 * shows only its Button Extras (its nav links), though `acceptsChild` takes
 * a header Typography too; every other band typename shows both. A
 * typename that is not a band shows none.
 */
export function shownExtras(hostTypename: string): readonly ExtraTypename[] {
  if (hostTypename === 'CampaignHeaderBlock') return ['CampaignButtonBlock']
  if (!isOneOf(BAND_TYPENAMES, hostTypename)) return []
  return EXTRA_TYPENAMES
}

/** The sections a page of `pageKind` offers, in menu order: region-only sections on the Region Page only. */
export function sectionTypesForPage(
  pageKind: CampaignPageKindValue
): PageSectionTypename[] {
  return PAGE_SECTION_TYPENAMES.filter(
    (typename) =>
      pageKind === 'regionTemplate' || !isOneOf(REGION_ONLY_TYPENAMES, typename)
  )
}

/** The sections a Column Slot on a page of `pageKind` offers, in menu order. */
export function sectionTypesForSlot(
  pageKind: CampaignPageKindValue
): PageSectionTypename[] {
  return sectionTypesForPage(pageKind).filter(
    (typename) => !isOneOf(SLOT_DISALLOWED_TYPENAMES, typename)
  )
}

/** True for a section with a Media Slot: a Hero or a Featured Media section. */
export function isMediaOwner(typename: string): typename is MediaOwnerTypename {
  return isOneOf(MEDIA_OWNER_TYPENAMES, typename)
}
