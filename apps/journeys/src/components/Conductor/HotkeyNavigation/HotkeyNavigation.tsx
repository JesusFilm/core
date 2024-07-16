import { useMutation } from '@apollo/client'
import {
  STEP_NEXT_EVENT_CREATE,
  STEP_PREVIOUS_EVENT_CREATE
} from '@core/journeys/ui/Card/Card'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { TreeBlock, useBlocks } from '@core/journeys/ui/block'
import {
  JourneyPlausibleEvents,
  keyify
} from '@core/journeys/ui/plausibleHelpers'
import { useTranslation } from 'next-i18next'
import { usePlausible } from 'next-plausible'
import { ReactElement, useCallback } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { v4 as uuidv4 } from 'uuid'

import { getStepHeading } from '@core/journeys/ui/getStepHeading'

import TagManager from 'react-gtm-module'
import { StepFields } from '../../../../__generated__/StepFields'
import {
  StepNextEventCreate,
  StepNextEventCreateVariables
} from '../../../../__generated__/StepNextEventCreate'
import {
  StepPreviousEventCreate,
  StepPreviousEventCreateVariables
} from '../../../../__generated__/StepPreviousEventCreate'
import {
  StepNextEventCreateInput,
  StepPreviousEventCreateInput
} from '../../../../__generated__/globalTypes'

interface HotkeyNavigationProps {
  activeBlock: TreeBlock<StepFields>
  rtl: boolean
}

export function HotkeyNavigation({
  activeBlock,
  rtl
}: HotkeyNavigationProps): ReactElement {
  const [stepNextEventCreate] = useMutation<
    StepNextEventCreate,
    StepNextEventCreateVariables
  >(STEP_NEXT_EVENT_CREATE)
  const [stepPreviousEventCreate] = useMutation<
    StepPreviousEventCreate,
    StepPreviousEventCreateVariables
  >(STEP_PREVIOUS_EVENT_CREATE)
  const plausible = usePlausible<JourneyPlausibleEvents>()
  const { variant, journey } = useJourney()
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
      // journeys/src/components/Conductor/HotkeyNavigation/HotkeyNavigation.tsx
      function handleNextNavigationEventCreate(): void {
        const id = uuidv4()
        const stepName = getStepHeading(
          activeBlock.id,
          activeBlock.children,
          treeBlocks,
          t
        )
        const targetBlock = getNextBlock({ id: undefined, activeBlock })

        if (targetBlock == null) return

        const targetStepName = getStepHeading(
          targetBlock.id,
          targetBlock.children,
          treeBlocks,
          t
        )

        const input: StepNextEventCreateInput = {
          id,
          blockId: activeBlock.id,
          label: stepName,
          value: targetStepName,
          nextStepId: targetBlock.id
        }
        void stepNextEventCreate({
          variables: {
            input
          }
        })

        if (journey != null)
          plausible('navigateNextStep', {
            props: {
              ...input,
              key: keyify({
                stepId: input.blockId,
                event: 'navigateNextStep',
                blockId: input.blockId,
                target: input.nextStepId
              }),
              simpleKey: keyify({
                stepId: input.blockId,
                event: 'navigateNextStep',
                blockId: input.blockId
              })
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
        if (targetBlock == null) return
        const targetStepName = getStepHeading(
          targetBlock.id,
          targetBlock.children,
          treeBlocks,
          t
        )
        const input: StepPreviousEventCreateInput = {
          id,
          blockId: activeBlock.id,
          label: stepName,
          value: targetStepName,
          previousStepId: targetBlock?.id
        }
        void stepPreviousEventCreate({
          variables: {
            input
          }
        })
        if (journey != null)
          plausible('navigatePreviousStep', {
            props: {
              ...input,
              key: keyify({
                stepId: input.blockId,
                event: 'navigatePreviousStep',
                blockId: input.blockId,
                target: input.previousStepId
              }),
              simpleKey: keyify({
                stepId: input.blockId,
                event: 'navigatePreviousStep',
                blockId: input.blockId
              })
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
      getNextBlock,
      plausible,
      journey
    ]
  )

  if (rtl) {
    useHotkeys('left', () => handleNavigation('next'), { preventDefault: true })
    useHotkeys('right', () => handleNavigation('previous'), {
      preventDefault: true
    })
  } else {
    useHotkeys('left', () => handleNavigation('previous'), {
      preventDefault: true
    })
    useHotkeys('right', () => handleNavigation('next'), {
      preventDefault: true
    })
  }

  return <></>
}
