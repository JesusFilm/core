import Box from '@mui/material/Box'
import { ReactElement } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'

import { CardFields } from '../../../../__generated__/CardFields'
import { ThemeMode, ThemeName } from '../../../../__generated__/globalTypes'
import { StepFields } from '../../../../__generated__/StepFields'
import { CardWrapper } from '../../Editor/Canvas/CardWrapper'
import { VideoWrapper } from '../../Editor/Canvas/VideoWrapper'
import { FramePortal } from '../../FramePortal'

interface CardProps {
  step: TreeBlock<StepFields>
  width: number
  height: number
}

export function Card({ step, width, height }: CardProps): ReactElement {
  const { journey } = useJourney()
  const { rtl, locale } = getJourneyRTL(journey)
  const cardBlock = step.children.find(
    (child) => child.__typename === 'CardBlock'
  ) as TreeBlock<CardFields>

  return (
    <Box
      sx={{
        position: 'relative',
        width,
        height,
        backgroundColor: 'background.default',
        borderRadius: 3
      }}
      data-testid="TemplateCardPreviewItem"
    >
      <Box
        sx={{
          transform: 'scale(0.6)',
          transformOrigin: 'top left'
        }}
      >
        <FramePortal
          sx={{
            width: width * (1 / 0.6),
            height: height * (1 / 0.6)
          }}
          dir={rtl ? 'rtl' : 'ltr'}
        >
          <ThemeProvider
            themeName={cardBlock?.themeName ?? ThemeName.base}
            themeMode={cardBlock?.themeMode ?? ThemeMode.dark}
            rtl={rtl}
            locale={locale}
          >
            <Box
              sx={{
                height: '100%',
                borderRadius: 4
              }}
            >
              <BlockRenderer
                block={step}
                wrappers={{
                  VideoWrapper,
                  CardWrapper
                }}
              />
            </Box>
          </ThemeProvider>
        </FramePortal>
      </Box>
    </Box>
  )
}
