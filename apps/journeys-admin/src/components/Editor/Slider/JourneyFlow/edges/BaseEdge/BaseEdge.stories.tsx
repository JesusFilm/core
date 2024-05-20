import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Meta, StoryObj } from '@storybook/react'
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

import { BaseEdge } from './BaseEdge'

const Demo: Meta<typeof BaseEdge> = {
  ...journeysAdminConfig,
  component: BaseEdge,
  title: 'Journeys-Admin/Editor/Slider/JourneyFlow/edges/BaseEdge'
}

// const BaseEdge

const initialNodes: Node[] = [
  {
    id: 'button-1',
    type: 'input',
    data: { label: 'Button Edge 1' },
    position: { x: 125, y: 0 }
  },
  {
    id: 'button-2',
    data: { label: 'Button Edge 2' },
    position: { x: 125, y: 200 }
  }
]
const customEdge = {
  id: 'customedgeid',

  // source
  sourceHandle: undefined,
  // target
  ...defaultEdgeProps
}

const defaultFlowProps = {
  nodes: [initialNodes],
  nodeTypes: {},
  edges: [customEdge],
  edgeTypes: { Custom: CustomEdge },
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
    //       <svg>
    //         <BaseEdge
    //           id="id"
    //           style={{}}
    //           edgePath="M230.5,38 C-145.75,38 -145.75,48 -61,48"
    //         >
    //           <Typography>Children</Typography>
    //         </BaseEdge>
    //       </svg>
    //     </MockedProvider>
    //   </ReactFlowProvider>
    // )

    return (
      <MockedProvider>
        <EditorProvider>
          <Box sx={{ height: 400, width: 600 }}>
            <ReactFlow {...defaultFlowProps}>
              {/* <ReactFlow> */}
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
