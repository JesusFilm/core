import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { CreateCustomDomain } from '../../../../__generated__/CreateCustomDomain'
import { DeleteCustomDomain } from '../../../../__generated__/DeleteCustomDomain'
import {
  GetAdminJourneys,
  GetAdminJourneysVariables
} from '../../../../__generated__/GetAdminJourneys'
import { GetCustomDomain } from '../../../../__generated__/GetCustomDomain'
import { GetLastActiveTeamIdAndTeams } from '../../../../__generated__/GetLastActiveTeamIdAndTeams'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { JourneyCollectionCreate } from '../../../../__generated__/JourneyCollectionCreate'
import { UpdateJourneyCollection } from '../../../../__generated__/UpdateJourneyCollection'
import { GET_ADMIN_JOURNEYS } from '../../../libs/useAdminJourneysQuery/useAdminJourneysQuery'
import {
  defaultJourney,
  publishedJourney
} from '../../JourneyList/journeyListData'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '../TeamProvider'

import {
  CREATE_CUSTOM_DOMAIN,
  CustomDomainDialog,
  DELETE_CUSTOM_DOMAIN,
  GET_CUSTOM_DOMAIN,
  JOURNEY_COLLECTION_CREATE,
  UPDATE_JOURNEY_COLLECTION
} from './CustomDomainDialog'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn(() => 'uuid')
}))

