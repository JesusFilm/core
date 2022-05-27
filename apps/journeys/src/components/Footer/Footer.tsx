import { ReactElement } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import MuiLink from '@mui/material/Link'
import { useTranslation } from 'react-i18next'

export function Footer(): ReactElement {
  const { t } = useTranslation('apps-journeys')

  return (
    <Stack direction="row" spacing={3} alignItems="center">
      <Typography
        sx={{
          fontSize: '10px',
          opacity: 0.7,
          '&:hover': {
            opacity: 1
          }
        }}
      >
        {t('NextSteps © {{year}}', { year: new Date().getFullYear() })}
      </Typography>
      <MuiLink
        href="https://www.cru.org/us/en/about/terms-of-use.html"
        variant="caption"
        underline="none"
        target="_blank"
        rel="noopener"
      >
        {t('Terms')}
      </MuiLink>
      <MuiLink
        href="https://www.cru.org/us/en/about/privacy.html"
        variant="caption"
        underline="none"
        target="_blank"
        rel="noopener"
      >
        {t('Privacy')}
      </MuiLink>
    </Stack>
  )
}
