import { render, screen } from '@testing-library/react'
import { ReactElement } from 'react'
import { Position, ReactFlowProvider } from 'reactflow'

import { mockReactFlow } from '../../../../../../../test/mockReactFlow'

import { StartEdge } from '.'

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

describe('StartEdge', () => {
  beforeEach(() => {
    mockReactFlow()
  })

  it('should render edge with label', () => {
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

    render(
      <ReactFlowProvider>
        <StartEdge {...defaultEdgeProps} />
      </ReactFlowProvider>
    )

    expect(
      screen.getByTestId('BaseEdge-button1.id->button2.id')
    ).toBeInTheDocument()
    expect(screen.getByText('Start')).toBeInTheDocument()
  })
})
