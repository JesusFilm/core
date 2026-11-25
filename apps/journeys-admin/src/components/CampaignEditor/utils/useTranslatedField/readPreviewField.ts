import {
  type TranslatedFieldRead,
  isTranslating,
  readTranslatedField
} from '@core/journeys/ui/Campaign/libs/translatedField'

import { CampaignTranslatedValue } from '../../../../libs/useCampaignBlockTextMutation'

export interface PreviewFieldInput {
  /** The default-language column. */
  field: string | null | undefined
  /** The field's `<field>Translations` list. */
  translations: readonly CampaignTranslatedValue[]
  previewLanguageId: string
  defaultLanguageId: string
}

/** A Translated Field in the Preview Language, read through the module's `readTranslatedField`. */
export function readPreviewField({
  field,
  translations,
  previewLanguageId,
  defaultLanguageId
}: PreviewFieldInput): TranslatedFieldRead {
  return readTranslatedField({
    field,
    entry: translations.find(
      (translation) => translation.languageId === previewLanguageId
    ),
    translating: isTranslating(previewLanguageId, defaultLanguageId)
  })
}

/**
 * What a read-only renderer shows for a Translated Field in the Preview
 * Language: its translation, else the default-language text, as the API's
 * `resolveText` answers the public page.
 */
export function previewFieldText(input: PreviewFieldInput): string {
  const { value, fallback } = readPreviewField(input)
  return value !== '' ? value : fallback
}
