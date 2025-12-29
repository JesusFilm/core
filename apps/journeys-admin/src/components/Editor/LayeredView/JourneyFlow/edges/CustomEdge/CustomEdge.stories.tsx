import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentPropsWithoutRef } from 'react'
import { Background, Node, Position, ReactFlow } from 'reactflow'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { defaultEdgeProps } from '../../libs/transformSteps/transformSteps'

import { CustomEdge } from '.'

const Demo: Meta<typeof CustomEdge> = {
  ...simpleComponentConfig,
  component: CustomEdge,
  title: 'Journeys-Admin/Editor/Slider/JourneyFlow/edges/CustomEdge'
}

const initialNodes: Node[] = [
  {
    id: 'button-1',
    data: { label: 'Button Edge 1' },
    position: { x: 0, y: 100 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    style: {
      opacity: 0
    }
  },
  {
    id: 'button-2',
    data: { label: 'Button Edge 2' },
    position: { x: 300, y: 100 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    style: {
      opacity: 0
    }
  }
]
const initialEdges = {
  id: 'button-1->button-2',
  source: 'button-1',
  target: 'button-2',
  ...defaultEdgeProps
}
const defaultFlowProps = {
  nodes: initialNodes,
  nodeTypes: {},
  edges: [initialEdges],
  edgeTypes: { Custom: CustomEdge },
  onConnectStart: () => undefined,
  onConnectEnd: () => undefined,
  fitView: true,
  proOptions: { hideAttribution: true }
}

const Template: StoryObj<ComponentPropsWithoutRef<typeof CustomEdge>> = {
  render: (args) => (
    <MockedProvider>
      <EditorProvider>
        <Box sx={{ height: 400, width: 400 }}>
          <ReactFlow {...args}>
            <Background color="#aaa" gap={16} />
          </ReactFlow>
        </Box>
      </EditorProvider>
    </MockedProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    ...defaultFlowProps
  }
}

export default Demo
