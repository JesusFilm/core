import { useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import { useTranslation } from 'next-i18next'
import { ReactElement, ReactNode, useCallback } from 'react'
import TagManager from 'react-gtm-module'
import { SwipeEventData, useSwipeable } from 'react-swipeable'
import { v4 as uuidv4 } from 'uuid'

import { TreeBlock, useBlocks } from '@core/journeys/ui/block'
import {
  STEP_NEXT_EVENT_CREATE,
  STEP_PREVIOUS_EVENT_CREATE
} from '@core/journeys/ui/Card/Card'
import { getStepHeading } from '@core/journeys/ui/getStepHeading'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { StepFields } from '../../../../__generated__/StepFields'
import { StepNextEventCreate } from '../../../../__generated__/StepNextEventCreate'
import { StepPreviousEventCreate } from '../../../../__generated__/StepPreviousEventCreate'

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
  const [stepNextEventCreate] = useMutation<StepNextEventCreate>(
    STEP_NEXT_EVENT_CREATE
  )
  const [stepPreviousEventCreate] = useMutation<StepPreviousEventCreate>(
    STEP_PREVIOUS_EVENT_CREATE
  )
  const { variant } = useJourney()
  const {
    getNextBlock,
    treeBlocks,
    blockHistory,
    nextActiveBlock,
    previousActiveBlock
  } = useBlocks()
  const { t } = useTranslation('apps-journeys')

  const handleNavigation = useCallback(
    (direction: 'next' | 'previous'): void => {
      if (variant === 'admin') return

      // should always be called with nextActiveBlock()
      // should match with other handleNextNavigationEventCreate functions
      // places used:
      // libs/journeys/ui/src/components/Card/Card.tsx
      // journeys/src/components/Conductor/NavigationButton/NavigationButton.tsx
      // journeys/src/components/Conductor/SwipeNavigation/SwipeNavigation.tsx
      function handleNextNavigationEventCreate(): void {
        const id = uuidv4()
        const stepName = getStepHeading(
          activeBlock.id,
          activeBlock.children,
          treeBlocks,
          t
        )
        const targetBlock = getNextBlock({ id: undefined, activeBlock })
        const targetStepName =
          targetBlock != null &&
          getStepHeading(targetBlock.id, targetBlock.children, treeBlocks, t)

        if (targetBlock != null) {
          void stepNextEventCreate({
            variables: {
              input: {
                id,
                blockId: activeBlock.id,
                label: stepName,
                value: targetStepName,
                nextStepId: targetBlock.id
              }
            }
          })

          TagManager.dataLayer({
            dataLayer: {
              event: 'step_next',
              eventId: id,
              blockId: activeBlock.id,
              stepName,
              targetStepId: targetBlock.id,
              targetStepName
            }
          })
        }
      }
      // should always be called with previousActiveBlock()
      // should match with other handlePreviousNavigationEventCreate functions
      // places used:
      // libs/journeys/ui/src/components/Card/Card.tsx
      // journeys/src/components/Conductor/NavigationButton/NavigationButton.tsx
      // journeys/src/components/Conductor/SwipeNavigation/SwipeNavigation.tsx
      function handlePreviousNavigationEventCreate(): void {
        const id = uuidv4()
        const stepName = getStepHeading(
          activeBlock.id,
          activeBlock.children,
          treeBlocks,
          t
        )
        const targetBlock = blockHistory[
          blockHistory.length - 2
        ] as TreeBlock<StepFields>
        const targetStepName =
          targetBlock != null &&
          getStepHeading(targetBlock.id, targetBlock.children, treeBlocks, t)

        if (targetBlock != null) {
          void stepPreviousEventCreate({
            variables: {
              input: {
                id,
                blockId: activeBlock.id,
                label: stepName,
                value: targetStepName,
                previousStepId: targetBlock.id
              }
            }
          })

          TagManager.dataLayer({
            dataLayer: {
              event: 'step_prev',
              eventId: id,
              blockId: activeBlock.id,
              stepName,
              targetStepId: targetBlock.id,
              targetStepName
            }
          })
        }
      }

      if (
        direction === 'next' &&
        activeBlock?.nextBlockId != null &&
        !activeBlock.locked
      ) {
        handleNextNavigationEventCreate()
        nextActiveBlock()
      } else if (direction === 'previous' && blockHistory.length > 1) {
        handlePreviousNavigationEventCreate()
        previousActiveBlock()
      }
    },
    [
      activeBlock,
      nextActiveBlock,
      previousActiveBlock,
      variant,
      stepNextEventCreate,
      stepPreviousEventCreate,
      treeBlocks,
      blockHistory,
      t,
      getNextBlock
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
