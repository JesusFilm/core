import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { CreateCustomDomain } from '../../../../__generated__/CreateCustomDomain'
import {
  GetAdminJourneys,
  GetAdminJourneysVariables
} from '../../../../__generated__/GetAdminJourneys'
import { GetCustomDomain } from '../../../../__generated__/GetCustomDomain'
import { GetLastActiveTeamIdAndTeams } from '../../../../__generated__/GetLastActiveTeamIdAndTeams'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { GET_ADMIN_JOURNEYS } from '../../../libs/useAdminJourneysQuery/useAdminJourneysQuery'
import { defaultJourney } from '../../JourneyList/journeyListData'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '../TeamProvider'

import {
  CREATE_CUSTOM_DOMAIN,
  CustomDomainDialog,
  GET_CUSTOM_DOMAIN
} from './CustomDomainDialog'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
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
        journeys: [defaultJourney]
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
            allowOutsideJourneys: true,
            id: 'customDomainId',
            teamId: 'teamId',
            verification: {
              __typename: 'CustomDomainVerification',
              verified: true,
              verification: []
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
              publicTitle: 'Team Title'
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
          allowOutsideJourneys: true,
          verification: {
            __typename: 'CustomDomainVerification',
            verified: true,
            verification: []
          },
          journeyCollection: null
        }
      }
    }))
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('creates a custom domain', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[
          getLastActiveTeamIdAndTeamsMock,
          getAdminJourneysMock,
          mockCreateCustomDomain,
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
      expect(getLastActiveTeamIdAndTeamsMock.result).toHaveBeenCalled()
    )
    fireEvent.change(getByRole('textbox'), {
      target: { value: 'www.example.com' }
    })

    fireEvent.click(getByText('Update'))
    await waitFor(() =>
      expect(mockCreateCustomDomain.result).toHaveBeenCalled()
    )
  })
})
