import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import { ReactElement, ReactNode } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'

import { ThemeMode, ThemeName } from '../../../../__generated__/globalTypes'
import { FramePortal } from '../../FramePortal'

interface EmbedJourneyProps {
  slug: 'admin-left' | 'admin-right' | 'admin-center'
  children: ReactNode
}

export function EmbedJourney({
  slug,
  children
}: EmbedJourneyProps): ReactElement {
  function handleClick(): void {
    window.open(`https://your.nextstep.is/${slug}`)
  }

  return (
    <Box
      aria-label={`${slug}-embedded`}
      onClick={handleClick}
      data-testid={`EmbedJourney-${slug}`}
      sx={{ cursor: 'pointer' }}
    >
      <Box
        sx={{
          mx: 'auto',
          height: {
            xs: 8.5,
            md: 6.5
          },
          width: '82.5%',
          backgroundColor: '#AAACBB',
          borderRadius: '16px 16px 0 0',
          opacity: 0.3
        }}
      />
      <Box
        sx={{
          mx: 'auto',
          height: {
            xs: 8.5,
            md: 6.5
          },
          width: '90%',
          backgroundColor: '#AAACBB',
          borderRadius: '16px 16px 0 0',
          opacity: 0.6
        }}
      />
      <Card sx={{ height: { xs: 200, sm: 340, md: 450 } }} variant="outlined">
        <Box
          sx={{
            transform: {
              xs: 'scale(0.35)',
              sm: 'scale(0.5)',
              md: 'scale(0.7)'
            },
            width: {
              xs: '285.7%', // (1 / 0.35) * 100
              sm: '200%', // (1 / 0.5) * 100
              md: '142.8%' // 1 / 0.7) * 100
            },
            height: {
              xs: 522, // (1 / 0.35) * (200 - 8.5 * 2)
              sm: 646, // (1 / 0.5) * (340 - 8.5 * 2)
              md: 624 // (1 / 0.7) * (450 - 6.5 * 2)
            },
            px: 6,
            py: 4,
            transformOrigin: 'top left'
          }}
        >
          <FramePortal height="100%" width="100%">
            <JourneyProvider value={{ variant: 'admin' }}>
              <ThemeProvider
                themeName={ThemeName.base}
                themeMode={ThemeMode.light}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    height: '100%'
                  }}
                >
                  {children}
                </Box>
              </ThemeProvider>
            </JourneyProvider>
          </FramePortal>
        </Box>
      </Card>
    </Box>
  )
}
