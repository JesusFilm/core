import { MockedProvider } from '@apollo/client/testing'
import Typography from '@mui/material/Typography'
import { fireEvent, render, screen } from '@testing-library/react'
import { ReactFlowProvider } from 'reactflow'

import { EditorProvider, EditorState } from '@core/journeys/ui/EditorProvider'

import { mockReactFlow } from '../../../../../../../test/mockReactFlow'

import { BaseEdge } from './BaseEdge'

describe('BaseEdge', () => {
  beforeEach(() => {
    mockReactFlow()
  })

  it('should render base edge', () => {
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

    expect(screen.getByTestId('BaseEdge-id').firstChild).toHaveStyle(
      'stroke-width: 2; stroke: rgba(123, 31, 162, 0.1);'
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
      'stroke-width: 2; stroke: rgba(123, 31, 162, 0.1);'
    )

    fireEvent.mouseOver(screen.getByTestId('BaseEdge-id'))

    expect(screen.getByTestId('BaseEdge-id').firstChild).toHaveStyle(
      'stroke-width: 2; stroke:rgba(25, 118, 210, 0.5)'
    )

    fireEvent.mouseLeave(screen.getByTestId('BaseEdge-id'))

    expect(screen.getByTestId('BaseEdge-id').firstChild).toHaveStyle(
      'stroke-width: 2; stroke: rgba(123, 31, 162, 0.1);'
    )
  })

  it('should disable hover in analytics mode', () => {
    const initialState = {
      showAnalytics: true
    } as unknown as EditorState
    render(
      <ReactFlowProvider>
        <MockedProvider>
          <EditorProvider initialState={initialState}>
            <BaseEdge
              id="id"
              style={{}}
              edgePath="M-230.5,38 C-145.75,38 -145.75,48 -61,48"
            >
              <Typography>Children</Typography>
            </BaseEdge>
          </EditorProvider>
        </MockedProvider>
      </ReactFlowProvider>
    )
    expect(screen.getByTestId('BaseEdge-id').firstChild).toHaveStyle(
      'stroke-width: 2; stroke: rgba(123, 31, 162, 0.1);'
    )
    fireEvent.mouseOver(screen.getByTestId('BaseEdge-id'))
    expect(screen.getByTestId('BaseEdge-id').firstChild).toHaveStyle(
      'stroke-width: 2; stroke: rgba(123, 31, 162, 0.1);'
    )
  })

  it('should show selected edge style', () => {
    render(
      <ReactFlowProvider>
        <MockedProvider>
          <BaseEdge
            id="id"
            style={{}}
            edgePath="M-230.5,38 C-145.75,38 -145.75,48 -61,48"
            isSelected
          >
            <Typography>Children</Typography>
          </BaseEdge>
        </MockedProvider>
      </ReactFlowProvider>
    )

    expect(screen.getByTestId('BaseEdge-id').firstChild).toHaveStyle(
      'stroke-width: 2; stroke: #1976d2;'
    )
  })
})
