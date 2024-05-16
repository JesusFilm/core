import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Meta, StoryObj } from '@storybook/react'
import { Background, ReactFlow, ReactFlowProvider } from 'reactflow'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { journeysAdminConfig } from '../../../../../../libs/storybook'

import { BaseEdge } from './BaseEdge'

const Demo: Meta<typeof BaseEdge> = {
  ...journeysAdminConfig,
  component: BaseEdge,
  title: 'Journeys-Admin/Editor/Slider/JourneyFlow/edges/BaseEdge'
}

// const BaseEdge

const defaultFlowProps = {
  nodes: [],
  nodeTypes: {},
  edges: [],
  edgeTypes: {},
  onConnectStart: () => undefined,
  onConnectEnd: () => undefined,
  fitView: true,
  proOptions: { hideAttribution: true }
}

// source/target x and y are numbers
// source/target positions are Position enum
// could maybe render edge without creating nodes ? and just using source/target

const Template: StoryObj<typeof BaseEdge> = {
  render: () => {
    // return (
    //   <ReactFlowProvider>
    //     <MockedProvider>
    //       <BaseEdge
    //         id="id"
    //         style={{}}
    //         edgePath="M-230.5,38 C-145.75,38 -145.75,48 -61,48"
    //       >
    //         <Typography>Children</Typography>
    //       </BaseEdge>
    //     </MockedProvider>
    //   </ReactFlowProvider>
    // )

    return (
      <MockedProvider>
        <EditorProvider>
          <Box sx={{ height: 400, width: 600 }}>
            <ReactFlow {...defaultFlowProps}>
              <Background color="#aaa" gap={16} />
              {/* <BaseEdge
                id="id"
                style={{}}
                edgePath="M-230.5,38 C-145.75,38 -145.75,48 -61,48"
              >
                <Typography>Children</Typography>
              </BaseEdge> */}
            </ReactFlow>
          </Box>
        </EditorProvider>
      </MockedProvider>
    )
  }
}

export const Default = { ...Template }

export default Demo
