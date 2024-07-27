import { gql, useMutation } from '@apollo/client'
import { v4 as uuidv4 } from 'uuid'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { CARD_FIELDS } from '@core/journeys/ui/Card/cardFields'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { STEP_FIELDS } from '@core/journeys/ui/Step/stepFields'
import { TreeBlock } from '@core/journeys/ui/block'
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
import { StepAndCardBlockCreate } from '../../../../../../../__generated__/StepAndCardBlockCreate'
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

type SourceStepAndCoordinates = {
  x: number
  y: number
  sourceStep: TreeBlock<StepBlock> | null | undefined
}

export const BLOCK_DELETE_WITH_STEP_UPDATE = gql`
  mutation BlockDeleteWithStepUpdate($id: ID!, $journeyId: ID!, $parentBlockId: ID, $input: StepBlockUpdateInput!, $stepBlockUpdateId: ID! ) {
    blockDelete(id: $id, journeyId: $journeyId, parentBlockId: $parentBlockId) {
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
  sourceStepAndCoordinates: SourceStepAndCoordinates
) => Promise<StepAndCardBlockCreate | null | undefined> {
  const { journey } = useJourney()
  const {
    state: { selectedStep },
    dispatch
  } = useEditor()
  const { add } = useCommand()
  // const [stepAndCardBlockCreate] = useStepAndCardBlockCreateMutation({
  //   update(cache, { data }) {
  //     if (data?.stepBlockCreate == null || data?.cardBlockCreate == null) return
  //     cache.modify({
  //       fields: {
  //         blocks(existingBlockRefs = []) {
  //           const newStepBlockRef = cache.writeFragment({
  //             data: data.stepBlockCreate,
  //             fragment: gql`
  //               fragment NewBlock on Block {
  //                 id
  //               }
  //             `
  //           })
  //           return [...existingBlockRefs, newStepBlockRef]
  //         }
  //       }
  //     })
  //     cache.modify({
  //       id: cache.identify({ __typename: 'Journey', id: journey.id }),
  //       fields: {
  //         blocks(existingBlockRefs = [], { readField }) {
  //           const newStepBlockRef = cache.writeFragment({
  //             data: data.stepBlockCreate,
  //             fragment: gql`
  //               fragment NewBlock on Block {
  //                 id
  //               }
  //             `
  //           })
  //           const newCardBlockRef = cache.writeFragment({
  //             data: data.cardBlockCreate,
  //             fragment: gql`
  //               fragment NewBlock on Block {
  //                 id
  //               }
  //             `
  //           })
  //           return [...existingBlockRefs, newStepBlockRef, newCardBlockRef]
  //         }
  //       }
  //     })
  //   }
  //   // if (data?.stepBlockCreate != null && data?.cardBlockCreate != null) {

  //   // }
  // })

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
      if (journey == null) return
      if (data?.stepBlockCreate == null || data?.cardBlockCreate == null) return
      cache.modify({
        fields: {
          blocks(existingBlockRefs = []) {
            const newStepBlockRef = cache.writeFragment({
              data: data.stepBlockCreate,
              fragment: gql`
                fragment NewBlock on Block {
                  id
                }
              `
            })
            return [...existingBlockRefs, newStepBlockRef]
          }
        }
      })
      cache.modify({
        id: cache.identify({ __typename: 'Journey', id: journey.id }),
        fields: {
          blocks(existingBlockRefs = []) {
            const newStepBlockRef = cache.writeFragment({
              data: data.stepBlockCreate,
              fragment: gql`
                fragment NewBlock on Block {
                  id
                }
              `
            })
            const newCardBlockRef = cache.writeFragment({
              data: data.cardBlockCreate,
              fragment: gql`
                fragment NewBlock on Block {
                  id
                }
              `
            })
            return [...existingBlockRefs, newStepBlockRef, newCardBlockRef]
          }
        }
      })
    }
  })

  // const [stepBlockNextBlockUpdate] = useStepBlockNextBlockUpdateMutation()
  // const [actionNavigateToBlockUpdate] =
  //   useBlockActionNavigateToBlockUpdateMutation()
  // const [blockOrderUpdate] = useBlockOrderUpdateMutation()

  return async function createStep({
    x,
    y,
    sourceStep
  }: SourceStepAndCoordinates): Promise<
    StepAndCardBlockCreate | null | undefined
  > {
    if (journey == null) return
    // const step.id = uuidv4()
    // const card.id = uuidv4()

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

    // async function setNextBlockActions(target: string): Promise<void> {
    //   if (journey == null) return
    //   switch (edgeSource.sourceType) {
    //     case 'socialPreview':
    //       await blockOrderUpdate({
    //         variables: {
    //           id: target,
    //           journeyId: journey.id,
    //           parentOrder: 0
    //         },
    //         optimisticResponse: {
    //           blockOrderUpdate: [
    //             {
    //               id: target,
    //               __typename: 'StepBlock',
    //               parentOrder: 0
    //             }
    //           ]
    //         }
    //       })
    //       break
    //     case 'step':
    //       await stepBlockNextBlockUpdate({
    //         variables: {
    //           id: edgeSource.stepId,
    //           journeyId: journey.id,
    //           input: {
    //             nextBlockId: target
    //           }
    //         },
    //         optimisticResponse: {
    //           stepBlockUpdate: {
    //             id: edgeSource.stepId,
    //             __typename: 'StepBlock',
    //             nextBlockId: target
    //           }
    //         }
    //       })
    //       break
    //     case 'action': {
    //       if (sourceBlock != null)
    //         await actionNavigateToBlockUpdate(sourceBlock, target)
    //       break
    //     }
    //   }
    // }

    // let newBlockRef: StepAndCardBlockCreate | null | undefined = {
    //   stepBlockCreate: step,
    //   cardBlockCreate: card,
    //   stepBlockUpdate: {
    //     __typename: 'StepBlock',
    //     id: step.id,
    //     nextBlockId: null
    //   }
    // }

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
          // dispatch({
          //   type: 'SetEditorFocusAction',
          //   selectedStep: stepBeforeDelete,
          //   activeSlide: ActiveSlide.JourneyFlow
          // })
          void blockDeleteWithStepUpdate({
            variables: {
              id: step.id,
              journeyId: journey.id,
              stepBlockUpdateId: sourceStep.id as string,
              input: {
                nextBlockId: sourceStep?.nextBlockId as unknown as string
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

        // if (newBlockRef != null) {
        //   await blockDelete(newBlockRef.stepBlockCreate, {
        //     optimisticResponse: {
        //       blockDelete: [...(steps ?? []), newBlockRef.stepBlockCreate]
        //     }
        //   })
        // }

        // if (edgeSource.sourceType === 'step' && sourceStep?.nextBlockId != null)
        //   await setNextBlockActions(sourceStep.nextBlockId)
        // if (sourceBlock != null && 'action' in sourceBlock) {
        //   switch (sourceBlock.action?.__typename) {
        //     case 'EmailAction': {
        //       await actionEmailUpdate(sourceBlock, sourceBlock.action.email)
        //       break
        //     }
        //     case 'LinkAction': {
        //       await actionLinkUpdate(sourceBlock, sourceBlock.action.url)
        //       break
        //     }
        //     case 'NavigateToBlockAction': {
        //       await actionNavigateToBlockUpdate(
        //         sourceBlock,
        //         sourceBlock.action.blockId
        //       )
        //       break
        //     }
        //   }
        // }
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
            update(cache, { data }) {
              blockRestoreUpdate(
                { id: step.id },
                data?.blockRestore,
                cache,
                journey.id
              )
            },
            optimisticResponse: {
              blockRestore: [step, card],
              stepBlockUpdate: {
                id: sourceStep.id,
                __typename: 'StepBlock',
                nextBlockId: step.id
              }
            }
          })
          // dispatch({
          //   type: 'SetSelectedStepAction',
          //   selectedStep: {
          //     ...optimisticStep,
          //     __typename: 'StepBlock',
          //     children: [
          //       {
          //         ...optimisticCard,
          //         __typename: 'CardBlock',
          //         children: []
          //       }
          //     ]
          //   }
          // })
          // await blockRestore({
          //   variables: { id: newBlockRef.stepBlockCreate.id },
          //   optimisticResponse: {
          //     blockRestore: [
          //       newBlockRef.stepBlockCreate,
          //       newBlockRef.cardBlockCreate
          //     ]
          //   }
          // })
          // await setNextBlockActions(step.id)
        }
      }
    })
  }
}
