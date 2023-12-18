import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { TeamProvider } from '../../../Team/TeamProvider'
import { defaultJourney } from '../../data'

import { Analytics } from './Analytics'

describe('Analytics', () => {
  it('should link to journey reports page', async () => {
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
              <Analytics journey={defaultJourney} variant="list-item" />
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
})
