import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import InformationCircleContainedIcon from '@core/shared/ui/icons/InformationCircleContained'

import { Drawer } from '../../../../../Drawer'
import { HostList } from '../HostList'

interface HostListDrawerProps {
  openSelect: boolean
  teamHosts?: any
  onClose: () => void
  setOpenInfo: () => void
  handleOpenCreateHost: () => void
  handleSelectHost: () => void
}

export function HostListDrawer({
  openSelect,
  teamHosts,
  onClose,
  setOpenInfo,
  handleOpenCreateHost,
  handleSelectHost
}: HostListDrawerProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <>
      <Drawer title={t('Select a Host')} open={openSelect} onClose={onClose}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ p: 4, pb: 0 }}
        >
          <Stack direction="row" alignItems="center">
            <Typography variant="subtitle2">{t('Hosts')}</Typography>
            <IconButton data-testid="info" onClick={setOpenInfo}>
              <InformationCircleContainedIcon />
            </IconButton>
          </Stack>
          <Button
            variant="outlined"
            size="small"
            onClick={handleOpenCreateHost}
          >
            {t('Create New')}
          </Button>
        </Stack>

        <HostList
          hosts={teamHosts?.hosts ?? []}
          onItemClick={handleSelectHost}
        />
      </Drawer>
    </>
  )
}
