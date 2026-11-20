import { gql } from '@apollo/client'
import { useMutation, useQuery } from '@apollo/client/react'
import Button from '@mui/material/Button'
import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import {
  GetJourneyPublishPermission,
  GetJourneyPublishPermissionVariables
} from '../../../../../__generated__/GetJourneyPublishPermission'
import {
  PublishDraftJourney,
  PublishDraftJourneyVariables
} from '../../../../../__generated__/PublishDraftJourney'

export const GET_JOURNEY_PUBLISH_PERMISSION = gql`
  query GetJourneyPublishPermission($id: ID!) {
    journeyPublishPermission(id: $id)
  }
`
export const PUBLISH_DRAFT_JOURNEY = gql`
  mutation PublishDraftJourney($id: ID!) {
    journeyPublish(id: $id) {
      id
      status
      publishedAt
    }
  }
`

export function PublishButton(): ReactElement | null {
  const { journey } = useJourney()
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const eligible = journey?.status === 'draft' && journey.template !== true
  const { data } = useQuery<
    GetJourneyPublishPermission,
    GetJourneyPublishPermissionVariables
  >(GET_JOURNEY_PUBLISH_PERMISSION, {
    variables: { id: journey?.id ?? '' },
    skip: !eligible,
    fetchPolicy: 'no-cache'
  })
  const [publish, { loading }] = useMutation<
    PublishDraftJourney,
    PublishDraftJourneyVariables
  >(PUBLISH_DRAFT_JOURNEY)
  if (!eligible || data?.journeyPublishPermission !== true || !journey)
    return null
  const handlePublish = async (): Promise<void> => {
    try {
      const result = await publish({ variables: { id: journey.id } })
      if (result.data?.journeyPublish == null)
        throw new Error('Publish refused')
      enqueueSnackbar(t('Journey published'), { variant: 'success' })
    } catch {
      enqueueSnackbar(
        t('Unable to publish. Check your current access and try again.'),
        { variant: 'error' }
      )
    }
  }
  return (
    <Button
      variant="contained"
      loading={loading}
      onClick={() => {
        void handlePublish()
      }}
    >
      {t('Publish')}
    </Button>
  )
}
