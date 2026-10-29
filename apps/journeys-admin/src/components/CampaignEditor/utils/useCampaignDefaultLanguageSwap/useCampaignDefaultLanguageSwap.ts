import { useApolloClient } from '@apollo/client/react'
import { useCallback } from 'react'

import { GET_CAMPAIGN } from '../../../../libs/useCampaignQuery'
import { useCampaignUpdateMutation } from '../../../../libs/useCampaignUpdateMutation'

/**
 * The one default-language swap, for the dialog's Change button and for the
 * translation run that ends in one. `swap` asks the API to make the language
 * the default, waits for the campaign to be read again with every text moved,
 * and drops the cached Translations rows. It shows no UI: a refusal rejects
 * with the Apollo error unchanged (see {@link missingCountOf}).
 */
export function useCampaignDefaultLanguageSwap(): (
  campaignId: string,
  languageId: string
) => Promise<void> {
  const client = useApolloClient()
  const [campaignUpdate] = useCampaignUpdateMutation()

  return useCallback(
    async (campaignId: string, languageId: string): Promise<void> => {
      await campaignUpdate({
        variables: { id: campaignId, input: { defaultLanguageId: languageId } },
        refetchQueries: [
          { query: GET_CAMPAIGN, variables: { id: campaignId } }
        ],
        awaitRefetchQueries: true
      })
      client.cache.evict({
        id: 'ROOT_QUERY',
        fieldName: 'campaignTranslations'
      })
      client.cache.gc()
    },
    [campaignUpdate, client]
  )
}
