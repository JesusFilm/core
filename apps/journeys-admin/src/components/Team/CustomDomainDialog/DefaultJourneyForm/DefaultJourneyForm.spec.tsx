import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '@core/journeys/ui/TeamProvider'
import { GetLastActiveTeamIdAndTeams } from '@core/journeys/ui/TeamProvider/__generated__/GetLastActiveTeamIdAndTeams'

import {
  CreateJourneyCollection,
  CreateJourneyCollectionVariables
} from '../../../../../__generated__/CreateJourneyCollection'
import {
  DeleteJourneyCollection,
  DeleteJourneyCollectionVariables
} from '../../../../../__generated__/DeleteJourneyCollection'
import {
  GetAdminJourneys,
  GetAdminJourneysVariables
} from '../../../../../__generated__/GetAdminJourneys'
import { GetCustomDomains_customDomains as CustomDomain } from '../../../../../__generated__/GetCustomDomains'
import {
  JourneyStatus,
  UserTeamRole
} from '../../../../../__generated__/globalTypes'
import {
  UpdateJourneyCollection,
  UpdateJourneyCollectionVariables
} from '../../../../../__generated__/UpdateJourneyCollection'
import { GET_ADMIN_JOURNEYS } from '../../../../libs/useAdminJourneysQuery/useAdminJourneysQuery'
import {
  defaultJourney,
  publishedJourney
} from '../../../JourneyList/journeyListData'

import {
  CREATE_JOURNEY_COLLECTION,
  DELETE_JOURNEY_COLLECTION,
  DefaultJourneyForm,
  UPDATE_JOURNEY_COLLECTION
} from './DefaultJourneyForm'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn(() => 'uuid')
}))
const createJourneyCollectionMock: MockedResponse<
  CreateJourneyCollection,
  CreateJourneyCollectionVariables
> = {
  request: {
    query: CREATE_JOURNEY_COLLECTION,
    variables: {
      journeyCollectionInput: {
        id: 'uuid',
        teamId: 'teamId',
        journeyIds: ['journey-id']
      },
      customDomainUpdateInput: {
        journeyCollectionId: 'uuid'
      },
      customDomainId: 'customDomainId'
    }
  },
  result: {
    data: {
      journeyCollectionCreate: {
        __typename: 'JourneyCollection',
        id: 'journeyCollectionId',
        journeys: [
          {
            __typename: 'Journey',
            id: 'journey-id',
            title: 'Default Journey Heading'
          }
        ]
      },
      customDomainUpdate: {
        __typename: 'CustomDomain',
        id: 'customDomainUpdate',
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
      }
    }
  }
}
const updateJourneyCollectionMock: MockedResponse<
  UpdateJourneyCollection,
  UpdateJourneyCollectionVariables
> = {
  request: {
    query: UPDATE_JOURNEY_COLLECTION,
    variables: {
      id: 'journeyCollectionId',
      input: {
        journeyIds: ['published-journey-id']
      }
    }
  },
  result: {
    data: {
      journeyCollectionUpdate: {
        __typename: 'JourneyCollection',
        id: 'journeyCollectionId',
        journeys: [{ __typename: 'Journey', id: 'published-journey-id' }]
      }
    }
  }
}
const deleteJourneyCollectionMock: MockedResponse<
  DeleteJourneyCollection,
  DeleteJourneyCollectionVariables
> = {
  request: {
    query: DELETE_JOURNEY_COLLECTION,
    variables: { id: 'journeyCollectionId' }
  },
  result: {
    data: {
      journeyCollectionDelete: {
        id: 'journeyCollectionId',
        customDomains: [],
        __typename: 'JourneyCollection'
      }
    }
  }
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

describe('DefaultJourneyForm', () => {
  const customDomain: CustomDomain = {
    id: 'customDomainId',
    __typename: 'CustomDomain' as const,
    name: 'example.com',
    apexName: 'example.com',
    journeyCollection: null
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
            <DefaultJourneyForm
              customDomain={customDomain}
              currentUserTeamRole={UserTeamRole.manager}
            />
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
              currentUserTeamRole={UserTeamRole.manager}
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
              currentUserTeamRole={UserTeamRole.manager}
            />
          </SnackbarProvider>
        </TeamProvider>
      </MockedProvider>
    )
    fireEvent.mouseDown(getByRole('combobox'))
    fireEvent.click(getByLabelText('Clear'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should be disabled if user does not have correct permissions', async () => {
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
              currentUserTeamRole={UserTeamRole.member}
            />
          </SnackbarProvider>
        </TeamProvider>
      </MockedProvider>
    )
    expect(getByRole('combobox')).toBeDisabled()
  })
})
