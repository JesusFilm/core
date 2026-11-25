import {
  type TranslatedFieldJson,
  entrySource,
  isTranslated,
  parseTranslations
} from '@core/journeys/ui/Campaign/libs/translatedField'

import { builder } from '../builder'

import { CampaignTextSource, type CampaignTextSourceValue } from './enums'

export { parseTranslations }

export interface TranslatedValueShape {
  languageId: string
  value: string
  source: CampaignTextSourceValue
}

/**
 * The stored shape of every `<field>Translations` JSON column:
 * `{ "<languageId>": { "value": string, "source": "human" | "machine", "uncertain"?: true } }`.
 * `uncertain` is set only on a machine entry the model flagged as a guess;
 * a person's rewrite drops it. The rules over it live in the shared
 * `translatedField` module.
 */
export type TranslationsJson = TranslatedFieldJson

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

/**
 * Turn a `<field>Translations` JSON column into the GraphQL list shape: one
 * item per translated language. An empty or non-string value counts as
 * missing and is left out; a source other than `machine` reads as `human`.
 */
export function toTranslatedValues(json: unknown): TranslatedValueShape[] {
  return Object.entries(parseTranslations(json)).flatMap(
    ([languageId, entry]) =>
      isTranslated(entry)
        ? [{ languageId, value: entry.value, source: entrySource(entry) }]
        : []
  )
}
