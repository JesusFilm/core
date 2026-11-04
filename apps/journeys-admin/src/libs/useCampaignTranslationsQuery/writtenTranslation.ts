import { ApolloCache } from '@apollo/client'

import {
  CampaignTranslations,
  CampaignTranslationsVariables,
  CampaignTranslations_campaignTranslations as TranslationRow,
  CampaignTranslations_campaignTranslations_target as TranslationTarget
} from '../../../__generated__/CampaignTranslations'
import {
  CampaignTextSource,
  CampaignTranslationFilter
} from '../../../__generated__/globalTypes'

import { CAMPAIGN_TRANSLATIONS } from './useCampaignTranslationsQuery'

/** The Translations view's read of one language: every line, filtered on the client. */
export function campaignTranslationsVariables(
  campaignId: string,
  languageId: string
): CampaignTranslationsVariables {
  return { campaignId, languageId, filter: CampaignTranslationFilter.all }
}

/** The id of the one row the target names. */
export function targetId(target: TranslationTarget): string {
  return (
    target.blockId ??
    target.regionId ??
    target.stringId ??
    target.campaignId ??
    ''
  )
}

/** The key of a Translations line: the typename and id its text is stored on, and the field. */
export function translationRowKey(
  typename: string,
  id: string,
  field: string
): string {
  return `${typename}:${id}:${field}`
}

export function rowKey(row: Pick<TranslationRow, 'target' | 'field'>): string {
  return translationRowKey(row.target.typename, targetId(row.target), row.field)
}

interface WrittenTranslation {
  languageId: string
  value: string
  source: CampaignTextSource
}

/**
 * The rows after a write: the written row's value and source follow the
 * field's translations the API returned for `languageId`, missing when the
 * entry was cleared.
 */
export function withWrittenTranslation(
  rows: TranslationRow[],
  writtenKey: string,
  languageId: string,
  translations: WrittenTranslation[]
): TranslationRow[] {
  const entry = translations.find(
    (translation) => translation.languageId === languageId
  )
  return rows.map((row) =>
    rowKey(row) === writtenKey
      ? {
          ...row,
          value: entry?.value ?? null,
          source: entry?.source ?? null,
          needsReview: false
        }
      : row
  )
}

/**
 * Write a translation the API returned into the cached Translations list of
 * its language, when that list is cached, so an open list shows the write
 * without a re-read that could race it.
 */
export function writeCachedTranslation(
  cache: ApolloCache,
  variables: CampaignTranslationsVariables,
  writtenKey: string,
  translations: WrittenTranslation[]
): void {
  cache.updateQuery<CampaignTranslations, CampaignTranslationsVariables>(
    { query: CAMPAIGN_TRANSLATIONS, variables },
    (current) =>
      current == null
        ? undefined
        : {
            ...current,
            campaignTranslations: withWrittenTranslation(
              current.campaignTranslations,
              writtenKey,
              variables.languageId,
              translations
            )
          }
  )
}
