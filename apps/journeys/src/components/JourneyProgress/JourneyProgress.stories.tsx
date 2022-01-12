import { Meta } from '@storybook/react'
import { ReactElement } from 'react'
import { TreeBlock } from '@core/journeys/ui'
import { journeysConfig, simpleComponentConfig } from '../../libs/storybook'
import { activeBlockVar, treeBlocksVar } from '../../libs/client/cache/blocks'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../__generated__/GetJourney'
import { JourneyProgress } from '.'

const Demo = {
  ...journeysConfig,
  ...simpleComponentConfig,
  component: JourneyProgress,
  title: 'Journeys/JourneyProgress'
}

const blocks: TreeBlock[] = [
  {
    __typename: 'StepBlock',
    id: 'Step1',
    parentBlockId: null,
    locked: true,
    nextBlockId: 'Step2',
    children: []
  },
  {
    __typename: 'StepBlock',
    id: 'Step2',
    parentBlockId: null,
    locked: true,
    nextBlockId: 'Step3',
    children: []
  },
  {
    __typename: 'StepBlock',
    id: 'Step3',
    parentBlockId: null,
    locked: true,
    nextBlockId: 'Step4',
    children: []
  },
  {
    __typename: 'StepBlock',
    id: 'Step4',
    parentBlockId: null,
    locked: true,
    nextBlockId: null,
    children: []
  }
]

export const Start = (): ReactElement => {
  const activeBlock: TreeBlock<StepBlock> = {
    __typename: 'StepBlock',
    id: 'Step1',
    parentBlockId: null,
    locked: true,
    nextBlockId: 'Step2',
    children: []
  }
  activeBlockVar(activeBlock)
  treeBlocksVar(blocks)
  return <JourneyProgress />
}

export const Halfway = (): ReactElement => {
  const activeBlock: TreeBlock<StepBlock> = {
    __typename: 'StepBlock',
    id: 'Step2',
    parentBlockId: null,
    locked: true,
    nextBlockId: 'Step3',
    children: []
  }
  activeBlockVar(activeBlock)
  treeBlocksVar(blocks)
  return <JourneyProgress />
}

export const End = (): ReactElement => {
  const activeBlock: TreeBlock<StepBlock> = {
    __typename: 'StepBlock',
    id: 'Step4',
    parentBlockId: null,
    locked: true,
    nextBlockId: null,
    children: []
  }
  activeBlockVar(activeBlock)
  treeBlocksVar(blocks)
  return <JourneyProgress />
}

export default Demo as Meta
