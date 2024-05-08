import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import { ReactFlowProvider } from 'reactflow'

import { mockReactFlow } from '../../../../../../../test/mockReactFlow'

import { BaseNode } from './BaseNode'

describe('BaseNode', () => {
  beforeEach(() => {
    mockReactFlow()
  })

  it('should render with default properties', () => {
    render(
      <MockedProvider>
        <BaseNode />
      </MockedProvider>
    )

    expect(screen.getByTestId('BaseNode')).toBeInTheDocument()
  })

  it('should render target handles', () => {
    render(
      <ReactFlowProvider>
        <MockedProvider>
          <BaseNode isTargetConnectable />
        </MockedProvider>
      </ReactFlowProvider>
    )

    expect(screen.getByTestId('BaseNodeTopHandle')).toBeInTheDocument()
  })

  it('should render source handles', async () => {
    render(
      <ReactFlowProvider>
        <MockedProvider>
          <BaseNode isSourceConnectable />
        </MockedProvider>
      </ReactFlowProvider>
    )

    expect(screen.getByTestId('BaseNodeBottomHandle')).toBeInTheDocument()
  })

  it('should render arrow icon', () => {
    render(
      <ReactFlowProvider>
        <MockedProvider>
          <BaseNode isSourceConnectable />
        </MockedProvider>
      </ReactFlowProvider>
    )

    expect(screen.getByTestId('BaseNodeDownwardArrowIcon')).toBeInTheDocument()
  })
})
