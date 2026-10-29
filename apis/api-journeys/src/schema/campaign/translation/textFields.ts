import {
  TRANSLATED_FIELDS,
  TRANSLATED_FIELD_NAMES,
  type TranslatedFieldCaps,
  type TranslatedFieldName
} from '@core/journeys/ui/Campaign/libs/translatedField'

/**
 * Every translatable text column across the campaign types (GLOSSARY.md:
 * Translated Field), the values of the `CampaignTextField` enum. The field
 * declaration of every target, with its caps, lives in the shared
 * `translatedField` module (`TRANSLATED_FIELDS`) so the editor reads the same
 * one; these names re-export it for this API's importers.
 */
export const CAMPAIGN_TEXT_FIELD_VALUES = TRANSLATED_FIELD_NAMES

export type CampaignTextFieldName = TranslatedFieldName

export type CampaignTextFieldCaps = TranslatedFieldCaps

/** The translatable columns of every Campaign Block typename, with the cap each takes. */
export const CAMPAIGN_BLOCK_TEXT_FIELDS: Record<string, CampaignTextFieldCaps> =
  TRANSLATED_FIELDS.block

export const CAMPAIGN_REGION_TEXT_FIELDS: CampaignTextFieldCaps =
  TRANSLATED_FIELDS.region

export const CAMPAIGN_STRING_TEXT_FIELDS: CampaignTextFieldCaps =
  TRANSLATED_FIELDS.string

export const CAMPAIGN_TITLE_TEXT_FIELDS: CampaignTextFieldCaps =
  TRANSLATED_FIELDS.campaign

/** The text fields a CampaignBlock row can carry (region `name` and string `value` live on other tables). */
export type CampaignBlockTextColumn = Exclude<
  CampaignTextFieldName,
  'name' | 'value'
>

/**
 * Every text column a CampaignBlock row may carry, each paired with its
 * `<field>Translations` sibling.
 */
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
