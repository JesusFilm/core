import { MockedProvider, type MockedResponse } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { JourneyFields as Journey } from '../../../__generated__/JourneyFields'
import { JOURNEY_VIEW_EVENT_CREATE } from '../Conductor/Conductor'

import { JourneyRenderer } from '.'

const noopJourneyViewMock: MockedResponse = {
  request: { query: JOURNEY_VIEW_EVENT_CREATE },
  variableMatcher: () => true,
  maxUsageCount: Infinity,
  delay: 99999999,
  result: {
    data: {
      journeyViewEventCreate: { id: 'noop', __typename: 'JourneyViewEvent' }
    }
  }
}

describe('JourneyRenderer', () => {
  const defaultJourney = {
    id: 'journeyId',
    __typename: 'Journey',
    website: null,
    blocks: [],
    language: {
      __typename: 'Language',
      id: '529'
    }
  } as unknown as Journey

  it('should render conductor', () => {
    const journey = {
      ...defaultJourney,
      website: false
    }
    render(
      <MockedProvider mocks={[noopJourneyViewMock]}>
        <SnackbarProvider>
          <JourneyProvider value={{ journey }}>
            <JourneyRenderer />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('Conductor')).toBeInTheDocument()
  })

  it('should render web view', () => {
    const journey = {
      ...defaultJourney,
      website: true
    }

    render(
      <MockedProvider mocks={[noopJourneyViewMock]}>
        <SnackbarProvider>
          <JourneyProvider value={{ journey }}>
            <JourneyRenderer />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('WebView')).toBeInTheDocument()
  })
})
