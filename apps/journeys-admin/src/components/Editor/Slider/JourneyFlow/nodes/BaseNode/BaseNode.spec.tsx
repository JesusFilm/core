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
      <ReactFlowProvider>
        <MockedProvider>
          <BaseNode />
        </MockedProvider>
      </ReactFlowProvider>
    )

    expect(screen.getByTestId('BaseNode')).toBeInTheDocument()
  })

  it('should render target handle', () => {
    render(
      <ReactFlowProvider>
        <MockedProvider>
          <BaseNode targetHandle="show" />
        </MockedProvider>
      </ReactFlowProvider>
    )

    expect(screen.getByTestId('BaseNodeLeftHandle-show')).toBeInTheDocument()
  })

  it('should render disabled target handle', () => {
    render(
      <ReactFlowProvider>
        <MockedProvider>
          <BaseNode targetHandle="disabled" />
        </MockedProvider>
      </ReactFlowProvider>
    )

    expect(
      screen.getByTestId('BaseNodeLeftHandle-disabled')
    ).toBeInTheDocument()
  })

  it('should render source handle', async () => {
    render(
      <ReactFlowProvider>
        <MockedProvider>
          <BaseNode sourceHandle="show" />
        </MockedProvider>
      </ReactFlowProvider>
    )

    expect(screen.getByTestId('BaseNodeRightHandle-show')).toBeInTheDocument()
  })

  it('should render disabled source handle', () => {
    render(
      <ReactFlowProvider>
        <MockedProvider>
          <BaseNode sourceHandle="disabled" />
        </MockedProvider>
      </ReactFlowProvider>
    )

    expect(
      screen.getByTestId('BaseNodeRightHandle-disabled')
    ).toBeInTheDocument()
  })

  it('should render arrow icon', () => {
    render(
      <ReactFlowProvider>
        <MockedProvider>
          <BaseNode sourceHandle="show" />
        </MockedProvider>
      </ReactFlowProvider>
    )

    expect(
      screen.getByTestId('BaseNodeConnectionArrowIcon')
    ).toBeInTheDocument()
  })
})
