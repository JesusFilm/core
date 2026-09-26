'use client'

import { useMutation, useQuery } from '@apollo/client/react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

import { graphql } from '@core/shared/gql'

import {
  GET_SHORT_LINK_CAMPAIGN_OPTIONS,
  GET_SHORT_LINK_DOMAINS,
  SHORT_LINK_FIELDS,
  emptyToNull,
  isMutationError,
  parseMutationError
} from '../../../../../libs/shortLink'
import { useShortLinkAccess } from '../../../../../libs/useShortLinkAccess'
import {
  EMPTY_LINK_FORM_VALUES,
  LinkForm,
  LinkFormValues
} from '../../_LinkForm'

export const SHORT_LINK_CREATE = graphql(
  `
    mutation ShortLinkCreate($input: MutationShortLinkCreateInput!) {
      shortLinkCreate(input: $input) {
        __typename
        ... on MutationShortLinkCreateSuccess {
          data {
            ...ShortLinkFields
          }
        }
        ... on ZodError {
          message
          fieldErrors {
            message
            path
          }
        }
        ... on NotUniqueError {
          message
          location {
            path
            value
          }
        }
      }
    }
  `,
  [SHORT_LINK_FIELDS]
)

export function toCreateInput(values: LinkFormValues) {
  return {
    hostname: values.hostname,
    pathname: emptyToNull(values.pathname),
    to: values.to.trim(),
    service: values.service,
    name: emptyToNull(values.name),
    description: emptyToNull(values.description),
    assetClass: values.assetClass,
    status: values.status,
    redirectStatus: values.redirectStatus === '' ? null : values.redirectStatus,
    fallbackTo: emptyToNull(values.fallbackTo),
    placement: values.placement === '' ? null : values.placement,
    language: emptyToNull(values.language),
    tags: values.tags,
    videoId: emptyToNull(values.videoId),
    youtubeVideoId: emptyToNull(values.youtubeVideoId),
    campaignIds: values.campaignIds
  }
}

export function NewLink(): ReactElement {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const { isAdmin } = useShortLinkAccess()
  const [errorMessage, setErrorMessage] = useState<string>()
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>()
  const { data: domainData } = useQuery(GET_SHORT_LINK_DOMAINS)
  const { data: campaignData } = useQuery(GET_SHORT_LINK_CAMPAIGN_OPTIONS)
  const [create, { loading }] = useMutation(SHORT_LINK_CREATE)

  const domains =
    domainData?.shortLinkDomains.edges?.flatMap((edge) =>
      edge?.node != null ? [edge.node] : []
    ) ?? []
  const campaigns =
    campaignData?.shortLinkCampaigns.edges?.flatMap((edge) =>
      edge?.node != null ? [edge.node] : []
    ) ?? []

  async function handleSubmit(values: LinkFormValues): Promise<void> {
    setErrorMessage(undefined)
    setFieldErrors(undefined)
    try {
      const { data } = await create({
        variables: { input: toCreateInput(values) }
      })
      const result = data?.shortLinkCreate
      if (result == null) {
        setErrorMessage('No response from the server')
        return
      }
      if (isMutationError(result)) {
        const parsed = parseMutationError(result)
        setErrorMessage(parsed.message)
        setFieldErrors(parsed.fieldErrors)
        return
      }
      if (result.__typename === 'MutationShortLinkCreateSuccess') {
        enqueueSnackbar('Link created', { variant: 'success' })
        router.push(`/links/${result.data.id}`)
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Could not create the link'
      )
    }
  }

  const initialValues: LinkFormValues = {
    ...EMPTY_LINK_FORM_VALUES,
    hostname: domains[0]?.hostname ?? ''
  }

  return (
    <Stack spacing={2} sx={{ width: '100%', maxWidth: 1100 }}>
      <Typography component="h2" variant="h6">
        New link
      </Typography>
      <LinkForm
        mode="create"
        initialValues={initialValues}
        domains={domains}
        campaigns={campaigns}
        isAdmin={isAdmin}
        submitting={loading}
        errorMessage={errorMessage}
        fieldErrors={fieldErrors}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/links')}
      />
    </Stack>
  )
}
