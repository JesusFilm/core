import Box from '@mui/material/Box'
import { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import { FramePortal } from '@core/journeys/ui/FramePortal'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { transformer } from '@core/journeys/ui/transformer'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'

import {
  ThemeMode,
  ThemeName
} from '../../../../../../../../__generated__/globalTypes'

const CARD_WIDTH = 340

export function EmbedCardPreview(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const { rtl } = getJourneyRTL(journey)
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  // Check if blocks are available to render the preview
  const hasBlocks = journey?.blocks != null && journey.blocks.length > 0
  const block = hasBlocks
    ? transformer(journey.blocks as TreeBlock[])?.[0]
    : null
  const hasPrimaryImage = journey?.primaryImageBlock != null

  return (
    <Box
      sx={{
        width: 195,
        position: 'relative',
        height: 294,
        mb: '-24px',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          transform: 'scale(0.5)',
          transformOrigin: smUp ? 'top left' : '22.5% top'
        }}
      >
        <Box
          sx={{
            ml: 7,
            mb: '-3.5px',
            height: 12,
            width: CARD_WIDTH - 55,
            backgroundColor: '#DCDDE5',
            borderRadius: '16px 16px 0 0'
          }}
        />
        <Box
          sx={{
            ml: 3.5,
            mb: '-3.5px',
            height: 12,
            width: CARD_WIDTH - 30,
            backgroundColor: '#AAACBB',
            borderRadius: '16px 16px 0 0'
          }}
        />
        <FramePortal
          width={340}
          height={520}
          dir={rtl ? 'rtl' : 'ltr'}
          sx={{ borderRadius: 5 }}
        >
          <ThemeProvider
            themeName={journey?.themeName ?? ThemeName.base}
            themeMode={journey?.themeMode ?? ThemeMode.light}
          >
            {block != null ? (
              <Box sx={{ height: '100%', borderRadius: 4 }}>
                <BlockRenderer
                  block={block}
                  wrappers={{
                    ImageWrapper: NullWrapper,
                    VideoWrapper: NullWrapper
                  }}
                />
              </Box>
            ) : (
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f5f5f5',
                  padding: 2,
                  textAlign: 'center'
                }}
              >
                {hasPrimaryImage && journey?.primaryImageBlock?.src ? (
                  <Box
                    sx={{
                      width: '100%',
                      height: '200px',
                      position: 'relative',
                      mb: 2
                    }}
                  >
                    <Image
                      src={journey.primaryImageBlock.src}
                      alt={
                        journey.primaryImageBlock.alt ?? t('Journey preview')
                      }
                      layout="fill"
                      objectFit="cover"
                    />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      width: '100%',
                      height: '200px',
                      backgroundColor: '#e0e0e0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2
                    }}
                  >
                    <Typography variant="caption" color="textSecondary">
                      {t('Preview not available')}
                    </Typography>
                  </Box>
                )}
                <Typography variant="h6" component="h1" gutterBottom>
                  {journey?.title || t('Journey Preview')}
                </Typography>
                {journey?.description && (
                  <Typography variant="body2" color="textSecondary">
                    {journey.description}
                  </Typography>
                )}
              </Box>
            )}
          </ThemeProvider>
        </FramePortal>
      </Box>
    </Box>
  )
}

function NullWrapper({ children }): ReactElement {
  return <fieldset disabled>{children}</fieldset>
}
