import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import UserProfileCircleIcon from '@core/shared/ui/icons/UserProfileCircle'

interface HostInfoDrawerProps {
  openHostInfo: boolean
  onClose: () => void
}

export function HostInfoDrawer({
  openHostInfo,
  onClose
}: HostInfoDrawerProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <>
      {openHostInfo && (
        <>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ p: 4, pb: 0 }}
          >
            <Button variant="outlined" size="small" onClick={onClose}>
              {t('Back')}
            </Button>
          </Stack>
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
        </>
      )}
    </>
  )
}
