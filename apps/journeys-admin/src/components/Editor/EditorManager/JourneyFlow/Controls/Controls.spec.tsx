import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ReactFlowProvider } from 'reactflow'

import { Controls } from '.'

describe('Controls', () => {
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

  it('should display tooltip on hover', async () => {
    render(
      <MockedProvider>
        <ReactFlowProvider>
          <Controls handleReset={jest.fn()} />
        </ReactFlowProvider>
      </MockedProvider>
    )

    fireEvent.mouseOver(screen.getByTestId('Plus1Icon'))
    await waitFor(() =>
      expect(
        screen.getByRole('tooltip', { name: 'Zoom in' })
      ).toBeInTheDocument()
    )

    fireEvent.mouseOver(screen.getByTestId('DashIcon'))
    await waitFor(() =>
      expect(
        screen.getByRole('tooltip', { name: 'Zoom out' })
      ).toBeInTheDocument()
    )

    fireEvent.mouseOver(screen.getByTestId('Maximise2Icon'))
    await waitFor(() =>
      expect(
        screen.getByRole('tooltip', { name: 'Recenter' })
      ).toBeInTheDocument()
    )

    fireEvent.mouseOver(screen.getByTestId('ArrowRefresh6Icon'))
    await waitFor(() =>
      expect(
        screen.getByRole('tooltip', { name: 'Reset layout' })
      ).toBeInTheDocument()
    )
  })
})
