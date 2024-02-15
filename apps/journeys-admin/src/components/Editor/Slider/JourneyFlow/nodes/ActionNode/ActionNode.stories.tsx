import { Meta, StoryObj } from '@storybook/react'
import { ReactElement } from 'react'
import { ReactFlowProvider } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block/TreeBlock'

import { BlockFields_StepBlock as StepBlock } from '../../../../../../../__generated__/BlockFields'
import { journeysAdminConfig } from '../../../../../../libs/storybook'

import { ActionNode } from '.'

const ActionNodeStory: Meta<typeof ActionNode> = {
  ...journeysAdminConfig,
  component: ActionNode,
  title: 'Journeys-Admin/JourneyFlow/ActionNode'
}

const stepBlock: TreeBlock<StepBlock> = {
  id: 'step2.id',
  __typename: 'StepBlock',
  parentBlockId: null,
  parentOrder: 0,
  locked: false,
  nextBlockId: 'step3.id',
  children: []
}

const ActionNodeComponent = (): ReactElement => {
  return (
    <ReactFlowProvider>
      <ActionNode
        title="ActionNode title that is really long to test the line wrapping"
        block={stepBlock}
        step={stepBlock}
      />
    </ReactFlowProvider>
  )
}

const Template: StoryObj<typeof ActionNode> = {
  render: () => <ActionNodeComponent />
}

export const Default = { ...Template }

export const Selected: StoryObj<typeof ActionNode> = {
  render: () => {
    return (
      <ReactFlowProvider>
        <ActionNode
          title="Selected"
          block={stepBlock}
          step={stepBlock}
          selected
        />
      </ReactFlowProvider>
    )
  }
}

export const Empty: StoryObj<typeof ActionNode> = {
  render: () => {
    return (
      <ReactFlowProvider>
        <ActionNode title="" block={stepBlock} step={stepBlock} />
      </ReactFlowProvider>
    )
  }
}
export default ActionNodeStory
