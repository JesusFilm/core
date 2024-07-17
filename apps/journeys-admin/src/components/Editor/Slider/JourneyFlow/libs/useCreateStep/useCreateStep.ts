import { gql } from '@apollo/client'
import { v4 as uuidv4 } from 'uuid'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { searchBlocks } from '@core/journeys/ui/searchBlocks'

import { StepAndCardBlockCreate } from '../../../../../../../__generated__/StepAndCardBlockCreate'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'
import { useBlockActionNavigateToBlockUpdateMutation } from '../../../../../../libs/useBlockActionNavigateToBlockUpdateMutation'
import { useBlockOrderUpdateMutation } from '../../../../../../libs/useBlockOrderUpdateMutation'
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
    state: { steps },
    dispatch
  } = useEditor()
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

    if (data == null) return

    dispatch({
      type: 'SetSelectedStepAction',
      selectedStep: {
        ...data.stepBlockCreate,
        children: [{ ...data.cardBlockCreate, children: [] }]
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

    return data
  }
}
