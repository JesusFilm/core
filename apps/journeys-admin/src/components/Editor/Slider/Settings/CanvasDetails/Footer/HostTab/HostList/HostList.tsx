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
  handleOpenHostInfo: () => void
  handleOpenHostForm: () => void
  handleSelectHost: () => void
}

export function HostList({
  teamHosts,
  handleOpenHostInfo,
  handleOpenHostForm,
  handleSelectHost
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
        handleSelectHost()
      }
    }
  }

  return (
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ p: 4, pb: 0 }}
      >
        <Stack direction="row" alignItems="center">
          <Typography variant="subtitle2">{t('Hosts')}</Typography>
          <IconButton onClick={handleOpenHostInfo}>
            <InformationCircleContainedIcon />
          </IconButton>
        </Stack>
        <Button variant="outlined" size="small" onClick={handleOpenHostForm}>
          {t('Create New')}
        </Button>
      </Stack>
      <List disablePadding data-testid="HostList">
        {teamHosts?.hosts.map((host) => (
          <HostListItem key={host.id} {...host} onClick={handleClick} />
        ))}
      </List>
    </>
  )
}
