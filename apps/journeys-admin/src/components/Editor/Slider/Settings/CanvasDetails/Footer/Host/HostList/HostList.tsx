import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import InformationCircleContainedIcon from '@core/shared/ui/icons/InformationCircleContained'

import { GetAllTeamHosts } from '../../../../../../../../../__generated__/GetAllTeamHosts'
import { useUpdateJourneyHostMutation } from '../../../../../../../../libs/useUpdateJourneyHostMutation'

import { HostListItem } from './HostListItem'

interface HostListProps {
  teamHosts?: GetAllTeamHosts
  handleSelection: (value: 'selection' | 'info' | 'form') => void
}

export function HostList({
  teamHosts,
  handleSelection
}: HostListProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const { journey } = useJourney()

  const [journeyHostUpdate] = useUpdateJourneyHostMutation()

  const handleClick = async (hostId: string): Promise<void> => {
    if (journey != null) {
      const { data } = await journeyHostUpdate({
        variables: { id: journey?.id, input: { hostId } }
      })
      if (data != null) {
        handleSelection('selection')
      }
    }
  }

  return (
    <Box data-testid="HostList">
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ p: 4, pt: 2 }}
      >
        <Stack direction="row" alignItems="center">
          <Typography variant="subtitle2">{t('Hosts')}</Typography>
          <IconButton onClick={() => handleSelection('info')}>
            <InformationCircleContainedIcon />
          </IconButton>
        </Stack>
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleSelection('form')}
        >
          {t('Create New')}
        </Button>
      </Stack>
      <List disablePadding>
        {teamHosts?.hosts.map((host) => (
          <HostListItem key={host.id} {...host} onClick={handleClick} />
        ))}
      </List>
    </Box>
  )
}
