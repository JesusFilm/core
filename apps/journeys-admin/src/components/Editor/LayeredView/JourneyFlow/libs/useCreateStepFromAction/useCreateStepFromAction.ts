import { gql, useMutation } from '@apollo/client'
import { v4 as uuidv4 } from 'uuid'

import { BLOCK_FIELDS } from '@core/journeys/ui/block/blockFields'
import { CARD_FIELDS } from '@core/journeys/ui/Card/cardFields'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { ActiveSlide, useEditor } from '@core/journeys/ui/EditorProvider'
import { ActionBlock } from '@core/journeys/ui/isActionBlock'
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
  StepBlockCreateFromAction,
  StepBlockCreateFromActionVariables
} from '../../../../../../../__generated__/StepBlockCreateFromAction'
import {
  StepBlockDeleteFromAction,
  StepBlockDeleteFromActionVariables
} from '../../../../../../../__generated__/StepBlockDeleteFromAction'
import {
  StepBlockDeleteFromActionWithoutAction,
  StepBlockDeleteFromActionWithoutActionVariables
} from '../../../../../../../__generated__/StepBlockDeleteFromActionWithoutAction'
import {
  StepBlockRestoreFromAction,
  StepBlockRestoreFromActionVariables
} from '../../../../../../../__generated__/StepBlockRestoreFromAction'
import { blockDeleteUpdate } from '../../../../../../libs/blockDeleteUpdate'
import { blockRestoreUpdate } from '../../../../../../libs/useBlockRestoreMutation'
import { stepBlockCreateUpdate } from '../../../../../../libs/useStepAndCardBlockCreateMutation'
import { CreateStepFromStepInput } from '../useCreateStepFromStep'

export type CreateStepFromActionInput = CreateStepFromStepInput & {
  sourceBlock: ActionBlock
}

export const STEP_BLOCK_DELETE_FROM_ACTION = gql`
  mutation StepBlockDeleteFromAction(
    $id: ID!
    $journeyId: ID!
    $parentBlockId: ID
    $input: BlockUpdateActionInput!
    $blockUpdateActionId: ID!
  ) {
    blockDelete(id: $id, journeyId: $journeyId, parentBlockId: $parentBlockId) {
      id
      parentOrder
      ... on StepBlock {
        nextBlockId
      }
    }
    blockUpdateAction(id: $blockUpdateActionId, input: $input) {
      parentBlockId
      parentBlock {
        id
      }
      gtmEventName
    }
  }
`

export const STEP_BLOCK_DELETE_FROM_ACTION_WITHOUT_ACTION = gql`
  mutation StepBlockDeleteFromActionWithoutAction(
    $id: ID!
    $journeyId: ID!
    $parentBlockId: ID
    $blockDeleteActionId: ID!
  ) {
    blockDelete(id: $id, journeyId: $journeyId, parentBlockId: $parentBlockId) {
      id
      parentOrder
      ... on StepBlock {
        nextBlockId
      }
    }
    blockDeleteAction(id: $blockDeleteActionId) {
      id
      ... on RadioOptionBlock {
        action {
          parentBlockId
        }
      }
      ... on ButtonBlock {
        action {
          parentBlockId
        }
      }
      ... on SignUpBlock {
        action {
          parentBlockId
        }
      }
      ... on VideoBlock {
        action {
          parentBlockId
        }
      }
    }
  }
`

export const STEP_BLOCK_RESTORE_FROM_ACTION = gql`
  ${BLOCK_FIELDS}
  mutation StepBlockRestoreFromAction(
    $id: ID!
    $blockUpdateActionId: ID!
    $input: BlockUpdateActionInput!
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
    blockUpdateAction(id: $blockUpdateActionId, input: $input) {
      parentBlockId
      parentBlock {
        id
      }
      gtmEventName
    }
  }
`

export const STEP_BLOCK_CREATE_FROM_ACTION = gql`
  ${STEP_FIELDS}
  ${CARD_FIELDS}
  mutation StepBlockCreateFromAction(
    $stepBlockCreateInput: StepBlockCreateInput!
    $cardBlockCreateInput: CardBlockCreateInput!
    $blockId: ID!
    $blockUpdateActionInput: BlockUpdateActionInput!
  ) {
    stepBlockCreate(input: $stepBlockCreateInput) {
      ...StepFields
      x
      y
    }
    cardBlockCreate(input: $cardBlockCreateInput) {
      ...CardFields
    }
    blockUpdateAction(id: $blockId, input: $blockUpdateActionInput) {
      parentBlockId
      parentBlock {
        id
      }
      gtmEventName
    }
  }
`

