import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  CampaignTranslationSet,
  CampaignTranslationSetVariables
} from '../../../__generated__/CampaignTranslationSet'
import { TRANSLATED_VALUE_FIELDS } from '../useCampaignQuery/campaignFields'

/**
 * The set-one translation write (PRD §2): one field of one target in one
 * campaign language, `source: human`; an empty value clears the entry. It
 * returns the field's translations after the write, which the caller writes
 * into the target's `<field>Translations` list in the cache.
 */
export const CAMPAIGN_TRANSLATION_SET = gql`
  ${TRANSLATED_VALUE_FIELDS}
  mutation CampaignTranslationSet($input: CampaignTranslationSetInput!) {
    campaignTranslationSet(input: $input) {
      ...TranslatedValueFields
    }
  }
`

export function useCampaignTranslationSetMutation(
  options?: useMutation.Options<
    CampaignTranslationSet,
    CampaignTranslationSetVariables
  >
): useMutation.ResultTuple<
  CampaignTranslationSet,
  CampaignTranslationSetVariables
> {
  return useMutation<CampaignTranslationSet, CampaignTranslationSetVariables>(
    CAMPAIGN_TRANSLATION_SET,
    options
  )
}
