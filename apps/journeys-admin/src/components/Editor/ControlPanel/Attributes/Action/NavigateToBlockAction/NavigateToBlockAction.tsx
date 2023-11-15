import { gql, useMutation } from '@apollo/client'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import {
  GetJourney_journey_blocks_ButtonBlock as ButtonBlock,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../../../../../__generated__/GetJourney'
import { NavigateToBlockActionUpdate } from '../../../../../../../__generated__/NavigateToBlockActionUpdate'
import { CardPreview, OnSelectProps } from '../../../../../CardPreview'

export const NAVIGATE_TO_BLOCK_ACTION_UPDATE = gql`
  mutation NavigateToBlockActionUpdate(
    $id: ID!
    $journeyId: ID!
    $input: NavigateToBlockActionInput!
  ) {
    blockUpdateNavigateToBlockAction(
      id: $id
      journeyId: $journeyId
      input: $input
    ) {
      gtmEventName
      blockId
    }
  }
`

export function NavigateToBlockAction(): ReactElement {
  const {
    state: { steps, selectedBlock }
  } = useEditor()
  const { journey } = useJourney()
  const currentBlock = selectedBlock as
    | TreeBlock<ButtonBlock>
    | TreeBlock<VideoBlock>
    | undefined

  const [navigateToBlockActionUpdate] =
    useMutation<NavigateToBlockActionUpdate>(NAVIGATE_TO_BLOCK_ACTION_UPDATE)

  const currentActionStep =
    steps?.find(
      ({ id }) =>
        currentBlock?.action?.__typename === 'NavigateToBlockAction' &&
        id === currentBlock?.action?.blockId
    ) ?? undefined

  async function handleSelectStep({ step }: OnSelectProps): Promise<void> {
    if (currentBlock != null && journey != null && step != null) {
      const { id, __typename: typeName } = currentBlock
      await navigateToBlockActionUpdate({
        variables: {
          id,
          journeyId: journey.id,
          input: { blockId: step.id }
        },
        update(cache, { data }) {
          if (data?.blockUpdateNavigateToBlockAction != null) {
            cache.modify({
              id: cache.identify({
                __typename: typeName,
                id
              }),
              fields: {
                action: () => data.blockUpdateNavigateToBlockAction
              }
            })
          }
        }
      })
    }
  }

  return (
    <CardPreview
      selected={currentActionStep}
      steps={steps}
      onSelect={handleSelectStep}
      testId="NavigationToBlockAction"
    />
  )
}
