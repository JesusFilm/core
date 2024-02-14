import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import UserProfileCircleIcon from '@core/shared/ui/icons/UserProfileCircle'

import { Drawer } from '../../../../../Drawer'

interface HostInfoDrawerProps {
  openInfo: boolean
  onClose: () => void
}

export function HostInfoDrawer({
  openInfo,
  onClose
}: HostInfoDrawerProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <Drawer title={t('Information')} open={openInfo} onClose={onClose}>
      <Stack sx={{ p: 4 }}>
        <Stack direction="row" alignItems="center" gap={3} sx={{ mb: 4 }}>
          <UserProfileCircleIcon />
          <Typography variant="subtitle2">
            {t('Why does your journey need a host?')}
          </Typography>
        </Stack>
        <Typography gutterBottom color="secondary.light">
          {t(
            'A great way to add personality to your content is to include both male and female journey creators. Diverse creators, especially with a local feel, are more likely to engage users in conversation.'
          )}
        </Typography>
        <Typography color="secondary.light">
          {t(
            'In countries with security concerns, it is advisable to create fake personas for your own safety.'
          )}
        </Typography>
      </Stack>
    </Drawer>
  )
}
