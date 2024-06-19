import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { TeamProvider } from '@core/journeys/ui/TeamProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import { AnalyticsItem } from './AnalyticsItem'

describe('AnalyticsItem', () => {
  it('should link to journey reports page as a list item', async () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <TeamProvider>
            <JourneyProvider
              value={{
                journey: defaultJourney,
                variant: 'admin'
              }}
            >
              <AnalyticsItem variant="menu-item" />
            </JourneyProvider>
          </TeamProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByRole('menuitem', { name: 'Analytics' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Analytics' })).toHaveAttribute(
      'href',
      '/journeys/journey-id/reports'
    )
  })

  it('should link to journey reports page as an icon button', async () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <TeamProvider>
            <JourneyProvider
              value={{
                journey: defaultJourney,
                variant: 'admin'
              }}
            >
              <AnalyticsItem variant="button" />
            </JourneyProvider>
          </TeamProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByRole('link', { name: 'Analytics' })).toBeInTheDocument()
    expect(getByRole('link', { name: 'Analytics' })).toHaveAttribute(
      'href',
      '/journeys/journey-id/reports'
    )
  })
})
