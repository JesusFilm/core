import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import { ReactElement, ReactNode } from 'react'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'

import { ThemeMode, ThemeName } from '../../../../__generated__/globalTypes'

interface EmbedJourneyProps {
  slug: 'admin-left' | 'admin-right' | 'admin-center'
  children: ReactNode
  sx?: SxProps
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
          height: 16,
          marginBottom: { xs: '-7.5px', md: '-9.5px' },
          width: '80%',
          backgroundColor: '#DADBDF',
          borderRadius: '16px 16px 0 0'
        }}
      />
      <Box
        sx={{
          mx: 'auto',
          height: 16,
          marginBottom: { xs: '-7.5px', md: '-9.5px' },
          width: '90%',
          backgroundColor: '#C6C7D0',
          borderRadius: '16px 16px 0 0'
        }}
      />
      <Card
        sx={{
          height: { xs: 200, sm: 340, md: 450 },
          borderRadius: 4
        }}
        variant="outlined"
      >
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
          <ThemeProvider
            themeName={ThemeName.base}
            themeMode={ThemeMode.light}
            nested
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
        </Box>
      </Card>
    </Box>
  )
}
