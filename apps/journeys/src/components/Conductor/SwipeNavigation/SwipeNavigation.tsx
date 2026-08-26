import Box from '@mui/material/Box'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, ReactNode, useCallback } from 'react'
import { SwipeEventData, useSwipeable } from 'react-swipeable'

import { TreeBlock, useBlocks } from '@core/journeys/ui/block'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useStepNavigationEvents } from '@core/journeys/ui/useStepNavigationEvents'

import { StepFields } from '../../../../__generated__/StepFields'

interface SwipeNavigationProps {
  activeBlock: TreeBlock<StepFields>
  rtl: boolean
  children: ReactNode
}

export function SwipeNavigation({
  activeBlock,
  rtl,
  children
}: SwipeNavigationProps): ReactElement {
  const { renderMode } = useJourney()
  const { blockHistory, nextActiveBlock, previousActiveBlock } = useBlocks()
  const { t } = useTranslation('apps-journeys')
  const {
    handleNextNavigationEventCreate,
    handlePreviousNavigationEventCreate
  } = useStepNavigationEvents({ t })

  const handleNavigation = useCallback(
    (direction: 'next' | 'previous'): void => {
      if (renderMode === 'admin') return

      if (
        direction === 'next' &&
        activeBlock?.nextBlockId != null &&
        !activeBlock.locked
      ) {
        handleNextNavigationEventCreate(activeBlock)
        nextActiveBlock()
      } else if (direction === 'previous' && blockHistory.length > 1) {
        handlePreviousNavigationEventCreate(activeBlock)
        previousActiveBlock()
      }
    },
    [
      activeBlock,
      nextActiveBlock,
      previousActiveBlock,
      renderMode,
      blockHistory,
      handleNextNavigationEventCreate,
      handlePreviousNavigationEventCreate
    ]
  )

  function isSliderElement(eventData: SwipeEventData): boolean {
    const element = eventData.event.target as HTMLElement

    if (element.classList.contains('MuiSlider-root')) return true
    if (element.classList.contains('MuiSlider-rail')) return true
    if (element.classList.contains('MuiSlider-track')) return true
    if (element.classList.contains('MuiSlider-thumb')) return true

    return false
  }

  const swipeHandlers = useSwipeable({
    onSwipedLeft: (eventData) => {
      if (isSliderElement(eventData)) return
      if (rtl) {
        handleNavigation('previous')
      } else {
        handleNavigation('next')
      }
    },
    onSwipedRight: (eventData) => {
      if (isSliderElement(eventData)) return
      if (rtl) {
        handleNavigation('next')
      } else {
        handleNavigation('previous')
      }
    },
    preventScrollOnSwipe: true
  })

  return (
    <Box
      sx={{
        height: 'inherit',
        maxHeight: 'inherit',
        overflow: 'hidden',
        position: 'relative'
      }}
      {...swipeHandlers}
    >
      {children}
    </Box>
  )
}
