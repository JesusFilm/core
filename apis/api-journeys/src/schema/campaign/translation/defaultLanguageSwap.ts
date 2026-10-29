import {
  isCampaignLanguage,
  swapDefaultTexts
} from '@core/journeys/ui/Campaign/libs/translatedField'
import { Prisma } from '@core/prisma/journeys/client'

import { badUserInput, conflict } from '../errors'
import { TranslationsJson } from '../translatedValue'

import {
  CAMPAIGN_BLOCK_TEXT_FIELDS,
  CAMPAIGN_REGION_TEXT_FIELDS,
  CAMPAIGN_STRING_TEXT_FIELDS,
  CAMPAIGN_TITLE_TEXT_FIELDS,
  CampaignTextFieldCaps,
  CampaignTextFieldName,
  translationsColumn
} from './textFields'
import {
  INCLUDE_TRANSLATIONS_CAMPAIGN,
  campaignTranslationRows
} from './translationRows'

type SwappedColumns = Record<string, string | TranslationsJson>

/**
 * One target's columns after the swap, or null when it has nothing to move:
 * each field through `swapDefaultTexts`, the column taking the promoted text
 * and `<field>Translations` the rest.
 */
export function swapTargetColumns(
  record: Record<string, unknown>,
  caps: CampaignTextFieldCaps,
  oldDefaultLanguageId: string,
  newDefaultLanguageId: string
): SwappedColumns | null {
  const data: SwappedColumns = {}
  for (const field of Object.keys(caps) as CampaignTextFieldName[]) {
    const column = translationsColumn(field)
    const swapped = swapDefaultTexts({
      text: record[field],
      json: record[column],
      oldDefaultLanguageId,
      newDefaultLanguageId
    })
    if (swapped == null) continue
    data[field] = swapped.text
    data[column] = swapped.json
  }
  return Object.keys(data).length > 0 ? data : null
}

/** How many texts with default-language text have no entry in `languageId`. */
export function countMissingTranslations(
  campaign: Parameters<typeof campaignTranslationRows>[0],
  languageId: string
): number {
  return campaignTranslationRows(campaign, languageId).filter(
    (row) => row.source == null
  ).length
}

/**
 * Promote `newDefaultLanguageId` to the campaign's default inside `tx`, a
 * Campaign Write that declares the text rows and the campaign row. Everything
 * is read again here under those locks so the language-membership check,
 * the completeness gate and the swap see one consistent snapshot that a
 * concurrent language removal cannot change: a language no longer on the
 * campaign rejects with `BAD_USER_INPUT`, field `defaultLanguageId`; any missing text on a live block rejects with
 * `CONFLICT`, field `defaultLanguageId`, carrying the count, and rolls the
 * transaction back. Soft-deleted blocks are swapped too so a restore finds its
 * text in the right language, but they are not gated: a deleted block with no
 * entry in the new language has its text moved into `Translations[oldDefault]`
 * and its column blanked, so it restores as Missing.
 * Returns the campaign's own swapped columns (`title`, `titleTranslations`);
 * the caller writes them with `defaultLanguageId`.
 */
export async function swapDefaultLanguage(
  tx: Prisma.TransactionClient,
  campaignId: string,
  newDefaultLanguageId: string
): Promise<SwappedColumns> {
  const campaign = await tx.campaign.findUniqueOrThrow({
    where: { id: campaignId },
    include: { ...INCLUDE_TRANSLATIONS_CAMPAIGN, blocks: true }
  })
  if (!isCampaignLanguage(campaign, newDefaultLanguageId))
    throw badUserInput(
      'defaultLanguageId must be one of the campaign languages',
      'defaultLanguageId'
    )
  const oldDefaultLanguageId = campaign.defaultLanguageId
  if (oldDefaultLanguageId === newDefaultLanguageId) return {}
  const liveBlocks = campaign.blocks.filter((block) => block.deletedAt == null)

  const count = countMissingTranslations(
    { ...campaign, blocks: liveBlocks },
    newDefaultLanguageId
  )
  if (count > 0)
    throw conflict(
      `${count} ${count === 1 ? 'text has' : 'texts have'} no translation in the new default language`,
      'defaultLanguageId',
      { count }
    )

  const swap = (
    record: Record<string, unknown>,
    caps: CampaignTextFieldCaps
  ): SwappedColumns | null =>
    swapTargetColumns(record, caps, oldDefaultLanguageId, newDefaultLanguageId)

  for (const block of campaign.blocks) {
    const data = swap(block, CAMPAIGN_BLOCK_TEXT_FIELDS[block.typename] ?? {})
    if (data != null)
      await tx.campaignBlock.update({ where: { id: block.id }, data })
  }
  for (const region of campaign.regions) {
    const data = swap(region, CAMPAIGN_REGION_TEXT_FIELDS)
    if (data != null)
      await tx.campaignRegion.update({ where: { id: region.id }, data })
  }
  for (const string of campaign.strings) {
    const data = swap(string, CAMPAIGN_STRING_TEXT_FIELDS)
    if (data != null)
      await tx.campaignString.update({ where: { id: string.id }, data })
  }
  return swap(campaign, CAMPAIGN_TITLE_TEXT_FIELDS) ?? {}
}
