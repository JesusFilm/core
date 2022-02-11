import { useEditor, TreeBlock } from '@core/journeys/ui'
import { gql, useMutation } from '@apollo/client'
import { ReactElement } from 'react'
import { CardPreview } from '../../../../../../../CardPreview'
import {
  GetJourney_journey_blocks_StepBlock as StepBlock,
  GetJourney_journey_blocks_ButtonBlock as ButtonBlock
} from '../../../../../../../../../__generated__/GetJourney'
import { NavigateToStepActionUpdate } from '../../../../../../../../../__generated__/NavigateToStepActionUpdate'
import { useJourney } from '../../../../../../../../libs/context'

export const NAVIGATE_TO_STEP_ACTION_UPDATE = gql`
  mutation NavigateToStepActionUpdate(
    $id: ID!
    $journeyId: ID!
    $input: NavigateToBlockActionInput!
  ) {
    blockUpdateNavigateToBlockAction(
      id: $id
      journeyId: $journeyId
      input: $input
    ) {
      id
      ... on ButtonBlock {
        action {
          ... on NavigateToBlockAction {
            blockId
          }
        }
      }
    }
  }
`

export function NavigateStep(): ReactElement {
  const { state } = useEditor()
  const journey = useJourney()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<ButtonBlock>
    | undefined

  const [navigateToStepActionUpdate] = useMutation<NavigateToStepActionUpdate>(
    NAVIGATE_TO_STEP_ACTION_UPDATE
  )

  const currentActionStep =
    state.steps.find(
      ({ id }) =>
        selectedBlock?.action?.__typename === 'NavigateToBlockAction' &&
        id === selectedBlock?.action?.blockId
    ) ?? undefined

  async function handleSelectStep(step: TreeBlock<StepBlock>): Promise<void> {
    if (selectedBlock != null) {
      await navigateToStepActionUpdate({
        variables: {
          id: selectedBlock.id,
          journeyId: journey.id,
          input: { blockId: step.id }
        }
        // also cache issues, kinda
        // optimisticResponse: {
        //   blockUpdateNavigateToBlockAction: {
        //     id: selectedBlock.id,
        //     __typename: 'ButtonBlock',
        //     action: {
        //       __typename: 'NavigateToBlockAction',
        //       blockId: step.id
        //     }
        //   }
        // }
      })
    }
  }

  return (
    <CardPreview
      selected={currentActionStep}
      steps={state.steps}
      onSelect={handleSelectStep}
    />
  )
}
