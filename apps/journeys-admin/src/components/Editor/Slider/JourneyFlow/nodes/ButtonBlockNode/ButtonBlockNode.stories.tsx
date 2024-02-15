import { Meta, StoryObj } from '@storybook/react'
import { ReactElement } from 'react'
import { ReactFlowProvider } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block/TreeBlock'

import { BlockFields_StepBlock as StepBlock } from '../../../../../../../__generated__/BlockFields'
import { journeysAdminConfig } from '../../../../../../libs/storybook'

import { ButtonBlockNode, ButtonBlockNodeData } from '.'

const ButtonBlockNodeStory: Meta<typeof ButtonBlockNode> = {
  ...journeysAdminConfig,
  component: ButtonBlockNode,
  title: 'Journeys-Admin/JourneyFlow/ButtonBlockNode'
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

const buttonBlockNodeData: ButtonBlockNodeData = {
  step: stepBlock,
  __typename: 'ButtonBlock',
  id: 'ButtonBlockId',
  parentBlockId: null,
  parentOrder: null,
  label: 'label',
  buttonVariant: null,
  buttonColor: null,
  size: null,
  startIconId: 'starticonid',
  endIconId: 'endiconid',
  action: null,
  children: []
}

const ButtonBlockNodeComponent = (): ReactElement => {
  return (
    <ReactFlowProvider>
      <ButtonBlockNode
        data={buttonBlockNodeData}
        id={''}
        selected={false}
        type={''}
        zIndex={0}
        isConnectable={false}
        xPos={0}
        yPos={0}
        dragging={false}
      />
    </ReactFlowProvider>
  )
}

const Template: StoryObj<typeof ButtonBlockNode> = {
  render: () => <ButtonBlockNodeComponent />
}

export const Default = { ...Template }

export default ButtonBlockNodeStory
