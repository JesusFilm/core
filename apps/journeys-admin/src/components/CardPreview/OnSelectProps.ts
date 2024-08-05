import { TreeBlock } from '@core/journeys/ui/block'
import { ActiveContent } from '@core/journeys/ui/EditorProvider'

import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../__generated__/GetJourney'

export interface OnSelectProps {
  step?: TreeBlock<StepBlock>
  view?: ActiveContent
}
