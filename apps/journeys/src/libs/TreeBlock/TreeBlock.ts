import { GetJourney_journey_blocks as Block } from '../../../__generated__/GetJourney'
import { TreeBlock as CoreTreeBlock } from '@core/shared/ui'

export type TreeBlock<ChildBlock = Block> = CoreTreeBlock<ChildBlock, Block>
