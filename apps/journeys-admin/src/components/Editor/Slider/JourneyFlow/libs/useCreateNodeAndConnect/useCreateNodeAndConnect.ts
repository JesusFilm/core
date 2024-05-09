import { gql } from '@apollo/client'
import { v4 as uuidv4 } from 'uuid'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { searchBlocks } from '@core/journeys/ui/searchBlocks'

import {
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'
import { StepAndCardBlockCreate } from '../../../../../../../__generated__/StepAndCardBlockCreate'
import { useBlockOrderUpdateMutation } from '../../../../../../libs/useBlockOrderUpdateMutation'
import { useNavigateToBlockActionUpdateMutation } from '../../../../../../libs/useNavigateToBlockActionUpdateMutation'
import { useStepAndCardBlockCreateMutation } from '../../../../../../libs/useStepAndCardBlockCreateMutation'
import { useStepBlockNextBlockUpdateMutation } from '../../../../../../libs/useStepBlockNextBlockUpdateMutation'

export function useCreateNodeAndConnect(): (
  x: number,
  y: number,
  nodeId?: string,
  handleId?: string
) => Promise<StepAndCardBlockCreate | null | undefined> {
  const { journey } = useJourney()
  const {
    state: { steps },
    dispatch
  } = useEditor()
  const [stepAndCardBlockCreate] = useStepAndCardBlockCreateMutation({
    update(cache, { data }) {
      if (data?.stepBlockCreate != null && data?.cardBlockCreate != null) {
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
    }
  })
  const [stepBlockNextBlockUpdate] = useStepBlockNextBlockUpdateMutation()
  const [navigateToBlockActionUpdate] = useNavigateToBlockActionUpdateMutation()
  const [blockOrderUpdate] = useBlockOrderUpdateMutation()

  async function createNodeAndConnect(
    x: number,
    y: number,
    nodeId?: string,
    handleId?: string
  ): Promise<StepAndCardBlockCreate | null | undefined> {
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

    const step = steps?.find((step) => step.id === nodeId ?? '')
    const block = searchBlocks(step != null ? [step] : [], handleId ?? '')
    const connectFromSocialNode = nodeId === 'SocialPreview'
    const connectFromStepNode = step != null && step.id === block?.id
    const connectFromActionNode = block != null
    if (connectFromSocialNode) {
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
    } else if (connectFromStepNode) {
      await stepBlockNextBlockUpdate({
        variables: {
          id: step.id,
          journeyId: journey.id,
          input: {
            nextBlockId: newStepId
          }
        },
        optimisticResponse: {
          stepBlockUpdate: {
            id: step.id,
            __typename: 'StepBlock',
            nextBlockId: newStepId
          }
        }
      })
    } else if (connectFromActionNode) {
      await navigateToBlockActionUpdate(block, newStepId)
    }

    return data
  }
  return createNodeAndConnect
}
