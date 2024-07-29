import { gql, useMutation } from '@apollo/client'
import { v4 as uuidv4 } from 'uuid'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { CARD_FIELDS } from '@core/journeys/ui/Card/cardFields'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { STEP_FIELDS } from '@core/journeys/ui/Step/stepFields'
import { BLOCK_FIELDS } from '@core/journeys/ui/block/blockFields'
import {
  BlockDeleteWithStepUpdate,
  BlockDeleteWithStepUpdateVariables
} from '../../../../../../../__generated__/BlockDeleteWithStepUpdate'
import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../__generated__/BlockFields'
import {
  BlockRestoreWithStepUpdate,
  BlockRestoreWithStepUpdateVariables
} from '../../../../../../../__generated__/BlockRestoreWithStepUpdate'
import {
  StepAndCardBlockCreateWithStepUpdate,
  StepAndCardBlockCreateWithStepUpdateVariables
} from '../../../../../../../__generated__/StepAndCardBlockCreateWithStepUpdate'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'
import { blockDeleteUpdate } from '../../../../../../libs/blockDeleteUpdate'
import { blockRestoreUpdate } from '../../../../../../libs/useBlockRestoreMutation'
import { stepAndCardBlockCreateCacheUpdate } from '../../../../../../libs/useStepAndCardBlockCreateMutation'
import { SourceBlocksAndCoordinates } from '../../JourneyFlow'

export const BLOCK_DELETE_WITH_STEP_UPDATE = gql`
  mutation BlockDeleteWithStepUpdate($id: ID!, $journeyId: ID!, $input: StepBlockUpdateInput!, $stepBlockUpdateId: ID! ) {
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

export const BLOCK_RESTORE_WITH_STEP_UPDATE = gql`
${BLOCK_FIELDS}
mutation BlockRestoreWithStepUpdate($id: ID!, $journeyId: ID!, $stepBlockUpdateId: ID!, $input: StepBlockUpdateInput!) {
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

export const STEP_AND_CARD_BLOCK_CREATE_WITH_STEP_UPDATE = gql`
  ${STEP_FIELDS}
  ${CARD_FIELDS}
  mutation StepAndCardBlockCreateWithStepUpdate(
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

export function useCreateStep(): (
  sourceStepAndCoordinates: SourceBlocksAndCoordinates
) => Promise<void> {
  const { journey } = useJourney()
  const {
    state: { selectedStep },
    dispatch
  } = useEditor()
  const { add } = useCommand()

  const [blockDeleteWithStepUpdate] = useMutation<
    BlockDeleteWithStepUpdate,
    BlockDeleteWithStepUpdateVariables
  >(BLOCK_DELETE_WITH_STEP_UPDATE)

  const [blockRestoreWithStepUpdate] = useMutation<
    BlockRestoreWithStepUpdate,
    BlockRestoreWithStepUpdateVariables
  >(BLOCK_RESTORE_WITH_STEP_UPDATE)

  const [stepAndCardBlockCreateWithStepUpdate] = useMutation<
    StepAndCardBlockCreateWithStepUpdate,
    StepAndCardBlockCreateWithStepUpdateVariables
  >(STEP_AND_CARD_BLOCK_CREATE_WITH_STEP_UPDATE, {
    update(cache, { data }) {
      stepAndCardBlockCreateCacheUpdate(cache, data, journey?.id)
    }
  })

  return async function createStep({
    x,
    y,
    sourceStep
  }: SourceBlocksAndCoordinates): Promise<void> {
    if (journey == null) return
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
        if (sourceStep != null) {
          void stepAndCardBlockCreateWithStepUpdate({
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
            }
          })
        }
      },
      async undo({ stepBeforeDelete }) {
        if (sourceStep != null && stepBeforeDelete != null) {
          dispatch({
            type: 'SetSelectedStepByIdAction',
            selectedStepId: stepBeforeDelete.id
          })

          void blockDeleteWithStepUpdate({
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
        }
      },
      async redo() {
        if (sourceStep != null) {
          dispatch({
            type: 'SetSelectedStepByIdAction',
            selectedStepId: step.id
          })
          void blockRestoreWithStepUpdate({
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
      }
    })
  }
}
