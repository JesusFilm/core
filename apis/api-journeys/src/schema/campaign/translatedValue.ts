import { builder } from '../builder'

import { CampaignTextSource, type CampaignTextSourceValue } from './enums'

export interface TranslatedValueShape {
  languageId: string
  value: string
  source: CampaignTextSourceValue
}

/**
 * The stored shape of every `<field>Translations` JSON column:
 * `{ "<languageId>": { "value": string, "source": "human" | "machine", "uncertain"?: true } }`.
 * `uncertain` is set only on a machine entry the model flagged as a guess;
 * a person's rewrite drops it.
 */
export type TranslationsJson = Record<
  string,
  { value: string; source: CampaignTextSourceValue; uncertain?: boolean }
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

/**
 * Read a `<field>Translations` JSON column as a fresh object the caller may
 * change. Anything but a JSON object (null, an array, a string, a number)
 * reads as no translations; entries are returned as stored, so each reader
 * still checks the entry it uses.
 */
export function parseTranslations(json: unknown): TranslationsJson {
  if (json == null || typeof json !== 'object' || Array.isArray(json)) return {}
  return { ...(json as TranslationsJson) }
}

/** Turn a `<field>Translations` JSON column into the GraphQL list shape. */
export function toTranslatedValues(json: unknown): TranslatedValueShape[] {
  return Object.entries(parseTranslations(json))
    .filter(([, entry]) => entry != null && typeof entry.value === 'string')
    .map(([languageId, entry]) => ({
      languageId,
      value: entry.value,
      source: entry.source === 'machine' ? 'machine' : 'human'
    }))
}
