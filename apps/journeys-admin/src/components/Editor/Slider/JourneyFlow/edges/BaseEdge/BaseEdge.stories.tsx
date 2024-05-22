import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentPropsWithoutRef } from 'react'
import {
  Background,
  Node,
  ReactFlow,
  ReactFlowProvider,
  useNodesState
} from 'reactflow'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { journeysAdminConfig } from '../../../../../../libs/storybook'
import { defaultEdgeProps } from '../../libs/transformSteps/transformSteps'
import { CustomEdge } from '../CustomEdge'

import { BaseEdge } from '.'

const Demo: Meta<typeof BaseEdge> = {
  ...journeysAdminConfig,
  component: BaseEdge,
  title: 'Journeys-Admin/Editor/Slider/JourneyFlow/edges/BaseEdge'
}

const initialNodes: Node[] = [
  {
    id: 'button-1',
    data: { label: 'Button Edge 1' },
    position: { x: 125, y: 0 }
  },
  {
    id: 'button-2',
    data: { label: 'Button Edge 2' },
    position: { x: 125, y: 200 }
  }
]
const initialEdges = {
  id: 'button-1->button-2',
  source: 'button-2',
  target: 'button-1',
  type: 'Base'
}

const defaultFlowProps = {
  nodes: initialNodes,
  nodeTypes: {},
  edges: [initialEdges],
  edgeTypes: { Base: BaseEdge },
  onConnectStart: () => undefined,
  onConnectEnd: () => undefined,
  fitView: true,
  proOptions: { hideAttribution: true }
}

const Template: StoryObj<ComponentPropsWithoutRef<typeof BaseEdge>> = {
  render: (args) => {
    return (
      <MockedProvider>
        <EditorProvider>
          <Box sx={{ height: 400, width: 600 }}>
            <ReactFlow {...args}>
              <Background color="#aaa" gap={16} />
            </ReactFlow>
          </Box>
        </EditorProvider>
      </MockedProvider>
    )
  }
}

export const Default = {
  ...Template,
  args: {
    ...defaultFlowProps
  }
}

export default Demo
