import {
  isCampaignLanguage,
  swapDefaultTexts
} from '@core/journeys/ui/Campaign/libs/translatedField'
import { Prisma } from '@core/prisma/journeys/client'

import { badUserInput, conflict } from '../errors'
import { TranslationsJson } from '../translatedValue'

import { forEachTextTarget } from './forEachTextTarget'
import {
  CampaignTextFieldCaps,
  CampaignTextFieldName,
  translationsColumn
} from './textFields'
import {
  INCLUDE_TRANSLATIONS_CAMPAIGN,
  campaignTranslationRows
} from './translationRows'
import { TRANSLATION_TARGETS, TranslationTargetKind } from './translationTarget'

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

  let campaignColumns: SwappedColumns = {}
  const writes: Array<{
    kind: Exclude<TranslationTargetKind, 'campaign'>
    id: string
    data: SwappedColumns
  }> = []
  forEachTextTarget(campaign, (target) => {
    const data = swapTargetColumns(
      target.record,
      target.fields,
      oldDefaultLanguageId,
      newDefaultLanguageId
    )
    if (data == null) return
    if (target.kind === 'campaign') campaignColumns = data
    else writes.push({ kind: target.kind, id: target.record.id, data })
  })
  for (const { kind, id, data } of writes)
    await TRANSLATION_TARGETS[kind].update(tx, id, data)
  return campaignColumns
}
