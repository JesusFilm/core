import { v4 as uuidv4 } from 'uuid'

import { useCommand } from '@core/journeys/ui/CommandProvider'
import { ActiveSlide, useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { gql, useMutation } from '@apollo/client'
import { CARD_FIELDS } from '@core/journeys/ui/Card/cardFields'
import { STEP_FIELDS } from '@core/journeys/ui/Step/stepFields'
import { BLOCK_FIELDS } from '@core/journeys/ui/block/blockFields'
import { isActionBlock } from '@core/journeys/ui/isActionBlock'
import {
  BlockDeleteWithBlockActionUpdate,
  BlockDeleteWithBlockActionUpdateVariables
} from '../../../../../../../__generated__/BlockDeleteWithBlockActionUpdate'
import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../__generated__/BlockFields'
import {
  BlockRestoreWithBlockActionUpdate,
  BlockRestoreWithBlockActionUpdateVariables
} from '../../../../../../../__generated__/BlockRestoreWithBlockActionUpdate'
import {
  StepAndCardBlockCreateWithBlockActionUpdate,
  StepAndCardBlockCreateWithBlockActionUpdateVariables
} from '../../../../../../../__generated__/StepAndCardBlockCreateWithBlockActionUpdate'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'
import { blockDeleteUpdate } from '../../../../../../libs/blockDeleteUpdate'
import { blockRestoreUpdate } from '../../../../../../libs/useBlockRestoreMutation'
import { stepAndCardBlockCreateCacheUpdate } from '../../../../../../libs/useStepAndCardBlockCreateMutation'
import { SourceBlocksAndCoordinates } from '../../JourneyFlow'

export const BLOCK_DELETE_WITH_BLOCK_ACTION_UPDATE = gql`
  mutation BlockDeleteWithBlockActionUpdate($id: ID!, $journeyId: ID!, $parentBlockId: ID, $input: BlockUpdateActionInput!, $blockUpdateActionId: ID! ) {
    blockDelete(id: $id, journeyId: $journeyId, parentBlockId: $parentBlockId) {
      id
      parentOrder
      ... on StepBlock {
        nextBlockId
      }
    }
    blockUpdateAction(id: $blockUpdateActionId, input: $input ) {
        parentBlockId
        parentBlock {
            id
        }
        gtmEventName
    }
  }
`

export const BLOCK_RESTORE_WITH_BLOCK_ACTION_UPDATE = gql`
${BLOCK_FIELDS}
mutation BlockRestoreWithBlockActionUpdate($id: ID!, $blockUpdateActionId: ID!, $input: BlockUpdateActionInput!) {
  blockRestore(id: $id) {
    id
    ...BlockFields
    ... on StepBlock {
      id
      x
      y
    }
  }
  blockUpdateAction(id: $blockUpdateActionId, input: $input ) {
        parentBlockId
        parentBlock {
            id
        }
        gtmEventName
    }
}`

export const STEP_AND_CARD_BLOCK_CREATE_WITH_BLOCK_ACTION_UPDATE = gql`
  ${STEP_FIELDS}
  ${CARD_FIELDS}
  mutation StepAndCardBlockCreateWithBlockActionUpdate(
    $stepBlockCreateInput: StepBlockCreateInput!
    $cardBlockCreateInput: CardBlockCreateInput!
    $blockId: ID!,
    $blockUpdateActionInput: BlockUpdateActionInput!
  ) {
    stepBlockCreate(input: $stepBlockCreateInput) {
      ...StepFields
      x
      y
    }
    cardBlockCreate(input: $cardBlockCreateInput) {
      ...CardFields
    },
    blockUpdateAction(id: $blockId, input: $blockUpdateActionInput ) {
        parentBlockId
        parentBlock {
            id
        }
        gtmEventName
    }
  }
`

export function useCreateStepFromAction(): (
  sourceBlocksAndCoordinates: SourceBlocksAndCoordinates
) => Promise<void> {
  const { journey } = useJourney()
  const {
    state: { selectedStep },
    dispatch
  } = useEditor()
  const { add } = useCommand()

  const [blockDeleteWithBlockActionUpdate] = useMutation<
    BlockDeleteWithBlockActionUpdate,
    BlockDeleteWithBlockActionUpdateVariables
  >(BLOCK_DELETE_WITH_BLOCK_ACTION_UPDATE)

  const [stepAndCardBlockCreateWithBlockActionUpdate] = useMutation<
    StepAndCardBlockCreateWithBlockActionUpdate,
    StepAndCardBlockCreateWithBlockActionUpdateVariables
  >(STEP_AND_CARD_BLOCK_CREATE_WITH_BLOCK_ACTION_UPDATE)

  const [blockRestoreWithBlockActionUpdate] = useMutation<
    BlockRestoreWithBlockActionUpdate,
    BlockRestoreWithBlockActionUpdateVariables
  >(BLOCK_RESTORE_WITH_BLOCK_ACTION_UPDATE)

  return async function createStepFromAction({
    x,
    y,
    sourceStep,
    sourceBlock
  }): Promise<void> {
    if (journey == null) return
    if (!isActionBlock(sourceBlock)) return

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

    add({
      parameters: { execute: {}, undo: { stepBeforeDelete: selectedStep } },
      async execute() {
        if (sourceBlock == null) return
        dispatch({
          type: 'SetEditorFocusAction',
          selectedStepId: step.id,
          activeSlide: ActiveSlide.JourneyFlow
        })
        void stepAndCardBlockCreateWithBlockActionUpdate({
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
            if (data?.blockUpdateAction == null) return
            stepAndCardBlockCreateCacheUpdate(cache, data, journey?.id)
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
      async undo({ stepBeforeDelete }) {
        if (
          sourceStep != null &&
          stepBeforeDelete != null &&
          sourceBlock != null &&
          sourceBlock?.action != null
        ) {
          dispatch({
            type: 'SetEditorFocusAction',
            selectedStepId: stepBeforeDelete.id,
            activeSlide: ActiveSlide.JourneyFlow
          })
          void blockDeleteWithBlockActionUpdate({
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
              if (data?.blockUpdateAction == null) return
              blockDeleteUpdate(step, data?.blockDelete, cache, journey.id)
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
        }
      },
      async redo() {
        if (sourceBlock == null) return
        dispatch({
          type: 'SetEditorFocusAction',
          selectedStepId: step.id,
          activeSlide: ActiveSlide.JourneyFlow
        })
        void blockRestoreWithBlockActionUpdate({
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
            if (data?.blockUpdateAction == null) return
            blockRestoreUpdate(
              { id: step.id },
              data?.blockRestore,
              cache,
              journey.id
            )
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
