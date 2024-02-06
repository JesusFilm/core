import { gql, useMutation } from '@apollo/client'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import AlertCircleIcon from '@core/shared/ui/icons/AlertCircle'

import { DeleteHost } from '../../../../../../../../../__generated__/DeleteHost'
import { UpdateJourneyHost } from '../../../../../../../../../__generated__/UpdateJourneyHost'
import { SidePanel } from '../../../../../../../PageWrapper/SidePanel'
import { SidePanelContainer } from '../../../../../../../PageWrapper/SidePanelContainer'

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
  onClose: () => void
}

export function HostForm({ onClear, onClose }: HostFormProps): ReactElement {
  const [hostDelete] = useMutation<DeleteHost>(DELETE_HOST)
  const [journeyHostUpdate] =
    useMutation<UpdateJourneyHost>(UPDATE_JOURNEY_HOST)
  const { journey } = useJourney()
  const [host, setHost] = useState(journey?.host ?? undefined)
  const { t } = useTranslation('apps-journeys-admin')

  useEffect(() => {
    setHost(journey?.host ?? undefined)
  }, [journey])

  const handleClear = async (): Promise<void> => {
    if (host != null && journey?.team != null) {
      try {
        await hostDelete({
          variables: { id: host.id, teamId: journey.team.id }
        })
      } catch (e) {}
    }

    await journeyHostUpdate({
      variables: { id: journey?.id, input: { hostId: null } }
    })

    onClear()
  }

  return (
    <SidePanel
      title={t('Hosted By')}
      withAdminDrawer
      selectHostPanel
      onClose={host == null ? onClose : undefined}
    >
      <SidePanelContainer>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 4 }}
        >
          <Typography variant="subtitle2">
            {host != null ? t('Edit Author') : t('Create Author')}
          </Typography>
          {host != null && (
            <Button variant="outlined" size="small" onClick={handleClear}>
              {t('Clear')}
            </Button>
          )}
        </Stack>
        <Stack gap={6}>
          <HostTitleFieldForm empty={host == null} />
          <HostLocationFieldForm disabled={host == null} empty={host == null} />
          <HostAvatarsButton disabled={host == null} />
        </Stack>
      </SidePanelContainer>
      <SidePanelContainer>
        <Stack direction="row" alignItems="center" gap={3}>
          <AlertCircleIcon />
          <Typography variant="subtitle2">
            {t(
              'Edits: Making changes here will apply to all journeys that share this Host.'
            )}
          </Typography>
        </Stack>
      </SidePanelContainer>
    </SidePanel>
  )
}
