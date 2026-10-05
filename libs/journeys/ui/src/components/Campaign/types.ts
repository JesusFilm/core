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

/**
 * Every typename that renders through `CampaignSectionBand`: not the Extras,
 * and not the Campaign Video, which only ever fills a Media Slot.
 */
export type CampaignSectionTypename = Exclude<
  CampaignBlock['__typename'],
  'CampaignTypographyBlock' | 'CampaignButtonBlock' | 'CampaignVideoBlock'
>
export type CampaignSectionBlock = CampaignBlockOf<CampaignSectionTypename>
export type CampaignSectionTree = CampaignTree<CampaignSectionBlock>

export function isCampaignSection(
  block: CampaignBlock
): block is CampaignSectionBlock {
  return (
    block.__typename !== 'CampaignTypographyBlock' &&
    block.__typename !== 'CampaignButtonBlock' &&
    block.__typename !== 'CampaignVideoBlock'
  )
}

export function hasText(value: string | null | undefined): value is string {
  return value != null && value.trim() !== ''
}
