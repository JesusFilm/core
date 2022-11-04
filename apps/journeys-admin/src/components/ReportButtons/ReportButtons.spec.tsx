import { render, fireEvent,waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { NextRouter, useRouter } from 'next/router'
import { ReportButtons } from './ReportButtons'


jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('ReportButtons', () => {
  it('should have Journeys button with push to journeys', async () => {
    const push = jest.fn()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)
    const { getByRole } = render(
      <MockedProvider>
        <FlagsProvider>
          <SnackbarProvider>
            <JourneyProvider value={{ admin: true }}>
              <ReportButtons pageName='journeys'/>
            </JourneyProvider>
          </SnackbarProvider>
        </FlagsProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Journeys' }))
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        '/reports/journeys',
        undefined,
        { shallow: true }
      )
    })
  })

  it('should have Visitors button with push to visitors', async () => {
    const push = jest.fn()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)
    const { getByRole } = render(
      <MockedProvider>
        <FlagsProvider>
          <SnackbarProvider>
            <JourneyProvider value={{ admin: true }}>
              <ReportButtons pageName='journeys'/>
            </JourneyProvider>
          </SnackbarProvider>
        </FlagsProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Visitors' }))
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        '/reports/visitors',
        undefined,
        { shallow: true }
      )
    })
  })
})