import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen } from '@testing-library/react'
import { ReactElement } from 'react'
import { Position, ReactFlowProvider } from 'reactflow'

import { mockReactFlow } from '../../../../../../../test/mockReactFlow'
import { useDeleteEdge } from '../../libs/useDeleteEdge'

import { CustomEdge } from '.'

jest.mock('reactflow', () => {
  const originalModule = jest.requireActual('reactflow')
  return {
    __esModule: true,
    ...originalModule,
    EdgeLabelRenderer: ({ children }): ReactElement => {
      return <>{children}</>
    }
  }
})

jest.mock('../../libs/useDeleteEdge', () => {
  return {
    useDeleteEdge: jest.fn()
  }
})

const mockUseDeleteEdge = useDeleteEdge as jest.MockedFunction<
  typeof useDeleteEdge
>

describe('CustomEdge', () => {
  beforeEach(() => {
    mockReactFlow()
  })

  const defaultEdgeProps = {
    id: 'button1.id->button2.id',
    sourceX: 100,
    sourceY: 200,
    targetX: 100,
    targetY: 300,
    sourcePosition: Position.Left,
    targetPosition: Position.Right,
    source: 'button1.id',
    target: 'button2.id',
    sourceHandleId: null,
    style: {}
  }

  it('should render customEdge', () => {
    render(
      <ReactFlowProvider>
        <MockedProvider>
          <CustomEdge {...defaultEdgeProps} />
        </MockedProvider>
      </ReactFlowProvider>
    )

    expect(
      screen.getByTestId('BaseEdge-button1.id->button2.id')
    ).toBeInTheDocument()
  })

  it('should handle delete edge', () => {
    const deleteEdge = jest.fn()
    mockUseDeleteEdge.mockImplementation(() => deleteEdge)
    render(
      <ReactFlowProvider>
        <MockedProvider>
          <CustomEdge {...defaultEdgeProps} isSelected />
        </MockedProvider>
      </ReactFlowProvider>
    )

    const deleteButton = screen.getByTestId('X3Icon')
    fireEvent.click(deleteButton)
    expect(deleteEdge).toHaveBeenCalled()
  })
})
