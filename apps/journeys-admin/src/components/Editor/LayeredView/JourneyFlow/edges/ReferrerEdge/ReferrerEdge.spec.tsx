import { render, screen } from '@testing-library/react'
import { Position, ReactFlowProvider } from 'reactflow'

import { mockReactFlow } from '../../../../../../../test/mockReactFlow'

import { ReferrerEdge } from '.'

describe('ReferrerEdge', () => {
  beforeEach(() => {
    mockReactFlow()
  })

  const defaultEdgeProps = {
    id: 'Facebook->SocialPreview',
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

  it('should render', () => {
    render(
      <ReactFlowProvider>
        <svg>
          <ReferrerEdge {...defaultEdgeProps} />
        </svg>
      </ReactFlowProvider>
    )

    expect(
      screen.getByTestId('BaseEdge-Facebook->SocialPreview')
    ).toBeInTheDocument()
  })
})
