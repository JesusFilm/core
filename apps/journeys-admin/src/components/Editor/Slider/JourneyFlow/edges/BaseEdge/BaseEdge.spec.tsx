import { MockedProvider } from '@apollo/client/testing'
import Typography from '@mui/material/Typography'
import { render, screen } from '@testing-library/react'
import { ReactFlowProvider } from 'reactflow'

import { mockReactFlow } from '../../../../../../../test/mockReactFlow'

import { BaseEdge } from './BaseEdge'
// TODO: create test for base edge
// colour for hover?
// Find SVG in the dom

describe('BaseEdge', () => {
  beforeEach(() => {
    mockReactFlow()
  })

  it('should render baseedge', () => {
    render(
      <ReactFlowProvider>
        <MockedProvider>
          <BaseEdge id="baseEdgeId" style={{}} edgePath="...">
            <Typography>Test</Typography>
          </BaseEdge>
        </MockedProvider>
      </ReactFlowProvider>
    )
    expect(screen.getByClassName('BaseEdge')).toBeInTheDocument()
    // screen.getby
  })
})
