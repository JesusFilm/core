import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import type { Meta, StoryObj } from '@storybook/nextjs'
import type { ComponentPropsWithoutRef } from 'react'
import { Background, ReactFlow } from 'reactflow'

import {
  EditorProvider,
  type EditorState
} from '@core/journeys/ui/EditorProvider'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { ReferrerNode } from '.'

const Demo: Meta<typeof ReferrerNode> = {
  ...simpleComponentConfig,
  component: ReferrerNode,
  title: 'Journeys-Admin/Editor/Slider/JourneyFlow/nodes/ReferrerNode'
}

const Template: StoryObj<
  ComponentPropsWithoutRef<typeof ReferrerNode> & { initialState: EditorState }
> = {
  render: ({ initialState, ...args }) => {
    return (
      <MockedProvider>
        <EditorProvider initialState={initialState}>
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

const defaultFlowProps = {
  edges: [],
  edgeTypes: {},
  onConnectStart: () => undefined,
  onConnectEnd: () => undefined,
  fitView: true,
  proOptions: { hideAttribution: true },
  nodeTypes: {
    Referrer: ReferrerNode
  }
}

export const Default = {
  ...Template,
  args: {
    ...defaultFlowProps,
    nodes: [
      {
        id: 'Direct / None',
        type: 'Referrer',
        data: {
          __typename: 'PlausibleStatsResponse',
          property: 'Direct / None',
          visitors: 10
        },
        position: { x: 100, y: 0 }
      }
    ],
    initialState: {}
  }
}

export const Other = {
  ...Template,
  args: {
    ...defaultFlowProps,
    nodes: [
      {
        id: 'other sources',
        type: 'Referrer',
        position: { x: 100, y: 0 },
        data: {
          visitors: 10,
          referrers: [
            {
              __typename: 'PlausibleStatsResponse',
              property: 'Facebook',
              visitors: 5
            },
            {
              __typename: 'PlausibleStatsResponse',
              property: 'Google',
              visitors: 5
            }
          ]
        }
      }
    ],
    initialState: {}
  }
}

export default Demo
