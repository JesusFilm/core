import { builder } from '../../builder'
import { TEXT_CAPS } from '../validation'

/**
 * Every translatable text column across the campaign types, as one Pothos
 * enum (PRD §2): the single source of truth for `campaignTranslationSet`,
 * the public read's text resolution, the Translations view, the
 * machine-translation sweep and the default-language swap. A field's cap
 * depends on the target that carries it (`title` is 100 on the campaign, 150
 * on a section, 200 on a video or journey card), so the maps below pair each
 * target with its fields and caps.
 */
export const CAMPAIGN_TEXT_FIELD_VALUES = [
  'eyebrow',
  'title',
  'lede',
  'bullets',
  'content',
  'intro',
  'label',
  'alt',
  'description',
  'name',
  'value'
] as const

export type CampaignTextFieldName = (typeof CAMPAIGN_TEXT_FIELD_VALUES)[number]

export type CampaignTextFieldCaps = Partial<
  Record<CampaignTextFieldName, number>
>

export const CampaignTextField = builder.enumType('CampaignTextField', {
  values: CAMPAIGN_TEXT_FIELD_VALUES,
  description:
    'Every translatable text field of a Campaign, its regions, strings and blocks. The target names which fields apply: section text (`eyebrow`, `title`, `lede`, `bullets`, `content`, `intro`), `CampaignTypographyBlock.content`, `CampaignButtonBlock.label`, `CampaignImageBlock.alt`, `CampaignVideoBlock` / `CampaignJourneyBlock` `title` and `description`, `CampaignRegion.name`, `CampaignString.value` and `Campaign.title`.'
})

const SECTION_HEADING: CampaignTextFieldCaps = {
  eyebrow: TEXT_CAPS.eyebrow,
  title: TEXT_CAPS.title
}

/** The translatable columns of every Campaign Block typename, with the cap each takes (PRD §1, §15). */
export const CAMPAIGN_BLOCK_TEXT_FIELDS: Record<string, CampaignTextFieldCaps> =
  {
    CampaignHeroBlock: { ...SECTION_HEADING, lede: TEXT_CAPS.lede },
    CampaignFeaturedMediaBlock: {
      ...SECTION_HEADING,
      lede: TEXT_CAPS.lede,
      bullets: TEXT_CAPS.bullets
    },
    CampaignRichTextBlock: {
      title: TEXT_CAPS.title,
      content: TEXT_CAPS.richTextContent
    },
    CampaignRegionSwitcherBlock: { title: TEXT_CAPS.title },
    CampaignRegionHeaderBlock: { intro: TEXT_CAPS.intro },
    CampaignRegionShareBlock: {
      title: TEXT_CAPS.title,
      intro: TEXT_CAPS.intro
    },
    CampaignJourneyListBlock: { ...SECTION_HEADING, lede: TEXT_CAPS.lede },
    CampaignVideoCarouselBlock: SECTION_HEADING,
    CampaignAnalyticsBlock: SECTION_HEADING,
    CampaignTypographyBlock: { content: TEXT_CAPS.typographyContent },
    CampaignButtonBlock: { label: TEXT_CAPS.buttonLabel },
    CampaignImageBlock: { alt: TEXT_CAPS.imageAlt },
    CampaignVideoBlock: {
      title: TEXT_CAPS.videoTitle,
      description: TEXT_CAPS.videoDescription
    },
    CampaignJourneyBlock: {
      title: TEXT_CAPS.journeyTitle,
      description: TEXT_CAPS.journeyDescription
    }
  }

export const CAMPAIGN_REGION_TEXT_FIELDS: CampaignTextFieldCaps = {
  name: TEXT_CAPS.regionName
}

export const CAMPAIGN_STRING_TEXT_FIELDS: CampaignTextFieldCaps = {
  value: TEXT_CAPS.stringValue
}

export const CAMPAIGN_TITLE_TEXT_FIELDS: CampaignTextFieldCaps = {
  title: TEXT_CAPS.campaignTitle
}

/**
 * Every text column a CampaignBlock row may carry, each paired with its
 * `<field>Translations` sibling: what the public read resolves per block.
 */
/** The text fields a CampaignBlock row can carry (region `name` and string `value` live on other tables). */
export type CampaignBlockTextColumn = Exclude<
  CampaignTextFieldName,
  'name' | 'value'
>

export const CAMPAIGN_BLOCK_TEXT_COLUMNS = Array.from(
  new Set(
    Object.values(CAMPAIGN_BLOCK_TEXT_FIELDS).flatMap(
      (fields) => Object.keys(fields) as CampaignBlockTextColumn[]
    )
  )
).map((field) => [field, translationsColumn(field)] as const)

export function translationsColumn<F extends CampaignTextFieldName>(
  field: F
): `${F}Translations` {
  return `${field}Translations`
}

/** The cap `field` takes on a block of `typename`, or null when the block has no such field. */
export function campaignBlockTextCap(
  typename: string,
  field: CampaignTextFieldName
): number | null {
  return CAMPAIGN_BLOCK_TEXT_FIELDS[typename]?.[field] ?? null
}
