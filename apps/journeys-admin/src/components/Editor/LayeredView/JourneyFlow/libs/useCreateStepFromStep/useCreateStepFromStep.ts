import { gql, useMutation } from '@apollo/client'
import { v4 as uuidv4 } from 'uuid'

import { TreeBlock } from '@core/journeys/ui/block'
import { BLOCK_FIELDS } from '@core/journeys/ui/block/blockFields'
import { CARD_FIELDS } from '@core/journeys/ui/Card/cardFields'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { STEP_FIELDS } from '@core/journeys/ui/Step/stepFields'

import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../__generated__/BlockFields'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'
import {
  StepBlockCreateFromStep,
  StepBlockCreateFromStepVariables
} from '../../../../../../../__generated__/StepBlockCreateFromStep'
import {
  StepBlockDeleteFromStep,
  StepBlockDeleteFromStepVariables
} from '../../../../../../../__generated__/StepBlockDeleteFromStep'
import {
  StepBlockRestoreFromStep,
  StepBlockRestoreFromStepVariables
} from '../../../../../../../__generated__/StepBlockRestoreFromStep'
import { blockDeleteUpdate } from '../../../../../../libs/blockDeleteUpdate'
import { blockRestoreUpdate } from '../../../../../../libs/useBlockRestoreMutation'
import { stepBlockCreateUpdate } from '../../../../../../libs/useStepAndCardBlockCreateMutation'
import { CreateStepInput } from '../useCreateStep'

export type CreateStepFromStepInput = CreateStepInput & {
  sourceStep: TreeBlock<StepBlock> | null | undefined
}

export const STEP_BLOCK_DELETE_FROM_STEP = gql`
  mutation StepBlockDeleteFromStep(
    $id: ID!
    $journeyId: ID!
    $input: StepBlockUpdateInput!
    $stepBlockUpdateId: ID!
  ) {
    blockDelete(id: $id, journeyId: $journeyId) {
      id
      parentOrder
      ... on StepBlock {
        nextBlockId
      }
    }
    stepBlockUpdate(
      id: $stepBlockUpdateId
      journeyId: $journeyId
      input: $input
    ) {
      id
      nextBlockId
    }
  }
`

export const STEP_BLOCK_RESTORE_FROM_STEP = gql`
  ${BLOCK_FIELDS}
  mutation StepBlockRestoreFromStep(
    $id: ID!
    $journeyId: ID!
    $stepBlockUpdateId: ID!
    $input: StepBlockUpdateInput!
  ) {
    blockRestore(id: $id) {
      id
      ...BlockFields
      ... on StepBlock {
        id
        x
        y
      }
    }
    stepBlockUpdate(
      id: $stepBlockUpdateId
      journeyId: $journeyId
      input: $input
    ) {
      id
      nextBlockId
    }
  }
`

export const STEP_BLOCK_CREATE_FROM_STEP = gql`
  ${STEP_FIELDS}
  ${CARD_FIELDS}
  mutation StepBlockCreateFromStep(
    $stepBlockCreateInput: StepBlockCreateInput!
    $cardBlockCreateInput: CardBlockCreateInput!
    $stepId: ID!
    $journeyId: ID!
    $stepBlockUpdateInput: StepBlockUpdateInput!
  ) {
    stepBlockCreate(input: $stepBlockCreateInput) {
      ...StepFields
      x
      y
    }
    cardBlockCreate(input: $cardBlockCreateInput) {
      ...CardFields
    }
    stepBlockUpdate(
      id: $stepId
      journeyId: $journeyId
      input: $stepBlockUpdateInput
    ) {
      id
      nextBlockId
    }
  }
`

export function useCreateStepFromStep(): (
  input: CreateStepFromStepInput
) => void {
  const { journey } = useJourney()
  const {
    state: { selectedStep },
    dispatch
  } = useEditor()
  const { add } = useCommand()

  const [stepBlockDeleteFromStep] = useMutation<
    StepBlockDeleteFromStep,
    StepBlockDeleteFromStepVariables
  >(STEP_BLOCK_DELETE_FROM_STEP)

  const [stepBlockRestoreFromStep] = useMutation<
    StepBlockRestoreFromStep,
    StepBlockRestoreFromStepVariables
  >(STEP_BLOCK_RESTORE_FROM_STEP)

  const [stepBlockCreateFromStep] = useMutation<
    StepBlockCreateFromStep,
    StepBlockCreateFromStepVariables
  >(STEP_BLOCK_CREATE_FROM_STEP)

  return function createStepFromStep({
    x,
    y,
    sourceStep
  }: CreateStepFromStepInput): void {
    if (journey == null || selectedStep == null || sourceStep == null) return

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
          type: 'SetSelectedStepByIdAction',
          selectedStepId: step.id
        })
        void stepBlockCreateFromStep({
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
            },
            stepId: sourceStep.id,
            journeyId: journey.id,
            stepBlockUpdateInput: {
              nextBlockId: step.id
            }
          },
          optimisticResponse: {
            stepBlockCreate: step,
            cardBlockCreate: card,
            stepBlockUpdate: {
              id: sourceStep.id,
              __typename: 'StepBlock',
              nextBlockId: step.id
            }
          },
          update(cache, { data }) {
            stepBlockCreateUpdate(cache, data, journey?.id)
          }
        })
      },
      undo({ stepBeforeDelete }) {
        dispatch({
          type: 'SetSelectedStepByIdAction',
          selectedStepId: stepBeforeDelete.id
        })
        void stepBlockDeleteFromStep({
          variables: {
            id: step.id,
            journeyId: journey.id,
            stepBlockUpdateId: sourceStep.id,
            input: {
              nextBlockId: sourceStep?.nextBlockId
            }
          },
          optimisticResponse: {
            blockDelete: [step],
            stepBlockUpdate: {
              id: sourceStep.id,
              __typename: 'StepBlock',
              nextBlockId: sourceStep.nextBlockId
            }
          },
          update(cache, { data }) {
            blockDeleteUpdate(step, data?.blockDelete, cache, journey.id)
          }
        })
      },
      redo() {
        dispatch({
          type: 'SetSelectedStepByIdAction',
          selectedStepId: step.id
        })
        void stepBlockRestoreFromStep({
          variables: {
            id: step.id,
            stepBlockUpdateId: sourceStep.id,
            journeyId: journey.id,
            input: {
              nextBlockId: step.id
            }
          },
          optimisticResponse: {
            blockRestore: [step, card],
            stepBlockUpdate: {
              id: sourceStep.id,
              __typename: 'StepBlock',
              nextBlockId: step.id
            }
          },
          update(cache, { data }) {
            blockRestoreUpdate(
              { id: step.id },
              data?.blockRestore,
              cache,
              journey.id
            )
          }
        })
      }
    })
  }
}
