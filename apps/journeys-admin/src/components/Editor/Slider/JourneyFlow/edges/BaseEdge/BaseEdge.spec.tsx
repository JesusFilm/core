import { MockedProvider } from '@apollo/client/testing'
import Typography from '@mui/material/Typography'
import { fireEvent, render, screen } from '@testing-library/react'
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
          <BaseEdge
            id="id"
            style={{}}
            edgePath="M-230.5,38 C-145.75,38 -145.75,48 -61,48"
          >
            <Typography>Children</Typography>
          </BaseEdge>
        </MockedProvider>
      </ReactFlowProvider>
    )
    expect(screen.getByText('Children')).toBeInTheDocument()
    expect(screen.getByTestId('BaseEdge-id').firstChild).toHaveClass(
      'react-flow__edge-path'
    )
    expect(screen.getByTestId('BaseEdge-id').children[1]).toHaveClass(
      'react-flow__edge-interaction'
    )
    // fireEvent.mouseOver(screen.getByTestId('BaseEdge-id'))
    expect(screen.getByTestId('BaseEdge-id').firstChild).toHaveStyle(
      'stroke-width: 2; stroke: #7b1fa21A; opacity: 1;'
    )
  })

  it('should change style on hover', () => {
    render(
      <ReactFlowProvider>
        <MockedProvider>
          <BaseEdge
            id="id"
            style={{}}
            edgePath="M-230.5,38 C-145.75,38 -145.75,48 -61,48"
          >
            <Typography>Children</Typography>
          </BaseEdge>
        </MockedProvider>
      </ReactFlowProvider>
    )
    expect(screen.getByTestId('BaseEdge-id').firstChild).toHaveStyle(
      'stroke-width: 2; stroke: #7b1fa21A; opacity: 1;'
    )
    fireEvent.mouseOver(screen.getByTestId('BaseEdge-id'))
    expect(screen.getByTestId('BaseEdge-id').firstChild).toHaveStyle(
      'stroke-width: 2; stroke: #1976d2; opacity: 0.5;'
    )
    fireEvent.mouseLeave(screen.getByTestId('BaseEdge-id'))
    expect(screen.getByTestId('BaseEdge-id').firstChild).toHaveStyle(
      'stroke-width: 2; stroke: #7b1fa21A; opacity: 1;'
    )
  })

  // it('should change style on click', () => {
  //   render(
  //     <ReactFlowProvider>
  //       <MockedProvider>
  //         <BaseEdge
  //           id="id"
  //           style={{}}
  //           edgePath="M-230.5,38 C-145.75,38 -145.75,48 -61,48"
  //         >
  //           <Typography>Children</Typography>
  //         </BaseEdge>
  //       </MockedProvider>
  //     </ReactFlowProvider>
  //   )
  //   expect(screen.getByTestId('BaseEdge-id').firstChild).toHaveStyle(
  //     'stroke-width: 2; stroke: #7b1fa21A; opacity: 1;'
  //   )
  //   fireEvent.click(screen.getByTestId('BaseEdge-id'))
  //   expect(screen.getByTestId('BaseEdge-id').firstChild).toHaveStyle(
  //     'stroke-width: 2; stroke: #7b1fa21A; opacity: 1;'
  //   )
  // })
})
