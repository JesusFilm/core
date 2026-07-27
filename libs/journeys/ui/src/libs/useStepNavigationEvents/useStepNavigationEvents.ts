import { useMutation } from '@apollo/client'
import { sendGTMEvent } from '@next/third-parties/google'
import { TOptions } from 'i18next'
import { usePlausible } from 'next-plausible'
import { useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'

import {
  StepNextEventCreateInput,
  StepPreviousEventCreateInput
} from '../../../__generated__/globalTypes'
import {
  StepNextEventCreate,
  StepNextEventCreateVariables
} from '../../components/Card/__generated__/StepNextEventCreate'
import {
  StepPreviousEventCreate,
  StepPreviousEventCreateVariables
} from '../../components/Card/__generated__/StepPreviousEventCreate'
import {
  STEP_NEXT_EVENT_CREATE,
  STEP_PREVIOUS_EVENT_CREATE
} from '../../components/Card/Card'
import { StepFields } from '../../components/Step/__generated__/StepFields'
import { TreeBlock, getStepHeading, useBlocks } from '../block'
import { useJourney } from '../JourneyProvider'
import {
  JourneyPlausibleEvents,
  keyify,
  templateKeyify
} from '../plausibleHelpers'

interface UseStepNavigationEventsOptions {
  /**
   * Translator used for step-heading fallback labels ("Untitled",
   * "Step {{number}}"). Passed in rather than resolved here so the emitted
   * event labels use the calling surface's i18n namespace.
   */
  t: (str: string, options?: TOptions) => string
}

interface UseStepNavigationEventsResult {
  /** Report a forward step navigation. Call alongside `nextActiveBlock()`. */
  handleNextNavigationEventCreate: (activeBlock: TreeBlock<StepFields>) => void
  /**
   * Report a backward step navigation. Call alongside
   * `previousActiveBlock()`.
   */
  handlePreviousNavigationEventCreate: (
    activeBlock: TreeBlock<StepFields>
  ) => void
}

/**
 * Creates the step-navigation analytics reporters (StepNextEvent /
 * StepPreviousEvent mutations + Plausible + GTM) shared by every viewer
 * surface that advances or rewinds a step (navigation buttons, swipe,
 * hotkeys).
 */
export function useStepNavigationEvents({
  t
}: UseStepNavigationEventsOptions): UseStepNavigationEventsResult {
  const [stepNextEventCreate] = useMutation<
    StepNextEventCreate,
    StepNextEventCreateVariables
  >(STEP_NEXT_EVENT_CREATE)
  const [stepPreviousEventCreate] = useMutation<
    StepPreviousEventCreate,
    StepPreviousEventCreateVariables
  >(STEP_PREVIOUS_EVENT_CREATE)
  const plausible = usePlausible<JourneyPlausibleEvents>()
  const { journey } = useJourney()
  const { getNextBlock, treeBlocks, blockHistory } = useBlocks()

  const handleNextNavigationEventCreate = useCallback(
    (activeBlock: TreeBlock<StepFields>): void => {
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
          u: `${window.location.origin}/${journey.id}/${input.blockId}`,
          props: {
            ...input,
            key: keyify({
              stepId: input.blockId,
              event: 'navigateNextStep',
              blockId: input.blockId,
              target: input.nextStepId,
              journeyId: journey?.id
            }),
            simpleKey: keyify({
              stepId: input.blockId,
              event: 'navigateNextStep',
              blockId: input.blockId,
              journeyId: journey?.id
            }),
            templateKey: templateKeyify({
              event: 'navigateNextStep',
              journeyId: journey?.id
            })
          }
        })
      sendGTMEvent({
        event: 'step_next',
        eventId: id,
        blockId: activeBlock.id,
        stepName,
        targetStepId: targetBlock.id,
        targetStepName
      })
    },
    [getNextBlock, journey, plausible, stepNextEventCreate, t, treeBlocks]
  )

  const handlePreviousNavigationEventCreate = useCallback(
    (activeBlock: TreeBlock<StepFields>): void => {
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
        previousStepId: targetBlock.id
      }
      void stepPreviousEventCreate({
        variables: {
          input
        }
      })
      if (journey != null)
        plausible('navigatePreviousStep', {
          u: `${window.location.origin}/${journey.id}/${input.blockId}`,
          props: {
            ...input,
            key: keyify({
              stepId: input.blockId,
              event: 'navigatePreviousStep',
              blockId: input.blockId,
              target: input.previousStepId,
              journeyId: journey?.id
            }),
            simpleKey: keyify({
              stepId: input.blockId,
              event: 'navigatePreviousStep',
              blockId: input.blockId,
              journeyId: journey?.id
            }),
            templateKey: templateKeyify({
              event: 'navigatePreviousStep',
              journeyId: journey?.id
            })
          }
        })
      sendGTMEvent({
        event: 'step_prev',
        eventId: id,
        blockId: activeBlock.id,
        stepName,
        targetStepId: targetBlock.id,
        targetStepName
      })
    },
    [blockHistory, journey, plausible, stepPreviousEventCreate, t, treeBlocks]
  )

  return {
    handleNextNavigationEventCreate,
    handlePreviousNavigationEventCreate
  }
}
