import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'
import { Background, Node, Position, ReactFlow } from '@xyflow/react'
import { ComponentPropsWithoutRef } from 'react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { defaultEdgeProps } from '../../libs/transformSteps/transformSteps'

import { StartEdge } from '.'

const meta = {
  component: StartEdge,
  title: 'Journeys-Admin/Editor/Slider/JourneyFlow/edges/StartEdge'
} satisfies Meta<typeof StartEdge>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => {
    const nodes: Node[] = [
      {
        id: 'button1.id',
        position: { x: 0, y: 0 },
        data: { label: 'Button 1' },
        type: 'input'
      },
      {
        id: 'button2.id',
        position: { x: 0, y: 100 },
        data: { label: 'Button 2' },
        targetPosition: Position.Top,
        sourcePosition: Position.Bottom
      }
    ]

    const edges = [
      {
        id: 'button1.id->button2.id',
        source: 'button1.id',
        target: 'button2.id',
        type: 'start'
      }
    ]

    const edgeTypes = {
      start: StartEdge
    }

    return (
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
  },
  args: {
    nodes: [
      {
        id: 'button1.id',
        position: { x: 0, y: 0 },
        data: { label: 'Button 1' },
        type: 'input'
      },
      {
        id: 'button2.id',
        position: { x: 0, y: 100 },
        data: { label: 'Button 2' },
        targetPosition: Position.Top,
        sourcePosition: Position.Bottom
      }
    ],
    edges: [
      {
        id: 'button1.id->button2.id',
        source: 'button1.id',
        target: 'button2.id',
        type: 'start'
      }
    ],
    edgeTypes: {
      start: StartEdge
    }
  }
}
