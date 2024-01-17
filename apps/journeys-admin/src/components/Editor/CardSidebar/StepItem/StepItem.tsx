import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import {
  ActiveJourneyEditContent,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'

import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../__generated__/BlockFields'
import { ThemeMode, ThemeName } from '../../../../../__generated__/globalTypes'
import { FramePortal } from '../../../FramePortal'
import { CardWrapper } from '../../Canvas/CardWrapper'
import { VideoWrapper } from '../../Canvas/VideoWrapper'
import { CardItem } from '../CardItem'

interface StepItemProps {
  step: TreeBlock<StepBlock>
  index: number
}

export function StepItem({ step, index }: StepItemProps): ReactElement {
  const { journey } = useJourney()
  const {
    dispatch,
    state: { selectedStep, journeyEditContentComponent }
  } = useEditor()
  const { rtl, locale } = getJourneyRTL(journey)
  const cardBlock = step.children.find(
    (child) => child.__typename === 'CardBlock'
  ) as TreeBlock<CardBlock>

  function handleClick(): void {
    dispatch({ type: 'SetSelectedStepAction', step })
  }

  const selected =
    selectedStep?.id === step.id &&
    journeyEditContentComponent === ActiveJourneyEditContent.Canvas
  return (
    <CardItem selected={selected} onClick={handleClick}>
      <Typography>{index + 1}</Typography>
      <Box
        sx={{
          width: 84,
          height: 132,
          backgroundColor: selected ? 'background.paper' : undefined,
          borderRadius: 2,
          transition: (theme) => theme.transitions.create('background-color')
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
              width: 336,
              height: 528,
              zIndex: 2,
              cursor: 'pointer'
            }}
          />
          <FramePortal width={336} height={528} dir={rtl ? 'rtl' : 'ltr'}>
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
    </CardItem>
  )
}
