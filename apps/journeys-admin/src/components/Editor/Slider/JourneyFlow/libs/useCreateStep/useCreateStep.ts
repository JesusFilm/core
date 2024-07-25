import { gql } from '@apollo/client'
import { v4 as uuidv4 } from 'uuid'

import { ActiveSlide, useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { searchBlocks } from '@core/journeys/ui/searchBlocks'

import { useCommand } from '@core/journeys/ui/CommandProvider'
import { StepAndCardBlockCreate } from '../../../../../../../__generated__/StepAndCardBlockCreate'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'
import { useBlockActionEmailUpdateMutation } from '../../../../../../libs/useBlockActionEmailUpdateMutation'
import { useBlockActionLinkUpdateMutation } from '../../../../../../libs/useBlockActionLinkUpdateMutation'
import { useBlockActionNavigateToBlockUpdateMutation } from '../../../../../../libs/useBlockActionNavigateToBlockUpdateMutation'
import { useBlockDeleteMutation } from '../../../../../../libs/useBlockDeleteMutation'
import { useBlockOrderUpdateMutation } from '../../../../../../libs/useBlockOrderUpdateMutation'
import { useBlockRestoreMutation } from '../../../../../../libs/useBlockRestoreMutation'
import { useStepAndCardBlockCreateMutation } from '../../../../../../libs/useStepAndCardBlockCreateMutation'
import { useStepBlockNextBlockUpdateMutation } from '../../../../../../libs/useStepBlockNextBlockUpdateMutation'
import { RawEdgeSource, convertToEdgeSource } from '../convertToEdgeSource'

type RawEdgeSourceAndCoordinates = RawEdgeSource & {
  x: number
  y: number
}

export function useCreateStep(): (
  rawEdgeSource: RawEdgeSourceAndCoordinates
) => Promise<StepAndCardBlockCreate | null | undefined> {
  const { journey } = useJourney()
  const {
    state: { steps, selectedStep },
    dispatch
  } = useEditor()
  const { add } = useCommand()
  const [blockDelete] = useBlockDeleteMutation()
  const [blockRestore] = useBlockRestoreMutation()
  const [actionLinkUpdate] = useBlockActionLinkUpdateMutation()
  const [actionEmailUpdate] = useBlockActionEmailUpdateMutation()
  const [stepAndCardBlockCreate] = useStepAndCardBlockCreateMutation({
    update(cache, { data }) {
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
    }
  })
  const [stepBlockNextBlockUpdate] = useStepBlockNextBlockUpdateMutation()
  const [actionNavigateToBlockUpdate] =
    useBlockActionNavigateToBlockUpdateMutation()
  const [blockOrderUpdate] = useBlockOrderUpdateMutation()

  return async function createStep({
    x,
    y,
    ...rawEdgeSource
  }: RawEdgeSourceAndCoordinates): Promise<
    StepAndCardBlockCreate | null | undefined
  > {
    if (journey == null) return
    const newStepId = uuidv4()
    const newCardId = uuidv4()
    const edgeSource = convertToEdgeSource(rawEdgeSource)

    const sourceStep =
      edgeSource.sourceType === 'step' || edgeSource.sourceType === 'action'
        ? steps?.find((step) => step.id === edgeSource.stepId)
        : null

    const sourceBlock =
      edgeSource.sourceType === 'action'
        ? searchBlocks(
            sourceStep != null ? [sourceStep] : [],
            edgeSource.blockId
          )
        : null

    const optimisticStep = {
      locked: false,
      nextBlockId: null,
      parentBlockId: null,
      parentOrder: 0,
      id: newStepId,
      x,
      y
    }
    const optimisticCard = {
      id: newCardId,
      parentBlockId: newStepId,
      themeMode: ThemeMode.dark,
      themeName: ThemeName.base,
      fullscreen: false,
      coverBlockId: null,
      backgroundColor: null,
      parentOrder: 0
    }

    async function setNextBlockActions(target: string): Promise<void> {
      if (journey == null) return
      switch (edgeSource.sourceType) {
        case 'socialPreview':
          await blockOrderUpdate({
            variables: {
              id: target,
              journeyId: journey.id,
              parentOrder: 0
            },
            optimisticResponse: {
              blockOrderUpdate: [
                {
                  id: target,
                  __typename: 'StepBlock',
                  parentOrder: 0
                }
              ]
            }
          })
          break
        case 'step':
          await stepBlockNextBlockUpdate({
            variables: {
              id: edgeSource.stepId,
              journeyId: journey.id,
              input: {
                nextBlockId: target
              }
            },
            optimisticResponse: {
              stepBlockUpdate: {
                id: edgeSource.stepId,
                __typename: 'StepBlock',
                nextBlockId: target
              }
            }
          })
          break
        case 'action': {
          if (sourceBlock != null)
            await actionNavigateToBlockUpdate(sourceBlock, target)
          break
        }
      }
    }

    let newBlockRef: StepAndCardBlockCreate | null | undefined
    await add({
      parameters: {
        execute: {},
        undo: { stepBeforeDelete: selectedStep, sourceBlock }
      },
      execute: async () => {
        dispatch({
          type: 'SetSelectedStepByIdAction',
          selectedStepId: newStepId
        })
        if (edgeSource.sourceType === 'step') {
          void stepAndCardBlockCreate({
            variables: {
              stepBlockCreateInput: {
                id: newStepId,
                journeyId: journey.id,
                x,
                y
              },
              cardBlockCreateInput: {
                id: newCardId,
                journeyId: journey.id,
                parentBlockId: newStepId,
                themeMode: ThemeMode.dark,
                themeName: ThemeName.base
              },
              stepId: edgeSource.stepId,
              journeyId: journey.id,
              stepBlockUpdateInput: {
                nextBlockId: newStepId
              }
            },
            optimisticResponse: {
              stepBlockCreate: {
                __typename: 'StepBlock',
                locked: false,
                nextBlockId: null,
                parentBlockId: null,
                parentOrder: 0,
                id: newStepId,
                x,
                y
              },
              cardBlockCreate: {
                __typename: 'CardBlock',
                id: newCardId,
                parentBlockId: newStepId,
                themeMode: ThemeMode.dark,
                themeName: ThemeName.base,
                fullscreen: false,
                coverBlockId: null,
                backgroundColor: null,
                parentOrder: 0
              },
              stepBlockUpdate: {
                id: edgeSource.stepId,
                __typename: 'StepBlock',
                nextBlockId: newStepId
              }
            },

            onCompleted: (data) => {
              newBlockRef = data
            }
          })
        }

        // await setNextBlockActions(newStepId)
        if (newBlockRef == null) return
      },
      undo: async ({ stepBeforeDelete, sourceBlock }) => {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedStep: stepBeforeDelete,
          activeSlide: ActiveSlide.JourneyFlow
        })
        if (newBlockRef != null)
          await blockDelete(newBlockRef?.stepBlockCreate, {
            optimisticResponse: {
              blockDelete: [...(steps ?? []), newBlockRef.stepBlockCreate]
            }
          })
        if (edgeSource.sourceType === 'step' && sourceStep?.nextBlockId != null)
          await setNextBlockActions(sourceStep.nextBlockId)
        if (sourceBlock != null && 'action' in sourceBlock) {
          switch (sourceBlock.action?.__typename) {
            case 'EmailAction': {
              await actionEmailUpdate(sourceBlock, sourceBlock.action.email)
              break
            }
            case 'LinkAction': {
              await actionLinkUpdate(sourceBlock, sourceBlock.action.url)
              break
            }
            case 'NavigateToBlockAction': {
              await actionNavigateToBlockUpdate(
                sourceBlock,
                sourceBlock.action.blockId
              )
              break
            }
          }
        }
      },
      redo: async () => {
        if (newBlockRef != null) {
          dispatch({
            type: 'SetSelectedStepAction',
            selectedStep: {
              ...optimisticStep,
              __typename: 'StepBlock',
              children: [
                {
                  ...optimisticCard,
                  __typename: 'CardBlock',
                  children: []
                }
              ]
            }
          })
          await blockRestore({
            variables: { id: newBlockRef.stepBlockCreate.id },
            optimisticResponse: {
              blockRestore: [
                newBlockRef.stepBlockCreate,
                newBlockRef.cardBlockCreate
              ]
            }
          })
          await setNextBlockActions(newStepId)
        }
      }
    })

    return newBlockRef
  }
}
