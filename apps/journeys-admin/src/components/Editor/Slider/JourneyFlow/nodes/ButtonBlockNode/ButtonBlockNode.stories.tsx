import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'
import { Background, ReactFlow } from 'reactflow'
import 'reactflow/dist/style.css'

import { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../__generated__/BlockFields'
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'
import { simpleComponentConfig } from '../../../../../../libs/storybook'

import { ButtonBlockNode } from '.'

const ButtonBlockNodeStory: Meta<typeof ButtonBlockNode> = {
  ...simpleComponentConfig,
  component: ButtonBlockNode,
  title: 'Journeys-Admin/Editor/Slider/JourneyFlow/nodes/ButtonBlockNode'
}

const block: TreeBlock<ButtonBlock> = {
  __typename: 'ButtonBlock',
  id: 'ButtonBlock.id',
  parentBlockId: 'CardBlock.id',
  parentOrder: 0,
  label: 'Click me',
  buttonVariant: ButtonVariant.contained,
  buttonColor: ButtonColor.primary,
  size: ButtonSize.medium,
  startIconId: null,
  endIconId: null,
  action: null,
  children: []
}

const step: TreeBlock<StepBlock> = {
  __typename: 'StepBlock',
  id: 'StepBlock.id',
  locked: false,
  nextBlockId: null,
  parentBlockId: null,
  parentOrder: 0,
  children: [
    {
      __typename: 'CardBlock',
      id: 'CardBlock.id',
      parentBlockId: 'StepBlock.id',
      backgroundColor: null,
      coverBlockId: null,
      fullscreen: false,
      parentOrder: 0,
      themeMode: ThemeMode.dark,
      themeName: ThemeName.base,
      children: [block]
    }
  ]
}

const Template: StoryObj<typeof ButtonBlockNode> = {
  render: (args) => {
    return (
      <MockedProvider>
        <Box sx={{ height: 200, width: 400 }}>
          <ReactFlow {...args}>
            <Background color="#aaa" gap={16} />
          </ReactFlow>
        </Box>
      </MockedProvider>
    )
  }
}

const defaultFlowProps = {
  edges: [],
  edgeTypes: {},
  onConnectStart: () => undefined,
  onConnectEnd: () => undefined,
  fitView: true,
  proOptions: { hideAttribution: true }
}

export const Default = {
  ...Template,
  args: {
    ...defaultFlowProps,
    nodes: [
      {
        id: block.id,
        data: {
          ...block,
          step
        },
        type: block.__typename,
        position: {
          x: 0,
          y: 0
        },
        selectable: false
      }
    ],
    nodeTypes: {
      ButtonBlock: ButtonBlockNode
    }
  }
}

export default ButtonBlockNodeStory
