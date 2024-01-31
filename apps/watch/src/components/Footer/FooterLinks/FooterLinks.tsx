import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { FooterLink } from '../FooterLink'

export function FooterLinks(): ReactElement {
  const { t } = useTranslation('apps-watch')
  return (
    <Stack direction="row" width="100%" spacing={20} data-testid="FooterLinks">
      <Stack direction="column" spacing={4}>
        <Typography
          variant="h6"
          component="h2"
          sx={{ textTransform: 'uppercase' }}
        >
          {t('About')}
        </Typography>
        <FooterLink
          label="About Jesus Film Project"
          url="https://www.jesusfilm.org/about/"
        />
        <FooterLink label="Contact" url="https://www.jesusfilm.org/contact/" />
        <FooterLink
          label="Ways to Give"
          url="https://www.jesusfilm.org/give/"
        />
      </Stack>
      <Stack direction="column" spacing={3}>
        <Typography
          variant="h6"
          component="h2"
          sx={{ textTransform: 'uppercase' }}
        >
          {t('Section')}
        </Typography>
        <FooterLink label="Watch" url="https://www.jesusfilm.org/watch/" />
        <FooterLink
          label="Strategies and Tools"
          url="https://www.jesusfilm.org/partners/resources/"
        />
        <FooterLink label="Blog" url="https://www.jesusfilm.org/blog/" />
        <FooterLink
          label="How to Help"
          url="https://www.jesusfilm.org/partners/"
        />
      </Stack>
      <Stack direction="column" spacing={3}>
        <Typography
          variant="h6"
          component="h2"
          sx={{ textTransform: 'uppercase' }}
        >
          {t('Apps')}
        </Typography>
        <FooterLink
          label="Android"
          url="https://play.google.com/store/apps/details?id=com.jesusfilmmedia.android.jesusfilm"
          target="_blank"
        />
        <FooterLink
          label="iPhone"
          url="https://apps.apple.com/us/app/jesus-film-media/id550525738"
          target="_blank"
        />
      </Stack>
    </Stack>
  )
}
