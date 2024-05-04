import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import UserProfileCircleIcon from '@core/shared/ui/icons/UserProfileCircle'

interface HostInfoTabProps {
  handleSelection: (value: 'list') => void
}

export function HostInfo({ handleSelection }: HostInfoTabProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <Stack sx={{ p: 4 }} data-testid="HostInfo">
      <Button
        variant="outlined"
        size="small"
        onClick={() => handleSelection('list')}
        sx={{
          mb: 4,
          width: 'fit-content',
          maxWidth: '100%',
          overflow: 'hidden'
        }}
      >
        {t('Back')}
      </Button>
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
  )
}
