import { render } from '@testing-library/react'
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
  it('should link to reports', async () => {
    const push = jest.fn()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)
    const { getByRole } = render(
      <MockedProvider>
        <FlagsProvider>
          <SnackbarProvider>
            <JourneyProvider value={{ admin: true }}>
              <ReportButtons selected="journeys" />
            </JourneyProvider>
          </SnackbarProvider>
        </FlagsProvider>
      </MockedProvider>
    )
    expect(getByRole('link', { name: 'Visitors' })).toHaveAttribute(
      'href',
      '/reports/visitors'
    )
    expect(getByRole('link', { name: 'Journeys' })).toHaveAttribute(
      'href',
      '/reports/journeys'
    )
  })

  it('should display selected button for report type ', async () => {
    const push = jest.fn()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)
    const { getByRole } = render(
      <MockedProvider>
        <FlagsProvider>
          <SnackbarProvider>
            <JourneyProvider value={{ admin: true }}>
              <ReportButtons selected="visitors" />
            </JourneyProvider>
          </SnackbarProvider>
        </FlagsProvider>
      </MockedProvider>
    )

    expect(getByRole('link', { name: 'Visitors' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
  })
})
