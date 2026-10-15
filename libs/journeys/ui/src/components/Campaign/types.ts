import type { CampaignPublicBlockFields } from './__generated__/CampaignPublicBlockFields'
import type {
  CampaignPublicFields,
  CampaignPublicFields_regions
} from './__generated__/CampaignPublicFields'

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

/** The Extras: the Typography and Button a section carries above or below its body. */
export const CAMPAIGN_EXTRA_TYPENAMES = [
  'CampaignTypographyBlock',
  'CampaignButtonBlock'
] as const

/**
 * Every typename that never renders through `CampaignSectionBand`: the Extras,
 * the Column slots, the Journey cards, and the Campaign Video, which only
 * ever fills a Media Slot. The one list the section types and checks derive
 * from.
 */
export const CAMPAIGN_NON_SECTION_TYPENAMES = [
  ...CAMPAIGN_EXTRA_TYPENAMES,
  'CampaignColumnBlock',
  'CampaignJourneyBlock',
  'CampaignVideoBlock'
] as const

/** Every typename that renders through `CampaignSectionBand`. */
export type CampaignSectionTypename = Exclude<
  CampaignBlock['__typename'],
  (typeof CAMPAIGN_NON_SECTION_TYPENAMES)[number]
>
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
  return !hasTypename(CAMPAIGN_NON_SECTION_TYPENAMES, block)
}

/** A Typography or Button Extra: the blocks a section places above or below its body. */
export function isExtra<T extends { __typename: string }>(
  block: T
): block is Extract<
  T,
  { __typename: (typeof CAMPAIGN_EXTRA_TYPENAMES)[number] }
> {
  return hasTypename(CAMPAIGN_EXTRA_TYPENAMES, block)
}

export function hasText(value: string | null | undefined): value is string {
  return value != null && value.trim() !== ''
}
