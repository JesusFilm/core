import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import { GetLastActiveTeamIdAndTeams } from '../../../__generated__/GetLastActiveTeamIdAndTeams'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '../Team/TeamProvider'

import { GET_VISITORS } from './VisitorsList'

import { VisitorsList } from '.'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('VisitorList', () => {
  const request = {
    query: GET_VISITORS,
    variables: {
      first: 100
    }
  }
  const result = jest.fn(() => ({
    data: {
      visitors: {
        __typename: 'VisitorConnection',
        edges: [
          {
            __typename: 'VisitorEdge',
            node: {
              __typename: 'Visitor',
              id: 'visitor1.id',
              lastChatPlatform: 'facebook',
              lastLinkAction: null,
              lastRadioOptionSubmission: 'selected option',
              lastRadioQuestion: 'Poll question',
              lastStepViewedAt: '2023-04-05T20:00:05.725Z',
              lastTextResponse: 'user response'
            },
            cursor: 'date string'
          }
        ],
        pageInfo: {
          __typename: 'PageInfo',
          hasNextPage: false,
          startCursor: null,
          endCursor: null
        }
      }
    }
  }))

  const getTeams: MockedResponse<GetLastActiveTeamIdAndTeams> = {
    request: {
      query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
    },
    result: {
      data: {
        teams: [
          {
            id: 'teamId',
            title: 'Team Title',
            publicTitle: null,
            __typename: 'Team',
            userTeams: []
          }
        ],
        getJourneyProfile: {
          __typename: 'JourneyProfile',
          id: 'journeyProfileId',
          lastActiveTeamId: 'teamId'
        }
      }
    }
  }

  const mocks = [
    {
      request,
      result
    }
  ]

  it('should fetch visitors', async () => {
    render(
      <MockedProvider mocks={[...mocks, getTeams]}>
        <TeamProvider>
          <VisitorsList />
        </TeamProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should fetch more visitors', async () => {
    const fetchResult = jest.fn(() => ({
      data: {
        visitors: {
          __typename: 'VisitorConnection',
          edges: [
            {
              __typename: 'VisitorEdge',
              node: {
                __typename: 'Visitor',
                id: 'visitor2.id',
                lastChatPlatform: null,
                lastLinkAction: null,
                lastRadioOptionSubmission: null,
                lastRadioQuestion: null,
                lastStepViewedAt: '2023-04-05T20:00:05.725Z',
                lastTextResponse: null
              },
              cursor: 'cursor2'
            }
          ],
          pageInfo: {
            __typename: 'PageInfo',
            hasNextPage: true,
            startCursor: null,
            endCursor: 'cursor2'
          }
        }
      }
    }))

    const { getByRole, getAllByRole } = render(
      <MockedProvider
        mocks={[
          {
            request,
            result: {
              data: {
                visitors: {
                  __typename: 'VisitorConnection',
                  edges: [
                    {
                      __typename: 'VisitorEdge',
                      node: {
                        __typename: 'Visitor',
                        id: 'visitor1.id',
                        lastChatPlatform: null,
                        lastLinkAction: null,
                        lastRadioOptionSubmission: null,
                        lastRadioQuestion: null,
                        lastStepViewedAt: '2023-04-05T20:00:05.725Z',
                        lastTextResponse: null
                      },
                      cursor: 'cursor1'
                    }
                  ],
                  pageInfo: {
                    __typename: 'PageInfo',
                    hasNextPage: true,
                    startCursor: null,
                    endCursor: 'cursor1'
                  }
                }
              }
            }
          },
          {
            request: {
              query: GET_VISITORS,
              variables: {
                first: 100,
                after: 'cursor1'
              }
            },
            result: fetchResult
          },
          getTeams
        ]}
      >
        <TeamProvider>
          <VisitorsList />
        </TeamProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getAllByRole('row')[1]).toHaveAttribute('data-id', 'visitor1.id')
    )
    fireEvent.click(getByRole('button', { name: 'Load More' }))
    await waitFor(() => expect(fetchResult).toHaveBeenCalled())
  })

  it('should link to visitor when clicking on a row', async () => {
    const push = jest.fn()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)

    const { getAllByRole } = render(
      <MockedProvider mocks={[...mocks, getTeams]}>
        <TeamProvider>
          <VisitorsList />
        </TeamProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getAllByRole('row')[1]).toHaveAttribute('data-id', 'visitor1.id')
    )
    fireEvent.click(getAllByRole('row')[1])
    expect(push).toHaveBeenCalledWith('/reports/visitors/visitor1.id')
  })

  it('should disable load more button if there are no more visitors to fetch', async () => {
    const { getByRole } = render(
      <MockedProvider mocks={mocks}>
        <VisitorsList />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByRole('button', { name: 'Load More' })).toBeDisabled()
    )
  })

  it('should show grid column titles', async () => {
    const { getAllByRole } = render(
      <MockedProvider mocks={[...mocks, getTeams]}>
        <TeamProvider>
          <VisitorsList />
        </TeamProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())

    await waitFor(() => expect(getAllByRole('columnheader')).toHaveLength(5))
    const headers = getAllByRole('columnheader')
    expect(headers[0]).toHaveAttribute('aria-label', 'Last Active')
    expect(headers[1]).toHaveAttribute('aria-label', 'Chat Started')
    expect(headers[2]).toHaveAttribute('aria-label', 'Action')
    expect(headers[3]).toHaveAttribute('aria-label', 'User Data')
    expect(headers[4]).toHaveAttribute('aria-label', 'Polls')
  })

  it('should show response in cell text field', async () => {
    const { getByText } = render(
      <MockedProvider mocks={[...mocks, getTeams]}>
        <TeamProvider>
          <VisitorsList />
        </TeamProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(result).toHaveBeenCalled())

    await waitFor(() =>
      expect(getByText('Poll question: selected option')).toBeInTheDocument()
    )
    expect(getByText('user response')).toBeInTheDocument()
  })
})
