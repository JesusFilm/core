import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import { SHARE_DATA_QUERY } from '../../../../../libs/useShareDataQuery/useShareDataQuery'

import { GET_JOURNEY_QR_CODES } from './QrCodeDialog/QrCodeDialog'
import { ShareItem } from './ShareItem'

const defaultShareDataQueryMock: MockedResponse = {
  request: {
    query: SHARE_DATA_QUERY,
    variables: {
      id: defaultJourney.id,
      qrCodeWhere: { journeyId: defaultJourney.id }
    }
  },
  result: {
    data: {
      journey: {
        id: defaultJourney.id,
        slug: defaultJourney.slug,
        title: defaultJourney.title,
        team: null,
        __typename: 'Journey'
      },
      qrCodes: []
    }
  }
}

const customDomainShareDataQueryMock: MockedResponse = {
  request: {
    query: SHARE_DATA_QUERY,
    variables: {
      id: defaultJourney.id,
      qrCodeWhere: { journeyId: defaultJourney.id }
    }
  },
  result: {
    data: {
      journey: {
        id: defaultJourney.id,
        slug: 'default',
        title: 'Journey Heading',
        team: {
          id: 'teamId',
          customDomains: [
            {
              id: 'customDomainId',
              name: 'example.com',
              apexName: 'example.com',
              routeAllTeamJourneys: false,
              __typename: 'CustomDomain'
            }
          ],
          __typename: 'Team'
        },
        __typename: 'Journey'
      },
      qrCodes: []
    }
  }
}

const qrCodesQueryMock: MockedResponse = {
  request: {
    query: GET_JOURNEY_QR_CODES,
    variables: {
      where: { journeyId: defaultJourney.id }
    }
  },
  result: {
    data: {
      qrCodes: []
    }
  }
}

describe('ShareItem', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the share button', async () => {
    await act(async () => {
      render(
        <MockedProvider mocks={[defaultShareDataQueryMock, qrCodesQueryMock]}>
          <JourneyProvider
            value={{ journey: defaultJourney, variant: 'admin' }}
          >
            <ShareItem variant="button" />
          </JourneyProvider>
        </MockedProvider>
      )
    })
    expect(screen.getByRole('button', { name: 'Share' })).toBeInTheDocument()
  })

  it('should open and close the ShareDialog', async () => {
    await act(async () => {
      render(
        <MockedProvider mocks={[defaultShareDataQueryMock, qrCodesQueryMock]}>
          <JourneyProvider
            value={{ journey: defaultJourney, variant: 'admin' }}
          >
            <ShareItem variant="button" />
          </JourneyProvider>
        </MockedProvider>
      )
    })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Share' }))
    })
    expect(screen.getByText('Share This Journey')).toBeInTheDocument()

    await act(async () => {
      fireEvent.keyDown(screen.getByRole('dialog'), {
        key: 'Escape',
        code: 'Escape'
      })
    })
    await waitFor(() => {
      expect(screen.queryByText('Share This Journey')).not.toBeInTheDocument()
    })
  })

  it('should pass custom domain hostname to ShareDialog', async () => {
    await act(async () => {
      render(
        <MockedProvider
          mocks={[customDomainShareDataQueryMock, qrCodesQueryMock]}
        >
          <JourneyProvider
            value={{
              journey: {
                ...defaultJourney,
                team: {
                  id: 'teamId',
                  __typename: 'Team',
                  title: 'Team Title',
                  publicTitle: 'Team Title'
                }
              },
              variant: 'admin'
            }}
          >
            <ShareItem variant="button" />
          </JourneyProvider>
        </MockedProvider>
      )
    })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Share' }))
    })
    await waitFor(() => {
      expect(
        screen.getByDisplayValue('https://example.com/default')
      ).toBeInTheDocument()
    })
  })

  it('should call closeMenu when dialog is closed', async () => {
    const closeMenu = jest.fn()
    await act(async () => {
      render(
        <MockedProvider mocks={[defaultShareDataQueryMock, qrCodesQueryMock]}>
          <JourneyProvider
            value={{ journey: defaultJourney, variant: 'admin' }}
          >
            <ShareItem variant="button" closeMenu={closeMenu} />
          </JourneyProvider>
        </MockedProvider>
      )
    })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Share' }))
    })

    await act(async () => {
      fireEvent.keyDown(screen.getByRole('dialog'), {
        key: 'Escape',
        code: 'Escape'
      })
    })
    await waitFor(() => {
      expect(closeMenu).toHaveBeenCalled()
    })
  })
})
