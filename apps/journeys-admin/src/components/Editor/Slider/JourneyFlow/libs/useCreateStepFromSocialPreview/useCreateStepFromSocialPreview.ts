import { gql, useMutation } from '@apollo/client'
import cloneDeep from 'lodash/cloneDeep'
import { v4 as uuidv4 } from 'uuid'

import { CARD_FIELDS } from '@core/journeys/ui/Card/cardFields'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { ActiveSlide, useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { STEP_FIELDS } from '@core/journeys/ui/Step/stepFields'
import { BLOCK_FIELDS } from '@core/journeys/ui/block/blockFields'
import {
  BlockDeleteWithBlockOrderUpdate,
  BlockDeleteWithBlockOrderUpdateVariables
} from '../../../../../../../__generated__/BlockDeleteWithBlockOrderUpdate'
import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../__generated__/BlockFields'
import {
  BlockRestoreWithBlockOrderUpdate,
  BlockRestoreWithBlockOrderUpdateVariables
} from '../../../../../../../__generated__/BlockRestoreWithBlockOrderUpdate'
import {
  StepAndCardBlockCreateWithBlockOrderUpdate,
  StepAndCardBlockCreateWithBlockOrderUpdateVariables
} from '../../../../../../../__generated__/StepAndCardBlockCreateWithBlockOrderUpdate'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'
import { blockDeleteUpdate } from '../../../../../../libs/blockDeleteUpdate'
import { useBlockDeleteMutation } from '../../../../../../libs/useBlockDeleteMutation'
import { blockRestoreUpdate } from '../../../../../../libs/useBlockRestoreMutation'
import { stepAndCardBlockCreateCacheUpdate } from '../../../../../../libs/useStepAndCardBlockCreateMutation'

type Coordinates = {
  x: number
  y: number
}

export const STEP_AND_CARD_BLOCK_CREATE_WITH_BLOCK_ORDER_UPDATE = gql`
  ${STEP_FIELDS}
  ${CARD_FIELDS}
  mutation StepAndCardBlockCreateWithBlockOrderUpdate(
    $stepBlockCreateInput: StepBlockCreateInput!
    $cardBlockCreateInput: CardBlockCreateInput!
    $stepId: ID!,
    $parentOrder: Int!
  ) {
    stepBlockCreate(input: $stepBlockCreateInput) {
      ...StepFields
      x
      y
    }
    cardBlockCreate(input: $cardBlockCreateInput) {
      ...CardFields
    },
    blockOrderUpdate(
      id: $stepId
      parentOrder: $parentOrder
    ) {
      id
      parentOrder
    }
  }
`

export const BLOCK_DELETE_WITH_BLOCK_ORDER_UPDATE = gql`
  mutation BlockDeleteWithBlockOrderUpdate($id: ID!, $journeyId: ID!, $parentOrder: Int!, $stepId: ID! ) {
    blockDelete(id: $id, journeyId: $journeyId) {
      id
      parentOrder
      ... on StepBlock {
        nextBlockId
      }
    }
    blockOrderUpdate(
      id: $stepId
      parentOrder: $parentOrder
    ) {
      id
      parentOrder
    }
  }
`

export const BLOCK_RESTORE_WITH_BLOCK_ORDER_UPDATE = gql`
${BLOCK_FIELDS}
mutation BlockRestoreWithBlockOrderUpdate($id: ID!, $stepId: ID!, $parentOrder: Int!) {
  blockRestore(id: $id) {
    id
    ...BlockFields
    ... on StepBlock {
      id
      x
      y
    }
  }
  blockOrderUpdate(
      id: $stepId
      parentOrder: $parentOrder
    ) {
      id
      parentOrder
    }
}`

export function useCreateStepFromSocialPreview(): (
  coordinates: Coordinates
) => Promise<void> {
  const { journey } = useJourney()
  const {
    state: { selectedStep, steps },
    dispatch
  } = useEditor()
  const { add } = useCommand()
  const [blockDelete] = useBlockDeleteMutation()

  const [stepAndCardBlockCreateWithBlockOrderUpdate] = useMutation<
    StepAndCardBlockCreateWithBlockOrderUpdate,
    StepAndCardBlockCreateWithBlockOrderUpdateVariables
  >(STEP_AND_CARD_BLOCK_CREATE_WITH_BLOCK_ORDER_UPDATE, {
    update(cache, { data }) {
      stepAndCardBlockCreateCacheUpdate(cache, data, journey?.id)
    }
  })

  const [blockDeleteWithBlockOrderUpdate] = useMutation<
    BlockDeleteWithBlockOrderUpdate,
    BlockDeleteWithBlockOrderUpdateVariables
  >(BLOCK_DELETE_WITH_BLOCK_ORDER_UPDATE)

  const [blockRestoreWithBlockOrderUpdate] = useMutation<
    BlockRestoreWithBlockOrderUpdate,
    BlockRestoreWithBlockOrderUpdateVariables
  >(BLOCK_RESTORE_WITH_BLOCK_ORDER_UPDATE)

  return async function createStepFromSocialPreview({
    x,
    y
  }: { x: number; y: number }): Promise<void> {
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

    const oldFirstStep = steps?.find((step) => step.parentOrder === 0)
    const stepsCopy = cloneDeep(steps)
    const optimisticSteps = stepsCopy?.map((step) => {
      if (step.parentOrder === 0) {
        step.parentOrder = step.parentOrder + 1
      }
      return step
    })

    add({
      parameters: {
        execute: { optimisticSteps },
        undo: { stepBeforeDelete: oldFirstStep, steps },
        redo: { optimisticSteps }
      },
      async execute({ optimisticSteps }) {
        dispatch({
          type: 'SetSelectedStepByIdAction',
          selectedStepId: step.id
        })
        void stepAndCardBlockCreateWithBlockOrderUpdate({
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
            stepId: step.id,
            parentOrder: 0
          },
          optimisticResponse: {
            stepBlockCreate: step,
            cardBlockCreate: card,
            blockOrderUpdate: [step, ...(optimisticSteps ?? [])]
          }
        })
      },
      async undo({ stepBeforeDelete, steps }) {
        if (stepBeforeDelete != null) {
          dispatch({
            type: 'SetEditorFocusAction',
            selectedStepId: stepBeforeDelete.id,
            activeSlide: ActiveSlide.JourneyFlow
          })
          blockDeleteWithBlockOrderUpdate({
            variables: {
              id: step.id,
              journeyId: journey.id,
              stepId: stepBeforeDelete.id,
              parentOrder: 0
            },
            optimisticResponse: {
              blockDelete: [step],
              blockOrderUpdate: steps ?? []
            },
            update(cache, { data }) {
              blockDeleteUpdate(step, data?.blockDelete, cache, journey.id)
            }
          })
        } else {
          blockDelete(step, { optimisticResponse: { blockDelete: [] } })
        }
      },
      async redo({ optimisticSteps }) {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedStepId: step.id,
          activeSlide: ActiveSlide.JourneyFlow
        })
        void blockRestoreWithBlockOrderUpdate({
          variables: {
            id: step.id,
            stepId: step.id,
            parentOrder: 0
          },
          optimisticResponse: {
            blockRestore: [step, card],
            blockOrderUpdate: [step, ...(optimisticSteps ?? [])]
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
