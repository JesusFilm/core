import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { GetLastActiveTeamIdAndTeams } from '../../../../__generated__/GetLastActiveTeamIdAndTeams'
import {
  checkCustomDomainMockConfiguredAndVerified,
  getCustomDomainMockARecord
} from '../../../libs/useCustomDomainsQuery/useCustomDomainsQuery.mock'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '../TeamProvider'

import { CustomDomainDialog } from './CustomDomainDialog'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

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
          getCustomDomainMockARecord,
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
