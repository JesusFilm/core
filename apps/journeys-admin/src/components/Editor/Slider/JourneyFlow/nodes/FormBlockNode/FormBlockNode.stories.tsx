import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'
import { Background, ReactFlow } from 'reactflow'
import 'reactflow/dist/style.css'

import { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields_FormBlock as FormBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../__generated__/BlockFields'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../../../../../libs/storybook'

import { FormBlockNode } from '.'

const FormBlockNodeStory: Meta<typeof FormBlockNode> = {
  ...journeysAdminConfig,
  component: FormBlockNode,
  title: 'Journeys-Admin/Editor/Slider/JourneyFlow/nodes/FormBlockNode'
}

const block: TreeBlock<FormBlock> = {
  __typename: 'FormBlock',
  id: 'FormBlock.id',
  parentBlockId: 'CardBlock.id',
  parentOrder: 0,
  form: null,
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

const Template: StoryObj<typeof FormBlockNode> = {
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
      FormBlock: FormBlockNode
    },
  }
}

export default FormBlockNodeStory
