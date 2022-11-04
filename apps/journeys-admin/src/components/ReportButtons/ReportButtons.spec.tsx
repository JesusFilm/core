import { render, fireEvent,waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { ReportButtons } from './ReportButtons'


describe('ReportButtons', () => {
  it('should have Journeys button with push to journeys', async () => {
    const push = jest.fn()
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
        '/journeys-admin/journeys',
        undefined,
        { shallow: true }
      )
    })
  })

  it('should have Visitors button with push to visitors', async () => {
    const push = jest.fn()
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
        '/journeys-admin/visitors',
        undefined,
        { shallow: true }
      )
    })
  })
})