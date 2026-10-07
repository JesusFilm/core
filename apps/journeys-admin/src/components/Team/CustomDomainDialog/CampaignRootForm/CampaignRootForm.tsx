import { ApolloCache, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import TextField from '@mui/material/TextField'
import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import { useTeam } from '@core/journeys/ui/TeamProvider'

import {
  CustomDomainCampaignUpdate,
  CustomDomainCampaignUpdateVariables
} from '../../../../../__generated__/CustomDomainCampaignUpdate'
import { GetCampaigns_campaigns as Campaign } from '../../../../../__generated__/GetCampaigns'
import { GetCustomDomains_customDomains as CustomDomain } from '../../../../../__generated__/GetCustomDomains'
import { useCampaignsQuery } from '../../../../libs/useCampaignsQuery'
import { CustomDomainDialogTitle } from '../CustomDomainDialogTitle'

interface CampaignRootFormProps {
  customDomain: CustomDomain
}

export const CUSTOM_DOMAIN_CAMPAIGN_UPDATE = gql`
  mutation CustomDomainCampaignUpdate($id: ID!, $campaignId: ID) {
    customDomainUpdate(id: $id, input: { campaignId: $campaignId }) {
      id
      campaignId
    }
  }
`

/**
 * The Campaign Root select of the team's custom domain. Managers only: the
 * dialog does not render it for members, because `customDomainUpdate` of a
 * Campaign Root is a Manage action. Picking a campaign serves it at the
 * domain root; the clear option puts the domain back to journey behaviour.
 */
export function CampaignRootForm({
  customDomain
}: CampaignRootFormProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { activeTeam } = useTeam()
  const { enqueueSnackbar } = useSnackbar()
  const { data } = useCampaignsQuery(
    activeTeam?.id == null ? undefined : { teamId: activeTeam.id }
  )
  const [customDomainUpdate] = useMutation<
    CustomDomainCampaignUpdate,
    CustomDomainCampaignUpdateVariables
  >(CUSTOM_DOMAIN_CAMPAIGN_UPDATE)

  const campaigns = data?.campaigns ?? []
  const current =
    campaigns.find(({ id }) => id === customDomain.campaignId) ?? null

  // Campaign.customDomains feeds the editor's address hint; drop the cached
  // field of both campaigns the change touches so open editors refetch it.
  function evictCustomDomains(cache: ApolloCache, campaignId: string): void {
    cache.evict({
      id: cache.identify({ __typename: 'Campaign', id: campaignId }),
      fieldName: 'customDomains'
    })
  }

  async function handleChange(campaign: Campaign | null): Promise<void> {
    const previousCampaignId = customDomain.campaignId
    try {
      await customDomainUpdate({
        variables: { id: customDomain.id, campaignId: campaign?.id ?? null },
        update: (cache) => {
          if (previousCampaignId != null)
            evictCustomDomains(cache, previousCampaignId)
          if (campaign != null) evictCustomDomains(cache, campaign.id)
        }
      })
      enqueueSnackbar(
        campaign == null ? t('Campaign root cleared') : t('Campaign root set'),
        { variant: 'success', preventDuplicate: false }
      )
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error
          ? error.message
          : t('Could not save campaign root'),
        { variant: 'error', preventDuplicate: true }
      )
    }
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <CustomDomainDialogTitle title={t('Campaign Root')} />
      <FormControl variant="filled" fullWidth hiddenLabel>
        <Autocomplete
          id="campaignRoot"
          value={current}
          getOptionLabel={(option) => option.title}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          onChange={async (_event, option) => await handleChange(option)}
          options={campaigns}
          clearText={t('Clear campaign root')}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="filled"
              hiddenLabel
              slotProps={{
                ...params.slotProps,
                htmlInput: {
                  ...params.slotProps.htmlInput,
                  'aria-label': t('Campaign Root')
                }
              }}
            />
          )}
          blurOnSelect
        />
        <FormHelperText sx={{ wordBreak: 'break-all' }}>
          {t(
            'The campaign will be available at {{ customDomain }}, with its regions beside your journeys',
            { customDomain: customDomain.name }
          )}
        </FormHelperText>
      </FormControl>
    </Box>
  )
}
