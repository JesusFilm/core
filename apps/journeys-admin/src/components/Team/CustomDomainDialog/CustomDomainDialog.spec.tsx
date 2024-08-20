import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '@core/journeys/ui/TeamProvider'
import { GetLastActiveTeamIdAndTeams } from '@core/journeys/ui/TeamProvider/__generated__/GetLastActiveTeamIdAndTeams'

import { CheckCustomDomain } from '../../../../__generated__/CheckCustomDomain'
import { getCustomDomainMock } from '../../../libs/useCustomDomainsQuery/useCustomDomainsQuery.mock'

import { CustomDomainDialog } from './CustomDomainDialog'
import { CHECK_CUSTOM_DOMAIN } from './DNSConfigSection'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

const checkCustomDomainMockConfiguredAndVerified: MockedResponse<CheckCustomDomain> =
  {
    request: {
      query: CHECK_CUSTOM_DOMAIN,
      variables: {
        customDomainId: 'customDomainId'
      }
    },
    result: {
      data: {
        customDomainCheck: {
          __typename: 'CustomDomainCheck',
          configured: true,
          verified: true,
          verification: null,
          verificationResponse: null
        }
      }
    }
  }

describe('CustomDomainDialog', () => {
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

  it('creates should show dns config if there is a custom domain', async () => {
    const result = jest
      .fn()
      .mockReturnValue(checkCustomDomainMockConfiguredAndVerified.result)
    const { getByText, queryByText } = render(
      <MockedProvider
        mocks={[
          getLastActiveTeamIdAndTeamsMock,
          getCustomDomainMock,
          { ...checkCustomDomainMockConfiguredAndVerified, result }
        ]}
      >
        <SnackbarProvider>
          <TeamProvider>
            <CustomDomainDialog open />
          </TeamProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(queryByText('DNS Config')).not.toBeInTheDocument()
    expect(queryByText('Default Journey')).not.toBeInTheDocument()
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(getByText('Default Journey')).toBeInTheDocument()
    expect(getByText('DNS Config')).toBeInTheDocument()
  })

  it('shohuld call on close', async () => {
    const onClose = jest.fn()
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

  it('should have the proper link for instructions button', () => {
    const onClose = jest.fn()
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <TeamProvider>
            <CustomDomainDialog open onClose={onClose} />
          </TeamProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    expect(getByRole('link', { name: 'Instructions' })).toHaveAttribute(
      'href',
      'https://support.nextstep.is/article/1365-custom-domains'
    )
    expect(getByRole('link', { name: 'Instructions' })).toHaveAttribute(
      'target',
      '_blank'
    )
  })
})
