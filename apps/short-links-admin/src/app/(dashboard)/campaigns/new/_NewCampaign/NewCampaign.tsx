'use client'

import { useMutation } from '@apollo/client/react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

import { graphql } from '@core/shared/gql'

import {
  SHORT_LINK_CAMPAIGN_FIELDS,
  emptyToNull,
  fromDateInputValue
} from '../../../../../libs/shortLink'
import {
  CampaignForm,
  CampaignFormValues,
  EMPTY_CAMPAIGN_FORM_VALUES
} from '../../_CampaignForm'

export const SHORT_LINK_CAMPAIGN_CREATE = graphql(
  `
    mutation ShortLinkCampaignCreate(
      $input: MutationShortLinkCampaignCreateInput!
    ) {
      shortLinkCampaignCreate(input: $input) {
        ...ShortLinkCampaignFields
      }
    }
  `,
  [SHORT_LINK_CAMPAIGN_FIELDS]
)

export function toCampaignInput(values: CampaignFormValues) {
  return {
    name: values.name.trim(),
    description: emptyToNull(values.description),
    startsAt: fromDateInputValue(values.startsAt),
    endsAt: fromDateInputValue(values.endsAt),
    tags: values.tags
  }
}

export function NewCampaign(): ReactElement {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const [errorMessage, setErrorMessage] = useState<string>()
  const [create, { loading }] = useMutation(SHORT_LINK_CAMPAIGN_CREATE)

  async function handleSubmit(values: CampaignFormValues): Promise<void> {
    setErrorMessage(undefined)
    try {
      const { data } = await create({
        variables: { input: toCampaignInput(values) }
      })
      const campaign = data?.shortLinkCampaignCreate
      if (campaign == null) {
        setErrorMessage('No response from the server')
        return
      }
      enqueueSnackbar('Campaign created', { variant: 'success' })
      router.push(`/campaigns/${campaign.id}`)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Could not create the campaign'
      )
    }
  }

  return (
    <Stack spacing={2} sx={{ width: '100%', maxWidth: 900 }}>
      <Typography component="h2" variant="h6">
        New campaign
      </Typography>
      <CampaignForm
        mode="create"
        initialValues={EMPTY_CAMPAIGN_FORM_VALUES}
        submitting={loading}
        errorMessage={errorMessage}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/campaigns')}
      />
    </Stack>
  )
}
