import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'
import { Background, ReactFlow } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields_StepBlock as StepBlock,
  BlockFields_TextResponseBlock as TextResponseBlock
} from '../../../../../../../__generated__/BlockFields'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'
import { simpleComponentConfig } from '../../../../../../libs/storybook'

import { TextResponseBlockNode } from '.'

const TextResponseBlockNodeStory: Meta<typeof TextResponseBlockNode> = {
  ...simpleComponentConfig,
  component: TextResponseBlockNode,
  title: 'Journeys-Admin/Editor/Slider/JourneyFlow/nodes/TextResponseBlockNode'
}

const block: TreeBlock<TextResponseBlock> = {
  __typename: 'TextResponseBlock',
  id: 'TextResponseBlock.id',
  parentBlockId: 'CardBlock.id',
  parentOrder: 0,
  label: 'TextResponseBlock',
  hint: null,
  minRows: null,
  submitLabel: null,
  submitIconId: null,
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

const Template: StoryObj<typeof TextResponseBlockNode> = {
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
          x: 200,
          y: 200
        },
        selectable: false
      }
    ],
    nodeTypes: {
      TextResponseBlock: TextResponseBlockNode
    }
  }
}

export default TextResponseBlockNodeStory
