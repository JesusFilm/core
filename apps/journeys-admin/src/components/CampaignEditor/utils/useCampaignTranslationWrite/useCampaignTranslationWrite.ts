import { CampaignTextField } from '../../../../../__generated__/globalTypes'
import {
  CampaignTranslatedValue,
  withTranslationValue
} from '../../../../libs/useCampaignBlockTextMutation'
import { useCampaignTranslationSetMutation } from '../../../../libs/useCampaignTranslationSetMutation'

export interface CampaignTranslationWrite {
  /** The cached row the translation belongs to. */
  row: { __typename: string; id: string }
  target: { blockId: string } | { regionId: string } | { stringId: string }
  field: CampaignTextField
  /** The campaign language being previewed; never the default. */
  languageId: string
  value: string
  /** The row's `<field>Translations` list before the write. */
  translations: readonly CampaignTranslatedValue[]
  /** Apollo link context, e.g. the debounce key of a typed field. */
  context?: Record<string, unknown>
}

/**
 * Write one human translation of a field through `campaignTranslationSet`,
 * shown at once and rolled back if the save fails; the result replaces the
 * row's `<field>Translations` list in the cache.
 */
export function useCampaignTranslationWrite(): (
  write: CampaignTranslationWrite
) => Promise<unknown> {
  const [translationSet] = useCampaignTranslationSetMutation()

  return async function writeTranslation({
    row,
    target,
    field,
    languageId,
    value,
    translations,
    context
  }) {
    return await translationSet({
      variables: { input: { target, field, languageId, value } },
      optimisticResponse: {
        campaignTranslationSet: withTranslationValue(
          translations,
          languageId,
          value
        )
      },
      context,
      update(cache, { data }) {
        if (data == null) return
        cache.modify({
          id: cache.identify(row),
          fields: {
            [`${field}Translations`]: () => data.campaignTranslationSet
          }
        })
      }
    })
  }
}
