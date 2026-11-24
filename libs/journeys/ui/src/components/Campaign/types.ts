import type { CampaignPublicBlockFields } from './__generated__/CampaignPublicBlockFields'
import type {
  CampaignPublicFields,
  CampaignPublicFields_regions
} from './__generated__/CampaignPublicFields'
import {
  BAND_TYPENAMES,
  type BandTypename,
  EXTRA_TYPENAMES,
  type ExtraTypename,
  PAGE_SECTION_TYPENAMES,
  type PageSectionTypename
} from './libs/campaignBlockGrammar'
import { watchUrl } from './libs/watchUrl'

export type CampaignBlock = CampaignPublicBlockFields
export type CampaignBlockOf<T extends CampaignBlock['__typename']> = Extract<
  CampaignBlock,
  { __typename: T }
>
/**
 * A treed block: children and owned slots are always the full block union, so
 * a node narrowed by typename keeps its children assignable.
 */
export interface CampaignTreeSlots {
  children: CampaignTree[]
  cover: CampaignTree | null
  media: CampaignTree | null
  logo: CampaignTree | null
}
export type CampaignTree<T extends CampaignBlock = CampaignBlock> = T &
  CampaignTreeSlots
export type CampaignTreeOf<T extends CampaignBlock['__typename']> =
  CampaignTree<CampaignBlockOf<T>>

export type CampaignPublic = CampaignPublicFields
export type CampaignRegion = CampaignPublicFields_regions

/** Every typename that renders through `CampaignSectionBand`: the grammar's bands, the page sections and the chrome. */
export type CampaignSectionTypename = BandTypename
export type CampaignSectionBlock = CampaignBlockOf<CampaignSectionTypename>
export type CampaignSectionTree = CampaignTree<CampaignSectionBlock>

function hasTypename(
  typenames: readonly string[],
  block: { __typename: string }
): boolean {
  return typenames.includes(block.__typename)
}

export function isCampaignSection(
  block: CampaignBlock
): block is CampaignSectionBlock {
  return hasTypename(BAND_TYPENAMES, block)
}

/** One of the 11 page sections: a band that is not Campaign Chrome. */
export function isPageSection<T extends { __typename: string }>(
  block: T
): block is Extract<T, { __typename: PageSectionTypename }> {
  return hasTypename(PAGE_SECTION_TYPENAMES, block)
}

/** A Typography or Button Extra: the blocks a section places above or below its body. */
export function isExtra<T extends { __typename: string }>(
  block: T
): block is Extract<T, { __typename: ExtraTypename }> {
  return hasTypename(EXTRA_TYPENAMES, block)
}

export function hasText(value: string | null | undefined): value is string {
  return value != null && value.trim() !== ''
}

/** Whether a section's heading has anything to show: an eyebrow, title or description with text. */
export function hasSectionHeading(section: {
  eyebrow?: string | null
  title?: string | null
  description?: string | null
}): boolean {
  return (
    hasText(section.eyebrow) ||
    hasText(section.title) ||
    hasText(section.description)
  )
}

/** Whether a child is an Extra that renders: a Typography with content or a Button with a label. */
export function hasExtraContent(child: CampaignBlock): boolean {
  if (child.__typename === 'CampaignTypographyBlock')
    return hasText(child.content)
  if (child.__typename === 'CampaignButtonBlock') return hasText(child.label)
  return false
}

/** The Watch page of a Watch video: its variant's slug, else its own; null without either. */
export function watchHref(video: {
  slug: string
  variant?: { slug: string } | null
}): string | null {
  const slug = video.variant?.slug ?? video.slug
  return hasText(slug) ? watchUrl(slug) : null
}
