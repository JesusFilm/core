import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../__generated__/GetCampaign'

/** Every inline-editable default-language text column of a campaign block. */
export type CampaignTextField =
  | 'content'
  | 'label'
  | 'eyebrow'
  | 'title'
  | 'lede'
  | 'intro'
  | 'richTextContent'

/** PRD §15 text caps, mirrored for the editor's pure pre-validation. */
export const CAMPAIGN_TEXT_CAPS: Record<CampaignTextField, number> = {
  content: 2000,
  label: 60,
  eyebrow: 80,
  title: 150,
  lede: 500,
  intro: 500,
  richTextContent: 5000
}

/**
 * The API input key a text field is written under. Rich text `content` is
 * read as `richTextContent` because the public fragment aliases it away
 * from the Typography block's `content`.
 */
export function campaignTextInputKey(field: CampaignTextField): string {
  return field === 'richTextContent' ? 'content' : field
}

/** The text fields each typename carries, in render order. */
export const CAMPAIGN_TEXT_FIELDS = {
  CampaignTypographyBlock: ['content'],
  CampaignButtonBlock: ['label'],
  CampaignHeroBlock: ['eyebrow', 'title', 'lede'],
  CampaignRegionSwitcherBlock: ['title'],
  CampaignVideoCarouselBlock: ['eyebrow', 'title'],
  CampaignJourneyListBlock: ['eyebrow', 'title', 'lede'],
  CampaignAnalyticsBlock: ['eyebrow', 'title'],
  CampaignRegionHeaderBlock: ['intro'],
  CampaignRegionShareBlock: ['title', 'intro'],
  CampaignRichTextBlock: ['title', 'richTextContent']
} as const satisfies Partial<
  Record<CampaignBlock['__typename'], readonly CampaignTextField[]>
>

export type CampaignTextTypename = keyof typeof CAMPAIGN_TEXT_FIELDS

/** A block with at least one inline-editable text field. */
export type CampaignTextBlock = Extract<
  CampaignBlock,
  { __typename: CampaignTextTypename }
>

export function isCampaignTextBlock(
  block: CampaignBlock
): block is CampaignTextBlock {
  return block.__typename in CAMPAIGN_TEXT_FIELDS
}

/** The field the bar's Edit focuses first: the title where there is one. */
export function primaryTextField(
  typename: CampaignTextTypename
): CampaignTextField {
  const fields: readonly CampaignTextField[] = CAMPAIGN_TEXT_FIELDS[typename]
  return fields.includes('title') ? 'title' : fields[0]
}
