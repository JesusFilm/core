import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SnackbarProvider } from 'notistack'

import {
  CreateCustomDomain,
  CreateCustomDomainVariables
} from '../../../../../__generated__/CreateCustomDomain'
import {
  DeleteCustomDomain,
  DeleteCustomDomainVariables
} from '../../../../../__generated__/DeleteCustomDomain'
import { GetCustomDomains_customDomains as CustomDomain } from '../../../../../__generated__/GetCustomDomains'
import { GetLastActiveTeamIdAndTeams } from '../../../../../__generated__/GetLastActiveTeamIdAndTeams'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '../../TeamProvider'

import { CREATE_CUSTOM_DOMAIN, DELETE_CUSTOM_DOMAIN, DomainNameForm } from '.'

describe('DomainNameForm', () => {
  const customDomain: CustomDomain = {
    id: 'customDomainId',
    __typename: 'CustomDomain',
    name: 'mockdomain.com',
    apexName: 'mockdomain.com',
    journeyCollection: null
  }

  const createCustomDomainMock: MockedResponse<
    CreateCustomDomain,
    CreateCustomDomainVariables
  > = {
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

  const deleteCustomDomainMock: MockedResponse<
    DeleteCustomDomain,
    DeleteCustomDomainVariables
  > = {
    request: {
      query: DELETE_CUSTOM_DOMAIN,
      variables: { customDomainId: 'customDomainId' }
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

  it('should delete a custom domain', async () => {
    const cache = new InMemoryCache()

    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider cache={cache} mocks={[deleteCustomDomainMock]}>
          <DomainNameForm customDomain={customDomain} />
        </MockedProvider>
      </SnackbarProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Disconnect' }))

    await waitFor(() =>
      expect(deleteCustomDomainMock.result).toHaveBeenCalled()
    )
    expect(cache.extract()['CustomDomain:customDomainId']).toBeUndefined()
  })

  it('should create a custom domain', async () => {
    const cache = new InMemoryCache()

    const { queryByTestId, getByRole } = render(
      <SnackbarProvider>
        <MockedProvider
          cache={cache}
          mocks={[getLastActiveTeamIdAndTeamsMock, createCustomDomainMock]}
        >
          <TeamProvider>
            <DomainNameForm />
          </TeamProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    await waitFor(() =>
      expect(getLastActiveTeamIdAndTeamsMock.result).toHaveBeenCalled()
    )
    expect(queryByTestId('DeleteCustomDomainIcon')).not.toBeInTheDocument()
    fireEvent.change(getByRole('textbox'), {
      target: { value: 'www.example.com' }
    })
    fireEvent.click(getByRole('button', { name: 'Connect' }))

    await waitFor(() =>
      expect(createCustomDomainMock.result).toHaveBeenCalled()
    )
    expect(cache.extract()['CustomDomain:customDomainId']).toEqual({
      __typename: 'CustomDomain',
      apexName: 'www.example.com',
      id: 'customDomainId',
      journeyCollection: null,
      name: 'www.example.com'
    })
  })

  it('should validate', async () => {
    const { getByText, getByRole } = render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <TeamProvider>
            <DomainNameForm />
          </TeamProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    await userEvent.type(getByRole('textbox'), '_www.example.com')
    getByRole('button', { name: 'Connect' }).focus()
    await waitFor(() =>
      expect(getByText('Must be a valid URL')).toBeInTheDocument()
    )
    fireEvent.change(getByRole('textbox'), {
      target: { value: '' }
    })
    await waitFor(() =>
      expect(getByText('Domain name is a required field')).toBeInTheDocument()
    )
  })
})
