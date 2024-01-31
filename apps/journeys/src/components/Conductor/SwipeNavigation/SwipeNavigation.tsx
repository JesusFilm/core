import { useMutation } from '@apollo/client'
import last from 'lodash/last'
import { ReactElement, useCallback, useEffect } from 'react'
import TagManager from 'react-gtm-module'
import { useTranslation } from 'react-i18next'
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
}

export function SwipeNavigation({
  activeBlock
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
  const enableTouchMoveNext = !activeBlock?.locked ?? false
  const onFirstStep = activeBlock === treeBlocks[0]
  const onLastStep = activeBlock === last(treeBlocks)

  const handleNav = useCallback(
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

        void stepNextEventCreate({
          variables: {
            input: {
              id,
              blockId: activeBlock.id,
              label: stepName,
              value: targetStepName,
              nextStepId: targetBlock?.id
            }
          }
        })

        TagManager.dataLayer({
          dataLayer: {
            event: 'step_next',
            eventId: id,
            blockId: activeBlock.id,
            stepName,
            targetStepId: targetBlock?.id,
            targetStepName
          }
        })
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

        void stepPreviousEventCreate({
          variables: {
            input: {
              id,
              blockId: activeBlock.id,
              label: stepName,
              value: targetStepName,
              previousStepId: targetBlock?.id
            }
          }
        })

        TagManager.dataLayer({
          dataLayer: {
            event: 'step_prev',
            eventId: id,
            blockId: activeBlock.id,
            stepName,
            targetStepId: targetBlock?.id,
            targetStepName
          }
        })
      }

      if (direction === 'next' && !onLastStep && !activeBlock.locked) {
        handleNextNavigationEventCreate()
        nextActiveBlock()
      } else if (direction === 'previous' && !onFirstStep) {
        handlePreviousNavigationEventCreate()
        previousActiveBlock()
      }
    },
    [
      activeBlock,
      nextActiveBlock,
      previousActiveBlock,
      onFirstStep,
      onLastStep,
      variant,
      stepNextEventCreate,
      stepPreviousEventCreate,
      treeBlocks,
      blockHistory,
      t,
      getNextBlock
    ]
  )

  useEffect(() => {
    let touchstartX = 0
    let touchendX = 0
    const swipeSensitivity = 50

    function checkDirection(): void {
      if (touchendX + swipeSensitivity < touchstartX && enableTouchMoveNext)
        handleNav('next')
      if (touchendX - swipeSensitivity > touchstartX) handleNav('previous')
    }

    function touchStart(e): void {
      touchstartX = e.changedTouches[0].screenX
    }

    function touchEnd(e): void {
      touchendX = e.changedTouches[0].screenX
      checkDirection()
    }

    document.addEventListener('touchstart', touchStart)
    document.addEventListener('touchend', touchEnd)

    return () => {
      document.removeEventListener('touchstart', touchStart)
      document.removeEventListener('touchend', touchEnd)
    }
  }, [activeBlock, enableTouchMoveNext, handleNav])

  return <></>
}
