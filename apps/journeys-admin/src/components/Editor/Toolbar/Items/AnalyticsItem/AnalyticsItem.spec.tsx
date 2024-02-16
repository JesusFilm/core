import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { TeamProvider } from '../../../../Team/TeamProvider'
import { defaultJourney } from '../../../data'

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
    expect(getByRole('menuitem', { name: 'AnalyticsItem' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'AnalyticsItem' })).toHaveAttribute(
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
    expect(getByRole('link', { name: 'AnalyticsItem' })).toBeInTheDocument()
    expect(getByRole('link', { name: 'AnalyticsItem' })).toHaveAttribute(
      'href',
      '/journeys/journey-id/reports'
    )
  })
})
