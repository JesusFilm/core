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
    let newBlockRef: StepAndCardBlockCreate | null | undefined
    await add({
      parameters: { execute: {}, undo: { stepBeforeDelete: selectedStep } },
      execute: async () => {
        const { data } = await stepAndCardBlockCreate({
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
            }
          }
        })
        newBlockRef = data
      },
      undo: async ({ stepBeforeDelete }) => {
        if (newBlockRef != null) await blockDelete(newBlockRef?.stepBlockCreate)
        dispatch({
          type: 'SetEditorFocusAction',
          selectedStep: stepBeforeDelete,
          activeSlide: ActiveSlide.JourneyFlow
        })
      },
      redo: async () => {
        if (newBlockRef != null) {
          await blockRestore({
            variables: { blockRestoreId: newBlockRef.stepBlockCreate.id }
          })
          dispatch({
            type: 'SetEditorFocusAction',
            selectedStep: {
              ...newBlockRef.stepBlockCreate,
              children: [{ ...newBlockRef.cardBlockCreate, children: [] }]
            },
            activeSlide: ActiveSlide.JourneyFlow
          })
        }
      }
    })

    if (newBlockRef == null) return
    dispatch({
      type: 'SetSelectedStepAction',
      selectedStep: {
        ...newBlockRef.stepBlockCreate,
        children: [{ ...newBlockRef.cardBlockCreate, children: [] }]
      }
    })

    const edgeSource = convertToEdgeSource(rawEdgeSource)

    switch (edgeSource.sourceType) {
      case 'socialPreview':
        await blockOrderUpdate({
          variables: {
            id: newStepId,
            journeyId: journey.id,
            parentOrder: 0
          },
          optimisticResponse: {
            blockOrderUpdate: [
              {
                id: newStepId,
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
              nextBlockId: newStepId
            }
          },
          optimisticResponse: {
            stepBlockUpdate: {
              id: edgeSource.stepId,
              __typename: 'StepBlock',
              nextBlockId: newStepId
            }
          }
        })
        break
      case 'action': {
        const step = steps?.find((step) => step.id === edgeSource.stepId)
        const block = searchBlocks(
          step != null ? [step] : [],
          edgeSource.blockId
        )
        if (block != null) await actionNavigateToBlockUpdate(block, newStepId)
        break
      }
    }

    return newBlockRef
  }
}
