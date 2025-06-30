import { v4 as uuidv4 } from 'uuid'

import { useCommand } from '@core/journeys/ui/CommandProvider'
import { ActiveSlide, useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../__generated__/BlockFields'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'
import { useBlockDeleteMutation } from '../../../../../../libs/useBlockDeleteMutation'
import { useBlockRestoreMutation } from '../../../../../../libs/useBlockRestoreMutation'
import { useStepAndCardBlockCreateMutation } from '../../../../../../libs/useStepAndCardBlockCreateMutation'

export interface CreateStepInput {
  x: number
  y: number
}

export function useCreateStep(): (input: CreateStepInput) => void {
  const { journey } = useJourney()
  const {
    state: { selectedStep },
    dispatch
  } = useEditor()
  const { add } = useCommand()
  const [blockDelete] = useBlockDeleteMutation()
  const [blockRestore] = useBlockRestoreMutation()
  const [stepAndCardBlockCreate] = useStepAndCardBlockCreateMutation()

  return function createStep({ x, y }: CreateStepInput): void {
    if (journey == null) return

    const step: StepBlock & { x: number; y: number } = {
      __typename: 'StepBlock',
      locked: false,
      nextBlockId: null,
      parentBlockId: null,
      parentOrder: 0,
      id: uuidv4(),
      x,
      y,
      slug: null
    }
    const card: CardBlock = {
      __typename: 'CardBlock',
      id: uuidv4(),
      parentBlockId: step.id,
      themeMode: ThemeMode.dark,
      themeName: ThemeName.base,
      fullscreen: false,
      backdropBlur: null,
      coverBlockId: null,
      backgroundColor: null,
      parentOrder: 0
    }
    add({
      parameters: {
        execute: {},
        undo: { stepBeforeDelete: selectedStep }
      },
      execute() {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedStepId: step.id,
          activeSlide: ActiveSlide.JourneyFlow
        })
        void stepAndCardBlockCreate({
          variables: {
            stepBlockCreateInput: {
              id: step.id,
              journeyId: journey.id,
              x,
              y
            },
            cardBlockCreateInput: {
              id: card.id,
              journeyId: journey.id,
              parentBlockId: step.id,
              themeMode: ThemeMode.dark,
              themeName: ThemeName.base
            }
          },
          optimisticResponse: {
            stepBlockCreate: step,
            cardBlockCreate: card
          }
        })
      },
      undo({ stepBeforeDelete }) {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedStepId: stepBeforeDelete?.id,
          activeSlide: ActiveSlide.JourneyFlow
        })
        void blockDelete(step, {
          optimisticResponse: {
            blockDelete: [step]
          }
        })
      },
      redo() {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedStepId: step.id,
          activeSlide: ActiveSlide.JourneyFlow
        })
        void blockRestore({
          variables: { id: step.id },
          optimisticResponse: {
            blockRestore: [step, card]
          }
        })
      }
    })
  }
}
