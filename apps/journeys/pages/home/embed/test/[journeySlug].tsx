import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { Trans, useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import logo from '../../../../public/logo.svg'

export function IFrameTest(): ReactElement {
  const { query } = useRouter()

  const { t } = useTranslation('apps-journeys')

  return (
    <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.light}>
      <Container maxWidth="sm">
        <Stack spacing={5} alignItems="center" sx={{ height: '100%', pt: 5 }}>
          <Image
            src={logo}
            alt="Next Steps"
            height={68}
            width={152}
            style={{
              maxWidth: '100%',
              height: 'auto',
              alignSelf: 'center'
            }}
          />
          <Trans t={t}>
            <Typography>
              This page has been created to test the embed code.
              <strong>
                If youve found this page in error click the button below.
              </strong>
            </Typography>
          </Trans>
          <Button
            LinkComponent={NextLink}
            href={`/${query.journeySlug?.toString() ?? ''}`}
            variant="contained"
            fullWidth
          >
            {t('Get me out of here!')}
          </Button>
          <iframe
            src={`/embed/${query.journeySlug?.toString() ?? ''}`}
            style={{ border: 0, width: 360, height: 640 }}
            allow="fullscreen; autoplay"
            allowFullScreen
          />
        </Stack>
      </Container>
    </ThemeProvider>
  )
}

export default IFrameTest
