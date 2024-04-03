import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { GetCustomDomains } from '../../../../__generated__/GetCustomDomains'
import { GetLastActiveTeamIdAndTeams } from '../../../../__generated__/GetLastActiveTeamIdAndTeams'
import { GET_CUSTOM_DOMAINS } from '../../../libs/useCustomDomainsQuery/useCustomDomainsQuery'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '../TeamProvider'

import { CustomDomainDialog } from './CustomDomainDialog'
import { checkCustomDomainMockConfiguredAndVerified } from './data'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn(() => 'uuid')
}))

const getCustomDomainMockARecord: MockedResponse<GetCustomDomains> = {
  request: {
    query: GET_CUSTOM_DOMAINS,
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

describe('CustomDomainDialog', () => {
  const onClose = jest.fn()

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

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('creates should show dns config if there is a custom domain', async () => {
    const { getByText, queryByText } = render(
      <MockedProvider
        mocks={[
          getLastActiveTeamIdAndTeamsMock,
          getCustomDomainMockARecord,
          checkCustomDomainMockConfiguredAndVerified
        ]}
      >
        <SnackbarProvider>
          <TeamProvider>
            <CustomDomainDialog open onClose={onClose} />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(queryByText('DNS Config')).not.toBeInTheDocument()
    expect(queryByText('Default Journey')).not.toBeInTheDocument()

    await waitFor(() =>
      expect(getLastActiveTeamIdAndTeamsMock.result).toHaveBeenCalled()
    )
    await waitFor(() =>
      expect(getCustomDomainMockARecord.result).toHaveBeenCalled()
    )

    await waitFor(() =>
      expect(
        checkCustomDomainMockConfiguredAndVerified.result
      ).toHaveBeenCalled()
    )
    expect(getByText('Default Journey')).toBeInTheDocument()
    expect(getByText('DNS Config')).toBeInTheDocument()
  })

  it('shohuld call on close', async () => {
    const { getByTestId } = render(
      <MockedProvider mocks={[]}>
        <SnackbarProvider>
          <TeamProvider>
            <CustomDomainDialog open onClose={onClose} />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByTestId('dialog-close-button'))
    expect(onClose).toHaveBeenCalled()
  })
})
