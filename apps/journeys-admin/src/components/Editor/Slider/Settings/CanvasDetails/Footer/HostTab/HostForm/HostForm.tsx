import { ApolloCache, gql, useMutation } from '@apollo/client'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import AlertCircleIcon from '@core/shared/ui/icons/AlertCircle'

import { DeleteHost } from '../../../../../../../../../__generated__/DeleteHost'
import { useUpdateJourneyHostMutation } from '../../../../../../../../libs/useUpdateJourneyHostMutation'

import { HostAvatarsButton } from './HostAvatarsButton'
import { HostLocationFieldForm } from './HostLocationFieldForm'
import { HostTitleFieldForm } from './HostTitleFieldForm'

export const DELETE_HOST = gql`
  mutation DeleteHost($id: ID!, $teamId: ID!) {
    hostDelete(id: $id, teamId: $teamId) {
      id
    }
  }
`

interface HostFormTabProps {
  onClear: () => void
  onBack: () => void
}

export function HostForm({ onClear, onBack }: HostFormTabProps): ReactElement {
  const { journey } = useJourney()
  const { t } = useTranslation('apps-journeys-admin')
  const [hostDelete] = useMutation<DeleteHost>(DELETE_HOST)
  const [journeyHostUpdate] = useUpdateJourneyHostMutation()
  const host = journey?.host

  const handleClear = async (): Promise<void> => {
    if (host != null && journey?.team != null) {
      try {
        await hostDelete({
          variables: { id: host.id, teamId: journey.team.id },
          update(cache: ApolloCache<any>) {
            cache.evict({
              id: cache.identify({ __typename: 'Host', id: host.id })
            })
          }
        })
      } catch (e) {}
    }
    if (journey?.id == null) return
    await journeyHostUpdate({
      variables: { id: journey?.id, input: { hostId: null } }
    })
    onClear()
  }

  return (
    <>
      {journey?.host != null ? (
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ p: 4 }}
        >
          <Button variant="outlined" size="small" onClick={handleClear}>
            {t('Clear')}
          </Button>
        </Stack>
      ) : (
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ p: 4 }}
        >
          <Button variant="outlined" size="small" onClick={onBack}>
            {t('Back')}
          </Button>
        </Stack>
      )}
      <Stack sx={{ p: 4 }} gap={6}>
        <HostTitleFieldForm />
        <HostLocationFieldForm />
        <HostAvatarsButton />
      </Stack>
      <Divider />
      <Stack sx={{ p: 4 }} direction="row" alignItems="center" gap={3}>
        <AlertCircleIcon />
        <Typography variant="subtitle2">
          {t(
            'Edits: Making changes here will apply to all journeys that share this Host.'
          )}
        </Typography>
      </Stack>
      <Divider />
    </>
  )
}
