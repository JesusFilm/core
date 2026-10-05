import { CampaignTextSource as PrismaCampaignTextSource } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { CampaignTextSource } from './enums'

export interface TranslatedValueShape {
  languageId: string
  value: string
  source: PrismaCampaignTextSource
}

/**
 * The stored shape of every `<field>Translations` JSON column:
 * `{ "<languageId>": { "value": string, "source": "human" | "machine" } }`.
 */
export type TranslationsJson = Record<
  string,
  { value: string; source: PrismaCampaignTextSource }
>

export const TranslatedValueRef =
  builder.objectRef<TranslatedValueShape>('TranslatedValue')

builder.objectType(TranslatedValueRef, {
  description:
    'One translation of a Translated Field: the value in one campaign language other than the default, and whether a person or the machine wrote it. The default-language value is the field itself.',
  fields: (t) => ({
    languageId: t.exposeID('languageId', {
      nullable: false,
      description: 'api-languages Language id.'
    }),
    value: t.exposeString('value', { nullable: false }),
    source: t.field({
      type: CampaignTextSource,
      nullable: false,
      resolve: (translated) => translated.source
    })
  })
})

/** Turn a `<field>Translations` JSON column into the GraphQL list shape. */
export function toTranslatedValues(json: unknown): TranslatedValueShape[] {
  if (json == null || typeof json !== 'object' || Array.isArray(json)) return []
  return Object.entries(json as TranslationsJson)
    .filter(([, entry]) => entry != null && typeof entry.value === 'string')
    .map(([languageId, entry]) => ({
      languageId,
      value: entry.value,
      source: entry.source === 'machine' ? 'machine' : 'human'
    }))
}
