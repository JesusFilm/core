import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import {
  GetAdminJourneys,
  GetAdminJourneysVariables
} from '../../../../../__generated__/GetAdminJourneys'
import { GetCustomDomains_customDomains as CustomDomain } from '../../../../../__generated__/GetCustomDomains'
import { GetLastActiveTeamIdAndTeams } from '../../../../../__generated__/GetLastActiveTeamIdAndTeams'
import { JourneyStatus } from '../../../../../__generated__/globalTypes'
import { GET_ADMIN_JOURNEYS } from '../../../../libs/useAdminJourneysQuery/useAdminJourneysQuery'
import {
  createJourneyCollectionMock,
  deleteJourneyCollectionMock,
  updateJourneyCollectionMock
} from '../../../../libs/useCustomDomainsQuery/useCustomDomainsQuery.mock'
import {
  defaultJourney,
  publishedJourney
} from '../../../JourneyList/journeyListData'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '../../TeamProvider'

import { DefaultJourneyForm } from '.'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn(() => 'uuid')
}))

describe('DefaultJourneyForm', () => {
  const customDomain: CustomDomain = {
    id: 'customDomainId',
    __typename: 'CustomDomain' as const,
    name: 'example.com',
    apexName: 'example.com',
    journeyCollection: null
  }

  const getAdminJourneysMock: MockedResponse<
    GetAdminJourneys,
    GetAdminJourneysVariables
  > = {
    request: {
      query: GET_ADMIN_JOURNEYS,
      variables: {
        status: [JourneyStatus.draft, JourneyStatus.published],
        useLastActiveTeamId: true
      }
    },
    result: {
      data: {
        journeys: [defaultJourney, publishedJourney]
      }
    }
  }

  const getLastActiveTeamIdAndTeamsMock: MockedResponse<GetLastActiveTeamIdAndTeams> =
    {
      request: {
        query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
      },
      result: {
        data: {
          teams: [
            {
              id: 'teamId',
              title: 'Team Title',
              __typename: 'Team',
              userTeams: [],
              publicTitle: 'Team Title',
              customDomains: []
            }
          ],
          getJourneyProfile: {
            id: 'someId',
            __typename: 'JourneyProfile',
            lastActiveTeamId: 'teamId'
          }
        }
      }
    }

  it('should set a default journey for custom domain', async () => {
    const result = jest.fn().mockReturnValue(createJourneyCollectionMock.result)
    const { getByRole } = render(
      <MockedProvider
        mocks={[
          getAdminJourneysMock,
          getLastActiveTeamIdAndTeamsMock,
          { ...createJourneyCollectionMock, result }
        ]}
      >
        <TeamProvider>
          <SnackbarProvider>
            <DefaultJourneyForm customDomain={customDomain} />
          </SnackbarProvider>
        </TeamProvider>
      </MockedProvider>
    )

    fireEvent.mouseDown(getByRole('combobox'))
    await waitFor(() =>
      expect(
        getByRole('option', { name: 'Default Journey Heading' })
      ).toBeInTheDocument()
    )
    fireEvent.click(getByRole('option', { name: 'Default Journey Heading' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should update defualt journey', async () => {
    const result = jest.fn().mockReturnValue(updateJourneyCollectionMock.result)
    const { getByRole } = render(
      <MockedProvider
        mocks={[
          getAdminJourneysMock,
          getLastActiveTeamIdAndTeamsMock,
          { ...updateJourneyCollectionMock, result }
        ]}
      >
        <TeamProvider>
          <SnackbarProvider>
            <DefaultJourneyForm
              customDomain={{
                ...customDomain,
                journeyCollection: {
                  __typename: 'JourneyCollection',
                  id: 'journeyCollectionId',
                  journeys: [
                    {
                      __typename: 'Journey',
                      id: 'journey-id',
                      title: 'Default Journey Heading'
                    }
                  ]
                }
              }}
            />
          </SnackbarProvider>
        </TeamProvider>
      </MockedProvider>
    )

    fireEvent.mouseDown(getByRole('combobox'))
    await waitFor(() =>
      expect(
        getByRole('option', { name: 'Published Journey Heading' })
      ).toBeInTheDocument()
    )
    fireEvent.click(getByRole('option', { name: 'Published Journey Heading' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should delete custom journey', async () => {
    const result = jest.fn().mockReturnValue(deleteJourneyCollectionMock.result)
    const { getByRole, getByLabelText } = render(
      <MockedProvider
        mocks={[
          getAdminJourneysMock,
          getLastActiveTeamIdAndTeamsMock,
          { ...deleteJourneyCollectionMock, result }
        ]}
      >
        <TeamProvider>
          <SnackbarProvider>
            <DefaultJourneyForm
              customDomain={{
                ...customDomain,
                journeyCollection: {
                  __typename: 'JourneyCollection',
                  id: 'journeyCollectionId',
                  journeys: [
                    {
                      __typename: 'Journey',
                      id: 'journey-id',
                      title: 'Default Journey Heading'
                    }
                  ]
                }
              }}
            />
          </SnackbarProvider>
        </TeamProvider>
      </MockedProvider>
    )
    fireEvent.mouseDown(getByRole('combobox'))
    fireEvent.click(getByLabelText('Clear'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
