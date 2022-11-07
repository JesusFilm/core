import { render } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { ReportButtons } from './ReportButtons'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('ReportButtons', () => {
  it('should link to reports', async () => {
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
