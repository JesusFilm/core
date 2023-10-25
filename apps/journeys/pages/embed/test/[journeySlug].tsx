import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { ReactElement, useEffect } from 'react'
import { use100vh } from 'react-div-100vh'

import { allowedHost } from '@core/journeys/ui/allowedHost'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import logo from '../../../public/logo.svg'

export function IFrameTest(): ReactElement {
  const { query } = useRouter()
  const viewportHeight = use100vh()
  useEffect(() => {
    const makeIframeFullWindow = (event: MessageEvent): void => {
      // Use this page for basic local testing
      // More accurate testing with stage should use embed script on a webpage.
      if (
        allowedHost(new URL(event.origin).host, [
          'localhost:4100',
          'your.nextstep.is',
          'your-stage.nextstep.is'
        ])
      ) {
        const iframe = document.getElementById('jfm-iframe')
        if (iframe != null) {
          if (event.data === true) {
            iframe.style.position = 'fixed'
            iframe.style.zIndex = '999999999999999999999'
          } else {
            iframe.style.position = 'absolute'
            iframe.style.zIndex = 'auto'
          }
        }
      }
    }
    window.addEventListener('message', makeIframeFullWindow)
    return () => {
      window.removeEventListener('message', makeIframeFullWindow)
    }
  }, [])

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
            <Typography>
              This page has been created to test the embed code.{' '}
              <strong>
                If you&apos;ve found this page in error click the button below.
              </strong>
            </Typography>
            <NextLink
              href={`/${query.journeySlug?.toString() ?? ''}`}
              passHref
              legacyBehavior
            >
              <Button variant="contained" fullWidth>
                Get me out of here!
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
                  id="jfm-iframe"
                  src={`/embed/${query.journeySlug?.toString() ?? ''}`}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none'
                  }}
                  allow="fullscreen"
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
