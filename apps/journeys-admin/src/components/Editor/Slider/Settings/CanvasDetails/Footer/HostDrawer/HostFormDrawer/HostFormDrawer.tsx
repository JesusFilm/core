import { gql } from '@apollo/client'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import AlertCircleIcon from '@core/shared/ui/icons/AlertCircle'

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

interface HostFormDrawerProps {
  onClear: () => void
  open: boolean
  back: () => void
}

export function HostFormDrawer({
  onClear,
  open,
  back
}: HostFormDrawerProps): ReactElement {
  const { journey } = useJourney()
  const { t } = useTranslation('apps-journeys-admin')

  const handleClear = async (): Promise<void> => {
    onClear()
  }

  return (
    <>
      {open && (
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
              <Button variant="outlined" size="small" onClick={back}>
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
      )}
    </>
  )
}
