'use client'

import { useMutation } from '@apollo/client/react'
import { useRouter } from 'next/navigation'
import { ReactElement, useState } from 'react'

import { graphql } from '@core/shared/gql'

import {
  SHORT_LINK_CAMPAIGN_FIELDS,
  emptyToNull,
  fromDateInputValue
} from '../../../../../libs/shortLink'
import { notify } from '../../../../../libs/toast'
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
      notify('Campaign created', 'success')
      router.push(`/campaigns/${campaign.id}`)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Could not create the campaign'
      )
    }
  }

  return (
    <div className="flex w-full max-w-3xl flex-col gap-4">
      <h2 className="text-lg font-semibold">New campaign</h2>
      <CampaignForm
        mode="create"
        initialValues={EMPTY_CAMPAIGN_FORM_VALUES}
        submitting={loading}
        errorMessage={errorMessage}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/campaigns')}
      />
    </div>
  )
}
