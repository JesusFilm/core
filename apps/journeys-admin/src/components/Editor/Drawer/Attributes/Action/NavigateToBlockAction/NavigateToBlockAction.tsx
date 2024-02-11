import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import {
  GetJourney_journey_blocks_ButtonBlock as ButtonBlock,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../../../../../__generated__/GetJourney'
import { useNavigateToBlockActionUpdateMutation } from '../../../../../../libs/useNavigateToBlockActionUpdateMutation'
import { CardPreview, OnSelectProps } from '../../../../../CardPreview'

export function NavigateToBlockAction(): ReactElement {
  const {
    state: { steps, selectedBlock }
  } = useEditor()
  const { journey } = useJourney()
  const currentBlock = selectedBlock as
    | TreeBlock<ButtonBlock>
    | TreeBlock<VideoBlock>
    | undefined

  const [navigateToBlockActionUpdate] = useNavigateToBlockActionUpdateMutation()

  const currentActionStep =
    steps?.find(
      ({ id }) =>
        currentBlock?.action?.__typename === 'NavigateToBlockAction' &&
        id === currentBlock?.action?.blockId
    ) ?? undefined

  async function handleSelectStep({ step }: OnSelectProps): Promise<void> {
    if (currentBlock != null && journey != null && step != null) {
      await navigateToBlockActionUpdate(currentBlock, step.id)
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
