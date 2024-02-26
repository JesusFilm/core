import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { FooterLink } from './FooterLink'
import { FooterLinks } from './FooterLinks'
import { FooterLogos } from './FooterLogos'
import { FooterSocials } from './FooterSocials'

export function Footer(): ReactElement {
  const { t } = useTranslation('apps-watch')
  return (
    <>
      <Divider sx={{ height: 2 }} />
      <Container
        component="footer"
        maxWidth="xxl"
        sx={{ backgroundColor: 'background.default', py: 8 }}
        data-testid="Footer"
      >
        {/* desktop view */}
        <Stack spacing={21} sx={{ display: { xs: 'none', sm: 'block' } }}>
          <Stack direction="row" justifyContent="space-between">
            <FooterLinks />
            <Stack width="220px" spacing={2}>
              <FooterLogos />
              <FooterSocials />
            </Stack>
          </Stack>
          <Stack direction="row" spacing={4} justifyContent="space-between">
            <Stack direction="row" spacing={10} justifyContent="space-between">
              <Typography variant="body2">
                {t('Copyright © 1995-{{date}}', {
                  date: new Date().getFullYear()
                })}
              </Typography>
              <Typography variant="body2">
                {t('Jesus Film Project®')}
              </Typography>
              <Typography variant="body2">
                {t('All rights reserved')}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={4} justifyContent="space-between">
              <FooterLink
                url="https://www.jesusfilm.org/terms/"
                label="Terms of use"
                variant="body2"
              />
              <FooterLink
                url="https://www.jesusfilm.org/legal/"
                label="Legal Statement"
                variant="body2"
              />
            </Stack>
          </Stack>
        </Stack>

        {/* mobile view */}
        <Stack sx={{ display: { xs: 'flex', sm: 'none' } }} spacing={8}>
          <Stack alignItems="center">
            <FooterSocials />
          </Stack>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack>
              <Typography variant="body2">
                {t('Copyright © 1995-2023')}
              </Typography>
              <Typography variant="body2">
                {t('Jesus Film Project®')}
              </Typography>
            </Stack>
            <FooterLogos />
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <FooterLink
              url="https://www.jesusfilm.org/legal/"
              label="Legal Statement"
              variant="body2"
            />
            <Typography variant="body2">{t('All rights reserved')}</Typography>
            <FooterLink
              url="https://www.jesusfilm.org/terms/"
              label="Terms of use"
              variant="body2"
            />
          </Stack>
        </Stack>
      </Container>
    </>
  )
}
