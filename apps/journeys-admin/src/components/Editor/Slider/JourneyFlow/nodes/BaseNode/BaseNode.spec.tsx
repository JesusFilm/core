import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import { ReactFlowProvider } from 'reactflow'

import { mockReactFlow } from '../../../../../../../test/mockReactFlow'

import { BaseNode, HandleVariant } from './BaseNode'

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
          <BaseNode targetHandle={HandleVariant.Shown} />
        </MockedProvider>
      </ReactFlowProvider>
    )

    const handle = screen.getByTestId('BaseNodeLeftHandle-shown')

    expect(handle).toBeInTheDocument()
    expect(handle).toBeVisible()
  })

  it('should render disabled target handle', () => {
    render(
      <ReactFlowProvider>
        <MockedProvider>
          <BaseNode targetHandle={HandleVariant.Disabled} />
        </MockedProvider>
      </ReactFlowProvider>
    )

    const handle = screen.getByTestId('BaseNodeLeftHandle-disabled')

    expect(handle).toBeInTheDocument()
    expect(handle).toBeVisible()
  })

  it('should render hiddent target handle', () => {
    render(
      <ReactFlowProvider>
        <MockedProvider>
          <BaseNode targetHandle={HandleVariant.Hidden} />
        </MockedProvider>
      </ReactFlowProvider>
    )

    const handle = screen.getByTestId('BaseNodeLeftHandle-hidden')

    expect(handle).toBeInTheDocument()
    expect(handle).not.toBeVisible()
  })

  it('should render source handle', async () => {
    render(
      <ReactFlowProvider>
        <MockedProvider>
          <BaseNode sourceHandle={HandleVariant.Shown} />
        </MockedProvider>
      </ReactFlowProvider>
    )

    const handle = screen.getByTestId('BaseNodeRightHandle-shown')

    expect(handle).toBeInTheDocument()
    expect(handle).toBeVisible()
  })

  it('should render disabled source handle', () => {
    render(
      <ReactFlowProvider>
        <MockedProvider>
          <BaseNode sourceHandle={HandleVariant.Disabled} />
        </MockedProvider>
      </ReactFlowProvider>
    )

    const handle = screen.getByTestId('BaseNodeRightHandle-disabled')

    expect(handle).toBeInTheDocument()
    expect(handle).toBeVisible()
  })

  it('should render hidden source handle', () => {
    render(
      <ReactFlowProvider>
        <MockedProvider>
          <BaseNode sourceHandle={HandleVariant.Hidden} />
        </MockedProvider>
      </ReactFlowProvider>
    )

    const handle = screen.getByTestId('BaseNodeRightHandle-hidden')

    expect(handle).toBeInTheDocument()
    expect(handle).not.toBeVisible()
  })

  it('should render arrow icon', () => {
    render(
      <ReactFlowProvider>
        <MockedProvider>
          <BaseNode sourceHandle={HandleVariant.Shown} />
        </MockedProvider>
      </ReactFlowProvider>
    )

    expect(
      screen.getByTestId('BaseNodeConnectionArrowIcon')
    ).toBeInTheDocument()
  })
})
