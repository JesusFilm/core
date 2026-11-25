import {
  type TranslatedFieldCaps,
  translatedFieldsOf
} from '@core/journeys/ui/Campaign/libs/translatedField'

/** The rows of a Campaign that carry Translated Fields, as any read of it includes them. */
export interface TextTargetCampaign {
  id: string
  blocks: ReadonlyArray<{ id: string; typename: string }>
  regions: ReadonlyArray<{ id: string }>
  strings: ReadonlyArray<{ id: string }>
}

/** One row a Translated Field lives on: its kind, the row as read, and its translatable fields with their caps. */
export type TextTarget<C extends TextTargetCampaign> =
  | { kind: 'campaign'; record: C; fields: TranslatedFieldCaps }
  | {
      kind: 'string'
      record: C['strings'][number]
      fields: TranslatedFieldCaps
    }
  | { kind: 'block'; record: C['blocks'][number]; fields: TranslatedFieldCaps }
  | {
      kind: 'region'
      record: C['regions'][number]
      fields: TranslatedFieldCaps
    }

/**
 * Visit every text target of a Campaign: the Campaign itself (its title),
 * each Campaign String, each block and each region, in the order the
 * Campaign lists them, each with the fields its field declaration
 * (`TRANSLATED_FIELDS`) gives it. A block whose typename carries no text is
 * visited with no fields. The one place a read of a Campaign turns its rows
 * into text targets; `TRANSLATION_TARGETS` stays the write side.
 */
export function forEachTextTarget<C extends TextTargetCampaign>(
  campaign: C,
  visit: (target: TextTarget<C>) => void
): void {
  visit({
    kind: 'campaign',
    record: campaign,
    fields: translatedFieldsOf({ kind: 'campaign' })
  })
  for (const string of campaign.strings)
    visit({
      kind: 'string',
      record: string,
      fields: translatedFieldsOf({ kind: 'string' })
    })
  for (const block of campaign.blocks)
    visit({
      kind: 'block',
      record: block,
      fields: translatedFieldsOf({ kind: 'block', typename: block.typename })
    })
  for (const region of campaign.regions)
    visit({
      kind: 'region',
      record: region,
      fields: translatedFieldsOf({ kind: 'region' })
    })
}
