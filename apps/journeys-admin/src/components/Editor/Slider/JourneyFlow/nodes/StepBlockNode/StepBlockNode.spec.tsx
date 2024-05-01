import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import { ReactFlowProvider } from 'reactflow'

import { mockReactFlow } from '../../../../../../../test/mockReactFlow'

import { StepBlockNode } from './StepBlockNode'

describe('StepBlockNode', () => {
  beforeEach(() => {
    mockReactFlow()
  })

  it('should render with default properties', () => {
    render(
      <MockedProvider>
        <StepBlockNode
          data={undefined}
          zIndex={0}
          id="123"
          type=""
          selected={false}
          isConnectable={false}
          xPos={0}
          yPos={0}
          dragging={false}
        />
      </MockedProvider>
    )

    expect(screen.getByTestId('StepBlockNode')).toBeInTheDocument()
  })

  it('should render target handles', () => {
    render(
      <ReactFlowProvider>
        <MockedProvider>
          <StepBlockNode
            isConnectable
            data={undefined}
            zIndex={0}
            id=""
            type=""
            selected={false}
            xPos={0}
            yPos={0}
            dragging={false}
          />
        </MockedProvider>
      </ReactFlowProvider>
    )

    expect(screen.getByTestId('BaseNodeTopHandle')).toBeInTheDocument()
  })

  it('should render source handles', async () => {
    render(
      <ReactFlowProvider>
        <MockedProvider>
          <StepBlockNode isSourceConnectable />
        </MockedProvider>
      </ReactFlowProvider>
    )

    expect(screen.getByTestId('BaseNodeBottomHandle')).toBeInTheDocument()
  })

  it('should render arrow icon', () => {
    render(
      <ReactFlowProvider>
        <MockedProvider>
          <StepBlockNode
            data={undefined}
            zIndex={0}
            id=""
            type=""
            selected={false}
            isConnectable={false}
            xPos={0}
            yPos={0}
            dragging={false}
          />
        </MockedProvider>
      </ReactFlowProvider>
    )

    expect(screen.getByTestId('BaseNodeDownwardArrowIcon')).toBeInTheDocument()
  })
})
