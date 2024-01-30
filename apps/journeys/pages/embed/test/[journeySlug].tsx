import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'
import { use100vh } from 'react-div-100vh'
import { Trans, useTranslation } from 'react-i18next'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import logo from '../../../public/logo.svg'

export function IFrameTest(): ReactElement {
  const { query } = useRouter()
  const viewportHeight = use100vh()

  const { t } = useTranslation('apps-journeys')

  return (
    <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.light}>
      <Box
        sx={{
          height: viewportHeight ?? '100vh',
          minHeight: '-webkit-fill-available'
        }}
      >
        <Container sx={{ height: '100%' }} maxWidth="sm">
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
            <NextLink
              href={`/${query.journeySlug?.toString() ?? ''}`}
              passHref
              legacyBehavior
            >
              <Button variant="contained" fullWidth>
                {t('Get me out of here!')}
              </Button>
            </NextLink>
            <Box sx={{ flexGrow: 1, width: '100%' }}>
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  overflow: 'hidden'
                }}
              >
                <iframe
                  src={`/embed/${query.journeySlug?.toString() ?? ''}`}
                  style={{ border: 0 }}
                  allow="fullscreen; autoplay"
                  allowFullScreen
                />
              </div>
            </Box>
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  )
}

export default IFrameTest
