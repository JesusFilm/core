import { ReactElement } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import MuiLink from '@mui/material/Link'
import { useTranslation } from 'react-i18next'

export function Footer(): ReactElement {
  const { t } = useTranslation('apps-journeys')
  const year = new Date().getFullYear()

  return (
    <Stack direction="row" spacing={3}>
      <Typography variant="caption">{t(`NextSteps © ${year}`)}</Typography>
      <MuiLink
        href="https://www.cru.org/us/en/about/terms-of-use.html"
        variant="caption"
        underline="none"
        target="_blank"
        rel="noopener"
        sx={{
          '&:hover': {
            color: (theme) => theme.palette.error.main
          }
        }}
      >
        {t('Terms')}
      </MuiLink>
      <MuiLink
        href="https://www.cru.org/us/en/about/privacy.html"
        variant="caption"
        underline="none"
        target="_blank"
        rel="noopener"
        sx={{
          '&:hover': {
            color: (theme) => theme.palette.error.main
          }
        }}
      >
        {t('Privacy')}
      </MuiLink>
    </Stack>
  )
}
