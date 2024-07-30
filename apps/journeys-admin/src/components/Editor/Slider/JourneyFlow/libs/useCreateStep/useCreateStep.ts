import { gql, useMutation } from '@apollo/client'
import { v4 as uuidv4 } from 'uuid'

import { CARD_FIELDS } from '@core/journeys/ui/Card/cardFields'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { STEP_FIELDS } from '@core/journeys/ui/Step/stepFields'
import { BLOCK_FIELDS } from '@core/journeys/ui/block/blockFields'

import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../__generated__/BlockFields'
import {
  StepBlockCreate,
  StepBlockCreateVariables
} from '../../../../../../../__generated__/StepBlockCreate'
import {
  StepBlockDelete,
  StepBlockDeleteVariables
} from '../../../../../../../__generated__/StepBlockDelete'
import {
  StepBlockRestore,
  StepBlockRestoreVariables
} from '../../../../../../../__generated__/StepBlockRestore'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'
import { blockDeleteUpdate } from '../../../../../../libs/blockDeleteUpdate'
import { blockRestoreUpdate } from '../../../../../../libs/useBlockRestoreMutation'
import { stepBlockCreateUpdate } from '../../../../../../libs/useStepAndCardBlockCreateMutation'
import { SourceBlocksAndCoordinates } from '../../JourneyFlow'

type CreateStepInput = SourceBlocksAndCoordinates

export const STEP_BLOCK_DELETE = gql`
  mutation StepBlockDelete($id: ID!, $journeyId: ID!, $input: StepBlockUpdateInput!, $stepBlockUpdateId: ID! ) {
    blockDelete(id: $id, journeyId: $journeyId) {
      id
      parentOrder
      ... on StepBlock {
        nextBlockId
      }
    }
    stepBlockUpdate(id: $stepBlockUpdateId, journeyId: $journeyId, input: $input) {
      id
      nextBlockId
    }
  }
`

export const STEP_BLOCK_RESTORE = gql`
${BLOCK_FIELDS}
mutation StepBlockRestore($id: ID!, $journeyId: ID!, $stepBlockUpdateId: ID!, $input: StepBlockUpdateInput!) {
  blockRestore(id: $id) {
    id
    ...BlockFields
    ... on StepBlock {
      id
      x
      y
    }
  }
  stepBlockUpdate(id: $stepBlockUpdateId, journeyId: $journeyId, input: $input) {
      id
      nextBlockId
    }
}`

export const STEP_BLOCK_CREATE = gql`
  ${STEP_FIELDS}
  ${CARD_FIELDS}
  mutation StepBlockCreate(
    $stepBlockCreateInput: StepBlockCreateInput!
    $cardBlockCreateInput: CardBlockCreateInput!
    $stepId: ID!,
    $journeyId: ID!,
    $stepBlockUpdateInput: StepBlockUpdateInput!
  ) {
    stepBlockCreate(input: $stepBlockCreateInput) {
      ...StepFields
      x
      y
    }
    cardBlockCreate(input: $cardBlockCreateInput) {
      ...CardFields
    },
    stepBlockUpdate(id: $stepId, journeyId: $journeyId, input: $stepBlockUpdateInput) {
      id
      nextBlockId
    }
  }
`

export function useCreateStep(): (input: CreateStepInput) => Promise<void> {
  const { journey } = useJourney()
  const {
    state: { selectedStep },
    dispatch
  } = useEditor()
  const { add } = useCommand()

  const [stepBlockDelete] = useMutation<
    StepBlockDelete,
    StepBlockDeleteVariables
  >(STEP_BLOCK_DELETE)

  const [stepBlockRestore] = useMutation<
    StepBlockRestore,
    StepBlockRestoreVariables
  >(STEP_BLOCK_RESTORE)

  const [stepBlockCreate] = useMutation<
    StepBlockCreate,
    StepBlockCreateVariables
  >(STEP_BLOCK_CREATE)

  return async function createStep({
    x,
    y,
    sourceStep
  }: CreateStepInput): Promise<void> {
    if (journey == null || selectedStep == null || sourceStep == null) return
    const step: StepBlock & { x: number; y: number } = {
      __typename: 'StepBlock',
      locked: false,
      nextBlockId: null,
      parentBlockId: null,
      parentOrder: 0,
      id: uuidv4(),
      x,
      y
    }
    const card: CardBlock = {
      __typename: 'CardBlock',
      id: uuidv4(),
      parentBlockId: step.id,
      themeMode: ThemeMode.dark,
      themeName: ThemeName.base,
      fullscreen: false,
      coverBlockId: null,
      backgroundColor: null,
      parentOrder: 0
    }

    await add({
      parameters: {
        execute: {},
        undo: { stepBeforeDelete: selectedStep }
      },
      async execute() {
        dispatch({
          type: 'SetSelectedStepByIdAction',
          selectedStepId: step.id
        })

        void stepBlockCreate({
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
      async undo({ stepBeforeDelete }) {
        dispatch({
          type: 'SetSelectedStepByIdAction',
          selectedStepId: stepBeforeDelete.id
        })

        void stepBlockDelete({
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
      async redo() {
        dispatch({
          type: 'SetSelectedStepByIdAction',
          selectedStepId: step.id
        })
        void stepBlockRestore({
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
