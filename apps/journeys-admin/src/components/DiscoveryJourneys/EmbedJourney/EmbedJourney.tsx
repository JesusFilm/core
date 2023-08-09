import Box from '@mui/material/Box'
import { ReactElement } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import { StepFooter } from '@core/journeys/ui/StepFooter'
import { transformer } from '@core/journeys/ui/transformer'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'

import { GetDiscoveryJourneys_discoveryJourneys as DiscoveryJourney } from '../../../../__generated__/GetDiscoveryJourneys'
import { ThemeMode, ThemeName } from '../../../../__generated__/globalTypes'
import { FramePortal } from '../../FramePortal'

interface Props {
  slug: 'admin-left' | 'admin-right' | 'admin-center'
  discoveryJourney: DiscoveryJourney
}

export function EmbedJourney({ slug, discoveryJourney }: Props): ReactElement {
  const dimensions = {
    xs: 'calc(210% + 64px)',
    sm: 'calc(166% + 64px)',
    md: 'calc(125% + 64px)'
  }

  const block = transformer(discoveryJourney?.blocks as TreeBlock[])?.[0]

  function handleClick(): void {
    window.open(`https://your.nextstep.is/${slug}`)
  }

  return (
    <Box
      aria-label={`${slug}-embedded`}
      onClick={handleClick}
      sx={{
        transform: {
          xs: 'scale(0.35)',
          sm: 'scale(0.5)',
          md: 'scale(0.7)'
        },
        transformOrigin: 'top left',
        height: dimensions,
        width: dimensions
      }}
    >
      {block != null && (
        <>
          <Box
            sx={{
              mx: 'auto',
              mb: 0,
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
              mb: 0,
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
          <FramePortal height="100%" width="100%">
            <ThemeProvider
              themeName={ThemeName.base}
              themeMode={ThemeMode.light}
            >
              <Box
                sx={{
                  height: '100%',
                  width: '100%',
                  borderRadius: 4,
                  overflow: 'hidden',
                  position: 'relative',
                  cursor: 'pointer'
                }}
              >
                <BlockRenderer block={block} />
                <StepFooter title={discoveryJourney?.seoTitle ?? ''} />
              </Box>
            </ThemeProvider>
          </FramePortal>
        </>
      )}
    </Box>
  )
}
