import { gql, useMutation } from '@apollo/client'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import AlertCircleIcon from '@core/shared/ui/icons/AlertCircle'

import { DeleteHost } from '../../../../../../../../../__generated__/DeleteHost'
import { UpdateJourneyHost } from '../../../../../../../../../__generated__/UpdateJourneyHost'
import { Drawer } from '../../../../../Drawer'

import { HostAvatarsButton } from './HostAvatarsButton'
import { HostLocationFieldForm } from './HostLocationFieldForm'
import { HostTitleFieldForm } from './HostTitleFieldForm'
import { UPDATE_JOURNEY_HOST } from './HostTitleFieldForm/HostTitleFieldForm'

export const DELETE_HOST = gql`
  mutation DeleteHost($id: ID!, $teamId: ID!) {
    hostDelete(id: $id, teamId: $teamId) {
      id
    }
  }
`

interface HostFormProps {
  onClear: () => void
  open: boolean
  onClose: () => void
}

export function HostForm({
  onClear,
  open,
  onClose
}: HostFormProps): ReactElement {
  const [hostDelete] = useMutation<DeleteHost>(DELETE_HOST)
  const [journeyHostUpdate] =
    useMutation<UpdateJourneyHost>(UPDATE_JOURNEY_HOST)
  const { journey } = useJourney()
  const { t } = useTranslation('apps-journeys-admin')

  const handleClear = async (): Promise<void> => {
    if (journey?.host != null && journey?.team != null) {
      try {
        await hostDelete({
          variables: { id: journey.host.id, teamId: journey.team.id }
        })
      } catch (e) {}
    }

    await journeyHostUpdate({
      variables: { id: journey?.id, input: { hostId: null } }
    })

    onClear()
  }

  return (
    <Drawer
      title={journey?.host != null ? t('Edit Host') : t('Create Host')}
      open={open}
      onClose={onClose}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 4 }}
      >
        {journey?.host != null && (
          <Button variant="outlined" size="small" onClick={handleClear}>
            {t('Clear')}
          </Button>
        )}
      </Stack>
      <Stack gap={6}>
        <HostTitleFieldForm />
        <HostLocationFieldForm />
        <HostAvatarsButton />
      </Stack>
      <Stack direction="row" alignItems="center" gap={3}>
        <AlertCircleIcon />
        <Typography variant="subtitle2">
          {t(
            'Edits: Making changes here will apply to all journeys that share this Host.'
          )}
        </Typography>
      </Stack>
    </Drawer>
  )
}
