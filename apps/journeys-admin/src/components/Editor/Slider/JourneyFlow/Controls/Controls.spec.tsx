import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen } from '@testing-library/react'
import { ReactFlowProvider } from 'reactflow'

import { Controls } from '.'

describe('Controls', () => {
  it('should render', () => {
    render(
      <MockedProvider>
        <ReactFlowProvider>
          <Controls handleReset={jest.fn()} />
        </ReactFlowProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('Plus1Icon')).toBeInTheDocument()
    expect(screen.getByTestId('DashIcon')).toBeInTheDocument()
    expect(screen.getByTestId('Maximise2Icon')).toBeInTheDocument()
    expect(screen.getByTestId('ArrowRefresh6Icon')).toBeInTheDocument()
  })

  it('should call reset function on click', () => {
    const handleReset = jest.fn()
    render(
      <MockedProvider>
        <ReactFlowProvider>
          <Controls handleReset={handleReset} />
        </ReactFlowProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByTestId('ArrowRefresh6Icon'))
    expect(handleReset).toHaveBeenCalled()
  })
})
