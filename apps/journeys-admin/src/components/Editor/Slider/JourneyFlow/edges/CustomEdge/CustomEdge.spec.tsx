import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { ReactFlowProvider } from 'reactflow'

import { CustomEdge } from './CustomEdge'

describe('CustomEdge', () => {
  beforeEach(() => {
    mockReactFlow()
  })

  // source/target x and y are numbers
  // source/target positions are Position enum
  // could maybe render edge without creating nodes ? and just using source/target
  it('should render customEdge', () => {
    render(
      <ReactFlowProvider>
        <MockedProvider>
          <CustomEdge
            id="id"
            style={{}}
            edgePath="M-230.5,38 C-145.75,38 -145.75,48 -61,48"
          >
            <Typography>Children</Typography>
          </CustomEdge>
        </MockedProvider>
      </ReactFlowProvider>
    )
  })
})
