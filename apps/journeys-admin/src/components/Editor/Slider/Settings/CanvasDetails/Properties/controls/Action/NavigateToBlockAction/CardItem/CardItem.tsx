import Box from '@mui/material/Box'
import { ReactElement } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import { CardWrapper } from '@core/journeys/ui/CardWrapper'
import { FramePortal } from '@core/journeys/ui/FramePortal'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { VideoWrapper } from '@core/journeys/ui/VideoWrapper'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'

import { BlockFields_StepBlock as StepBlock } from '../../../../../../../../../../../__generated__/BlockFields'
import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../../../../../../../../__generated__/GetJourney'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../../../../../../__generated__/globalTypes'

interface CardItemProps {
  step: TreeBlock<StepBlock>
  id: string
}

export function CardItem({ step, id }: CardItemProps): ReactElement {
  const { journey } = useJourney()
  const { rtl, locale } = getJourneyRTL(journey)
  const cardBlock = step.children.find(
    (child) => child.__typename === 'CardBlock'
  ) as TreeBlock<CardBlock>

  return (
    <Box
      id={id}
      key={id}
      data-testid={`CardItem-${id}`}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: 95,
        position: 'relative',
        height: 140
      }}
    >
      <Box
        sx={{
          transform: 'scale(0.25)',
          transformOrigin: 'top left'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            display: 'block',
            width: 380,
            height: 560,
            zIndex: 2
          }}
        />
        <FramePortal width={380} height={560} dir={rtl ? 'rtl' : 'ltr'}>
          <ThemeProvider
            themeName={cardBlock?.themeName ?? ThemeName.base}
            themeMode={cardBlock?.themeMode ?? ThemeMode.dark}
            rtl={rtl}
            locale={locale}
          >
            <Box sx={{ p: 4, height: '100%', borderRadius: 4 }}>
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