export function useCreateStepFromAction(): (
  input: CreateStepFromActionInput
) => void {
  const { journey } = useJourney()
  const {
    state: { selectedStep },
    dispatch
  } = useEditor()
  const { add } = useCommand()

  const [stepBlockDeleteFromAction] = useMutation<
    StepBlockDeleteFromAction,
    StepBlockDeleteFromActionVariables
  >(STEP_BLOCK_DELETE_FROM_ACTION)

  const [stepBlockDeleteFromActionWithoutAction] = useMutation<
    StepBlockDeleteFromActionWithoutAction,
    StepBlockDeleteFromActionWithoutActionVariables
  >(STEP_BLOCK_DELETE_FROM_ACTION_WITHOUT_ACTION)

  const [stepBlockCreateFromAction] = useMutation<
    StepBlockCreateFromAction,
    StepBlockCreateFromActionVariables
  >(STEP_BLOCK_CREATE_FROM_ACTION)

  const [stepBlockRestoreFromAction] = useMutation<
    StepBlockRestoreFromAction,
    StepBlockRestoreFromActionVariables
  >(STEP_BLOCK_RESTORE_FROM_ACTION)

  return function createStepFromAction({
    x,
    y,
    sourceStep,
    sourceBlock
  }: CreateStepFromActionInput): void {
    if (
      journey == null ||
      sourceBlock == null ||
      sourceStep == null ||
      selectedStep == null
    )
      return

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
      parameters: { execute: {}, undo: { stepBeforeDelete: selectedStep } },
      execute() {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedStepId: step.id,
          activeSlide: ActiveSlide.JourneyFlow
        })
        void stepBlockCreateFromAction({
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
            blockId: sourceBlock.id,
            blockUpdateActionInput: {
              gtmEventName: sourceBlock?.action?.gtmEventName ?? null,
              blockId: step.id
            }
          },
          optimisticResponse: {
            stepBlockCreate: step,
            cardBlockCreate: card,
            blockUpdateAction: {
              parentBlockId: sourceBlock.id,
              __typename: 'NavigateToBlockAction',
              gtmEventName: sourceBlock?.action?.gtmEventName ?? null,
              parentBlock: {
                ...sourceBlock
              }
            }
          },
          update(cache, { data }) {
            stepBlockCreateUpdate(cache, data, journey?.id)
            if (data?.blockUpdateAction == null) return
            cache.modify({
              id: cache.identify({
                __typename: sourceBlock.__typename,
                id: sourceBlock.id
              }),
              fields: {
                action: () => ({ ...data.blockUpdateAction, blockId: step.id })
              }
            })
          }
        })
      },
      undo({ stepBeforeDelete }) {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedStepId: stepBeforeDelete.id,
          activeSlide: ActiveSlide.JourneyFlow
        })

        if (sourceBlock.action != null) {
          void stepBlockDeleteFromAction({
            variables: {
              id: step.id,
              journeyId: journey.id,
              blockUpdateActionId: sourceBlock.id,
              input: {
                gtmEventName: sourceBlock?.action?.gtmEventName ?? null,
                email:
                  'email' in sourceBlock.action
                    ? sourceBlock?.action?.email
                    : null,
                url:
                  'url' in sourceBlock.action ? sourceBlock?.action?.url : null,
                blockId:
                  'blockId' in sourceBlock.action
                    ? sourceBlock?.action?.blockId
                    : null,
                target:
                  'target' in sourceBlock.action
                    ? (sourceBlock?.action?.target as string)
                    : null
              }
            },
            optimisticResponse: {
              blockDelete: [step],
              blockUpdateAction: {
                parentBlockId: sourceBlock.id,
                __typename: sourceBlock.action.__typename,
                parentBlock: {
                  ...sourceBlock
                },
                gtmEventName: sourceBlock?.action?.gtmEventName ?? null
              }
            },
            update(cache, { data }, { variables }) {
              blockDeleteUpdate(step, data?.blockDelete, cache, journey.id)
              if (data?.blockUpdateAction == null) return
              cache.modify({
                id: cache.identify({
                  __typename: sourceBlock.__typename,
                  id: sourceBlock.id
                }),
                fields: {
                  action: () => ({
                    ...data.blockUpdateAction,
                    ...variables?.input
                  })
                }
              })
            }
          })
        } else {
          void stepBlockDeleteFromActionWithoutAction({
            variables: {
              id: step.id,
              journeyId: journey.id,
              blockDeleteActionId: sourceBlock.id
            },
            optimisticResponse: {
              blockDelete: [step],
              blockDeleteAction: {
                id: sourceBlock.id,
                __typename: sourceBlock.__typename,
                action: null
              }
            },
            update(cache, { data }) {
              blockDeleteUpdate(step, data?.blockDelete, cache, journey.id)
            }
          })
        }
      },
      redo() {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedStepId: step.id,
          activeSlide: ActiveSlide.JourneyFlow
        })
        void stepBlockRestoreFromAction({
          variables: {
            id: step.id,
            blockUpdateActionId: sourceBlock.id,
            input: {
              gtmEventName: sourceBlock?.action?.gtmEventName ?? null,
              blockId: step.id
            }
          },
          optimisticResponse: {
            blockRestore: [step, card],
            blockUpdateAction: {
              parentBlockId: sourceBlock.id,
              __typename: 'NavigateToBlockAction',
              gtmEventName: sourceBlock?.action?.gtmEventName ?? null,
              parentBlock: {
                ...sourceBlock
              }
            }
          },
          update(cache, { data }) {
            blockRestoreUpdate(
              { id: step.id },
              data?.blockRestore,
              cache,
              journey.id
            )
            if (data?.blockUpdateAction == null) return
            cache.modify({
              id: cache.identify({
                __typename: sourceBlock.__typename,
                id: sourceBlock.id
              }),
              fields: {
                action: () => ({ ...data.blockUpdateAction, blockId: step.id })
              }
            })
          }
        })
      }
    })
  }
}
