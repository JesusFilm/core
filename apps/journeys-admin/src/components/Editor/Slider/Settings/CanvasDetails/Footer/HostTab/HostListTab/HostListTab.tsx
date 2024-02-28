import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import InformationCircleContainedIcon from '@core/shared/ui/icons/InformationCircleContained'

import { GetAllTeamHosts } from '../../../../../../../../../__generated__/GetAllTeamHosts'
import { HostList } from '../HostList'

interface HostListTabProps {
  openHostList: boolean
  teamHosts?: GetAllTeamHosts
  handleOpenHostInfo: () => void
  handleOpenHostForm: () => void
  handleSelectHost: () => void
}

export function HostListTab({
  openHostList,
  teamHosts,
  handleOpenHostInfo,
  handleOpenHostForm,
  handleSelectHost
}: HostListTabProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <>
      {openHostList && (
        <>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ p: 4, pb: 0 }}
          >
            <Stack direction="row" alignItems="center">
              <Typography variant="subtitle2">{t('Hosts')}</Typography>
              <IconButton data-testid="info" onClick={handleOpenHostInfo}>
                <InformationCircleContainedIcon />
              </IconButton>
            </Stack>
            <Button
              variant="outlined"
              size="small"
              onClick={handleOpenHostForm}
            >
              {t('Create New')}
            </Button>
          </Stack>
          <HostList
            hosts={teamHosts?.hosts ?? []}
            onItemClick={handleSelectHost}
          />
        </>
      )}
    </>
  )
}
