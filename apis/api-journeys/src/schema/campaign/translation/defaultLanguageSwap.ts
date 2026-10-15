import { GraphQLError } from 'graphql'

import { Prisma } from '@core/prisma/journeys/client'

import { lockCampaign, lockCampaignTextRows } from '../block/service'
import { TranslationsJson } from '../translatedValue'
import { badUserInput } from '../validation'

import {
  CAMPAIGN_BLOCK_TEXT_FIELDS,
  CAMPAIGN_REGION_TEXT_FIELDS,
  CAMPAIGN_STRING_TEXT_FIELDS,
  CAMPAIGN_TITLE_TEXT_FIELDS,
  CampaignTextFieldCaps,
  CampaignTextFieldName,
  translationsColumn
} from './campaignTextField'
import {
  INCLUDE_TRANSLATIONS_CAMPAIGN,
  campaignTranslationRows
} from './campaignTranslations.query'

type SwappedColumns = Record<string, string | TranslationsJson>

function currentTranslations(value: unknown): TranslationsJson {
  return value != null && typeof value === 'object' && !Array.isArray(value)
    ? { ...(value as TranslationsJson) }
    : {}
}

/**
 * One target's columns after the swap, or null when it has nothing to move.
 * Per field the column text becomes `Translations[oldDefault]` as a human
 * entry and `Translations[newDefault].value` becomes the column, its entry
 * dropped. Empty text is not moved: a field with no default text and no entry
 * in the new language stays as it is.
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
    const current = record[field]
    const currentText = typeof current === 'string' ? current : ''
    const translations = currentTranslations(record[column])
    const promoted = translations[newDefaultLanguageId]?.value ?? ''
    if (currentText.trim() === '' && promoted === '') continue

    delete translations[newDefaultLanguageId]
    if (currentText.trim() !== '')
      translations[oldDefaultLanguageId] = {
        value: currentText,
        source: 'human'
      }
    data[field] = promoted
    data[column] = translations
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
 * Promote `newDefaultLanguageId` to the campaign's default inside `tx`. The
 * text rows, then the campaign row (the order block edits take them in), are
 * locked and read again here so the language-membership check,
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
  await lockCampaignTextRows(tx, campaignId)
  await lockCampaign(tx, campaignId)
  const campaign = await tx.campaign.findUniqueOrThrow({
    where: { id: campaignId },
    include: { ...INCLUDE_TRANSLATIONS_CAMPAIGN, blocks: true }
  })
  if (
    !campaign.languages.some(
      (language) => language.languageId === newDefaultLanguageId
    )
  )
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
    throw new GraphQLError(
      `${count} ${count === 1 ? 'text has' : 'texts have'} no translation in the new default language`,
      {
        extensions: { code: 'CONFLICT', field: 'defaultLanguageId', count }
      }
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
