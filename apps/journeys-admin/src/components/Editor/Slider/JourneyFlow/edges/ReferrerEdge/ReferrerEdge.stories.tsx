import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentPropsWithoutRef } from 'react'
// eslint-disable-next-line import/no-named-as-default
import ReactFlow, { Background, Position } from 'reactflow'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { ReferrerEdge } from './ReferrerEdge'

const Demo: Meta<typeof ReferrerEdge> = {
  ...simpleComponentConfig,
  component: ReferrerEdge,
  title: 'Journeys-Admin/Editor/Slider/JourneyFlow/edges/ReferrerEdge'
}

const initialNodes = [
  {
    id: 'Facebook',
    data: {},
    position: { x: 0, y: 100 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    style: {
      opacity: 0
    }
  },
  {
    id: 'SocialPreview',
    data: {},
    position: { x: 300, y: 100 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    style: {
      opacity: 0
    }
  }
]

const initialEdges = [
  {
    id: 'Facebook->SocialPreview',
    source: 'Facebook',
    target: 'SocialPreview',
    type: 'Referrer'
  }
]

const defaultFlowProps = {
  nodes: initialNodes,
  nodeTypes: {},
  edges: [initialEdges],
  edgeTypes: { Referrer: ReferrerEdge },
  onConnectStart: () => undefined,
  onConnectEnd: () => undefined,
  fitView: true,
  proOptions: { hideAttribution: true }
}

const Template: StoryObj<ComponentPropsWithoutRef<typeof ReferrerEdge>> = {
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
  args: defaultFlowProps
}

export default Demo
