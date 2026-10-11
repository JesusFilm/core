import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../__generated__/GetCampaign'
import { CampaignTextSource } from '../../../__generated__/globalTypes'

/** Every inline-editable default-language text column of a campaign block. */
export type CampaignTextField =
  | 'content'
  | 'label'
  | 'eyebrow'
  | 'title'
  | 'lede'
  | 'intro'

/** PRD §15 text caps, mirrored for the editor's pure pre-validation. */
export const CAMPAIGN_TEXT_CAPS: Record<CampaignTextField, number> = {
  content: 2000,
  label: 60,
  eyebrow: 80,
  title: 150,
  lede: 500,
  intro: 500
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
  CampaignRegionShareBlock: ['title', 'intro']
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

export interface CampaignTranslatedValue {
  __typename: 'TranslatedValue'
  languageId: string
  value: string
  source: CampaignTextSource
}

/** The `<field>Translations` list a block carries beside `field`. */
export function blockTranslations(
  block: CampaignTextBlock,
  field: CampaignTextField
): CampaignTranslatedValue[] {
  const list = (block as unknown as Record<string, unknown>)[
    `${field}Translations`
  ]
  return Array.isArray(list) ? (list as CampaignTranslatedValue[]) : []
}

/** The stored translation of a field in one language, or empty when there is none. */
export function translationValue(
  translations: readonly CampaignTranslatedValue[],
  languageId: string
): string {
  return (
    translations.find((translation) => translation.languageId === languageId)
      ?.value ?? ''
  )
}

/**
 * The translations list after `campaignTranslationSet` writes `value` for
 * `languageId` as a human entry (or clears it when empty): the optimistic
 * shape of the mutation's result.
 */
export function withTranslationValue(
  translations: readonly CampaignTranslatedValue[],
  languageId: string,
  value: string
): CampaignTranslatedValue[] {
  const others = translations.filter(
    (translation) => translation.languageId !== languageId
  )
  if (value === '') return others
  return [
    ...others,
    {
      __typename: 'TranslatedValue',
      languageId,
      value,
      source: CampaignTextSource.human
    }
  ]
}