describe('CustomDomainDialog', () => {
  const onClose = jest.fn()

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
    result: jest.fn(() => ({
      data: {
        journeys: [defaultJourney, publishedJourney]
      }
    }))
  }

  const getCustomDomainMockEmpty: MockedResponse<GetCustomDomain> = {
    request: {
      query: GET_CUSTOM_DOMAIN,
      variables: {
        teamId: 'teamId'
      }
    },
    result: jest.fn(() => ({
      data: {
        customDomains: []
      }
    }))
  }

  const getCustomDomainMockARecord: MockedResponse<GetCustomDomain> = {
    request: {
      query: GET_CUSTOM_DOMAIN,
      variables: {
        teamId: 'teamId'
      }
    },
    result: jest.fn(() => ({
      data: {
        customDomains: [
          {
            __typename: 'CustomDomain',
            name: 'mockdomain.com',
            apexName: 'mockdomain.com',
            id: 'customDomainId',
            teamId: 'teamId',
            verification: {
              __typename: 'CustomDomainVerification',
              verified: true,
              verification: []
            },
            configuration: {
              __typename: 'VercelDomainConfiguration',
              misconfigured: false
            },
            journeyCollection: {
              __typename: 'JourneyCollection',
              id: 'journeyCollectionId',
              journeys: []
            }
          }
        ]
      }
    }))
  }

  const getCustomDomainMockCNameAndJourneyCollection: MockedResponse<GetCustomDomain> =
    {
      request: {
        query: GET_CUSTOM_DOMAIN,
        variables: {
          teamId: 'teamId'
        }
      },
      result: jest.fn(() => ({
        data: {
          customDomains: [
            {
              __typename: 'CustomDomain',
              name: 'tandem.mockdomain.com',
              apexName: 'mockdomain.com',
              id: 'customDomainId',
              teamId: 'teamId',
              verification: {
                __typename: 'CustomDomainVerification',
                verified: true,
                verification: []
              },
              configuration: {
                __typename: 'VercelDomainConfiguration',
                misconfigured: false
              },
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
          ]
        }
      }))
    }

  const getLastActiveTeamIdAndTeamsMock: MockedResponse<GetLastActiveTeamIdAndTeams> =
    {
      request: {
        query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
      },
      result: jest.fn(() => ({
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
      }))
    }

  const mockCreateCustomDomain: MockedResponse<CreateCustomDomain> = {
    request: {
      query: CREATE_CUSTOM_DOMAIN,
      variables: { input: { name: 'www.example.com', teamId: 'teamId' } }
    },
    result: jest.fn(() => ({
      data: {
        customDomainCreate: {
          __typename: 'CustomDomain',
          id: 'customDomainId',
          apexName: 'www.example.com',
          name: 'www.example.com',
          verification: {
            __typename: 'CustomDomainVerification',
            verified: true,
            verification: []
          },
          configuration: {
            __typename: 'VercelDomainConfiguration',
            misconfigured: false
          },
          journeyCollection: null
        }
      }
    }))
  }

  const mockDeleteCustomDomain: MockedResponse<DeleteCustomDomain> = {
    request: {
      query: DELETE_CUSTOM_DOMAIN,
      variables: { customDomainDeleteId: 'customDomainId' }
    },
    result: jest.fn(() => ({
      data: {
        customDomainDelete: {
          __typename: 'CustomDomain',
          id: 'customDomainId'
        }
      }
    }))
  }

  const mockJourneyCollectionCreate: MockedResponse<JourneyCollectionCreate> = {
    request: {
      query: JOURNEY_COLLECTION_CREATE,
      variables: {
        journeyCollectionInput: {
          id: 'uuid',
          teamId: 'teamId',
          journeyIds: ['journey-id']
        },
        customDomainUpdateInput: {
          id: 'customDomainId',
          journeyCollectionId: 'uuid'
        }
      }
    },
    result: jest.fn(() => ({
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
    }))
  }

  const mockJourneyCollectionUpdate: MockedResponse<UpdateJourneyCollection> = {
    request: {
      query: UPDATE_JOURNEY_COLLECTION,
      variables: {
        input: {
          id: 'journeyCollectionId',
          journeyIds: ['published-journey-id']
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        journeyCollectionUpdate: {
          __typename: 'JourneyCollection',
          id: 'journeyCollectionId',
          journeys: [{ __typename: 'Journey', id: 'published-journey-id' }]
        }
      }
    }))
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('creates a custom domain', async () => {
    const cache = new InMemoryCache()
    const { getByRole, getByText } = render(
      <MockedProvider
        cache={cache}
        mocks={[
          getLastActiveTeamIdAndTeamsMock,
          getAdminJourneysMock,
          mockCreateCustomDomain,
          getCustomDomainMockEmpty
        ]}
      >
        <SnackbarProvider>
          <TeamProvider>
            <CustomDomainDialog open onClose={onClose} />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getCustomDomainMockEmpty.result).toHaveBeenCalled()
    )
    fireEvent.change(getByRole('textbox'), {
      target: { value: 'www.example.com' }
    })
    fireEvent.click(getByText('Apply'))

    await waitFor(() =>
      expect(mockCreateCustomDomain.result).toHaveBeenCalled()
    )

    expect(cache.extract()['CustomDomain:customDomainId']).toEqual({
      __typename: 'CustomDomain',
      apexName: 'www.example.com',
      id: 'customDomainId',
      journeyCollection: null,
      name: 'www.example.com',
      verification: {
        __typename: 'CustomDomainVerification',
        verification: [],
        verified: true
      },
      configuration: {
        __typename: 'VercelDomainConfiguration',
        misconfigured: false
      }
    })
  })

  it('deletes a custom domain', async () => {
    const cache = new InMemoryCache()
    const { getByRole } = render(
      <MockedProvider
        cache={cache}
        mocks={[
          getLastActiveTeamIdAndTeamsMock,
          getAdminJourneysMock,
          mockDeleteCustomDomain,
          getCustomDomainMockARecord
        ]}
      >
        <SnackbarProvider>
          <TeamProvider>
            <CustomDomainDialog open onClose={onClose} />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getCustomDomainMockARecord.result).toHaveBeenCalled()
    )
    expect(cache.extract()['CustomDomain:customDomainId']).toBeDefined()
    fireEvent.click(getByRole('button', { name: 'Reset' }))
    await waitFor(() =>
      expect(mockDeleteCustomDomain.result).toHaveBeenCalled()
    )
    expect(cache.extract()['CustomDomain:customDomainId']).toBeUndefined()
  })

  it('creates a default journey for domain when selecting a new one', async () => {
    const { getByRole } = render(
      <MockedProvider
        mocks={[
          getLastActiveTeamIdAndTeamsMock,
          getAdminJourneysMock,
          getCustomDomainMockARecord,
          mockJourneyCollectionCreate
        ]}
      >
        <SnackbarProvider>
          <TeamProvider>
            <CustomDomainDialog open onClose={onClose} />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getCustomDomainMockARecord.result).toHaveBeenCalled()
    )
    fireEvent.mouseDown(getByRole('button', { expanded: false }))
    fireEvent.click(getByRole('option', { name: 'Default Journey Heading' }))
    await waitFor(() =>
      expect(mockJourneyCollectionCreate.result).toHaveBeenCalled()
    )
  })

  it('updates a default journey for domain if one already exists', async () => {
    const { getByRole } = render(
      <MockedProvider
        mocks={[
          getLastActiveTeamIdAndTeamsMock,
          getAdminJourneysMock,
          getCustomDomainMockCNameAndJourneyCollection,
          mockJourneyCollectionUpdate
        ]}
      >
        <SnackbarProvider>
          <TeamProvider>
            <CustomDomainDialog open onClose={onClose} />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(
        getCustomDomainMockCNameAndJourneyCollection.result
      ).toHaveBeenCalled()
    )
    fireEvent.mouseDown(getByRole('button', { expanded: false }))
    fireEvent.click(getByRole('option', { name: 'Published Journey Heading' }))
    await waitFor(() =>
      expect(mockJourneyCollectionUpdate.result).toHaveBeenCalled()
    )
  })
})
