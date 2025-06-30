import { gql, useMutation } from '@apollo/client'
import cloneDeep from 'lodash/cloneDeep'
import { v4 as uuidv4 } from 'uuid'

import { BLOCK_FIELDS } from '@core/journeys/ui/block/blockFields'
import { CARD_FIELDS } from '@core/journeys/ui/Card/cardFields'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { ActiveSlide, useEditor } from '@core/journeys/ui/EditorProvider'
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
  StepBlockCreateFromSocialPreview,
  StepBlockCreateFromSocialPreviewVariables
} from '../../../../../../../__generated__/StepBlockCreateFromSocialPreview'
import {
  StepBlockDeleteFromSocialPreview,
  StepBlockDeleteFromSocialPreviewVariables
} from '../../../../../../../__generated__/StepBlockDeleteFromSocialPreview'
import {
  StepBlockRestoreFromSocialPreview,
  StepBlockRestoreFromSocialPreviewVariables
} from '../../../../../../../__generated__/StepBlockRestoreFromSocialPreview'
import { blockDeleteUpdate } from '../../../../../../libs/blockDeleteUpdate'
import { useBlockDeleteMutation } from '../../../../../../libs/useBlockDeleteMutation'
import { blockRestoreUpdate } from '../../../../../../libs/useBlockRestoreMutation'
import { stepBlockCreateUpdate } from '../../../../../../libs/useStepAndCardBlockCreateMutation'
import { CreateStepInput } from '../useCreateStep/useCreateStep'

type CreateStepFromSocialPreviewInput = CreateStepInput

export const STEP_BLOCK_CREATE_FROM_SOCIAL_PREVIEW = gql`
  ${STEP_FIELDS}
  ${CARD_FIELDS}
  mutation StepBlockCreateFromSocialPreview(
    $stepBlockCreateInput: StepBlockCreateInput!
    $cardBlockCreateInput: CardBlockCreateInput!
    $stepId: ID!
    $parentOrder: Int!
  ) {
    stepBlockCreate(input: $stepBlockCreateInput) {
      ...StepFields
      x
      y
    }
    cardBlockCreate(input: $cardBlockCreateInput) {
      ...CardFields
    }
    blockOrderUpdate(id: $stepId, parentOrder: $parentOrder) {
      id
      parentOrder
    }
  }
`

export const STEP_BLOCK_DELETE_FROM_SOCIAL_PREVIEW = gql`
  mutation StepBlockDeleteFromSocialPreview(
    $id: ID!
    $journeyId: ID!
    $parentOrder: Int!
    $stepId: ID!
  ) {
    blockDelete(id: $id, journeyId: $journeyId) {
      id
      parentOrder
      ... on StepBlock {
        nextBlockId
      }
    }
    blockOrderUpdate(id: $stepId, parentOrder: $parentOrder) {
      id
      parentOrder
    }
  }
`

export const STEP_BLOCK_RESTORE_FROM_SOCIAL_PREVIEW = gql`
  ${BLOCK_FIELDS}
  mutation StepBlockRestoreFromSocialPreview(
    $id: ID!
    $stepId: ID!
    $parentOrder: Int!
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
    blockOrderUpdate(id: $stepId, parentOrder: $parentOrder) {
      id
      parentOrder
    }
  }
`

export function useCreateStepFromSocialPreview(): (
  input: CreateStepFromSocialPreviewInput
) => void {
  const { journey } = useJourney()
  const {
    state: { steps },
    dispatch
  } = useEditor()
  const { add } = useCommand()
  const [blockDelete] = useBlockDeleteMutation()

  const [stepBlockCreateFromSocialPreview] = useMutation<
    StepBlockCreateFromSocialPreview,
    StepBlockCreateFromSocialPreviewVariables
  >(STEP_BLOCK_CREATE_FROM_SOCIAL_PREVIEW)

  const [stepBlockDeleteFromSocialPreview] = useMutation<
    StepBlockDeleteFromSocialPreview,
    StepBlockDeleteFromSocialPreviewVariables
  >(STEP_BLOCK_DELETE_FROM_SOCIAL_PREVIEW)

  const [stepBlockRestoreFromSocialPreview] = useMutation<
    StepBlockRestoreFromSocialPreview,
    StepBlockRestoreFromSocialPreviewVariables
  >(STEP_BLOCK_RESTORE_FROM_SOCIAL_PREVIEW)

  return function createStepFromSocialPreview({
    x,
    y
  }: CreateStepFromSocialPreviewInput): void {
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
      execute({ optimisticSteps }) {
        dispatch({
          type: 'SetSelectedStepByIdAction',
          selectedStepId: step.id
        })
        void stepBlockCreateFromSocialPreview({
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
          },
          update(cache, { data }) {
            stepBlockCreateUpdate(cache, data, journey?.id)
          }
        })
      },
      undo({ stepBeforeDelete, steps }) {
        if (stepBeforeDelete != null) {
          dispatch({
            type: 'SetEditorFocusAction',
            selectedStepId: stepBeforeDelete.id,
            activeSlide: ActiveSlide.JourneyFlow
          })
          void stepBlockDeleteFromSocialPreview({
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
          void blockDelete(step, { optimisticResponse: { blockDelete: [] } })
        }
      },
      redo({ optimisticSteps }) {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedStepId: step.id,
          activeSlide: ActiveSlide.JourneyFlow
        })
        void stepBlockRestoreFromSocialPreview({
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
