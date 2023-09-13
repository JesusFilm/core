import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { defaultJourney } from '../../../../JourneyView/data'
import { TeamProvider } from '../../../../Team/TeamProvider'

import { ReportMenuItem } from './ReportMenuItem'

describe('ReportMenuItem', () => {
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
              <ReportMenuItem journey={defaultJourney} />
            </JourneyProvider>
          </TeamProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByRole('menuitem', { name: 'Report' })).toBeInTheDocument()
    expect(getByRole('menuitem', { name: 'Report' })).toHaveAttribute(
      'href',
      '/journeys/journey-id/reports'
    )
  })
})
