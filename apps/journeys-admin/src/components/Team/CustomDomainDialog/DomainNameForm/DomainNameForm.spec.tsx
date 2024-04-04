import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GraphQLError } from 'graphql'
import { SnackbarProvider } from 'notistack'

import { GetCustomDomains_customDomains as CustomDomain } from '../../../../../__generated__/GetCustomDomains'
import { GetLastActiveTeamIdAndTeams } from '../../../../../__generated__/GetLastActiveTeamIdAndTeams'
import {
  createCustomDomainErrorMock,
  createCustomDomainMock,
  deleteCustomDomainMock
} from '../../../../libs/useCustomDomainsQuery/useCustomDomainsQuery.mock'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '../../TeamProvider'

import { DomainNameForm } from '.'

describe('DomainNameForm', () => {
  const customDomain: CustomDomain = {
    id: 'customDomainId',
    __typename: 'CustomDomain',
    name: 'example.com',
    apexName: 'example.com',
    journeyCollection: null
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
      expect(queryByTestId('DeleteCustomDomainIcon')).not.toBeInTheDocument()
    )
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

  it('should show error message', async () => {
    const { getByText, getByRole, queryByTestId } = render(
      <SnackbarProvider>
        <MockedProvider
          mocks={[getLastActiveTeamIdAndTeamsMock, createCustomDomainErrorMock]}
        >
          <TeamProvider>
            <DomainNameForm />
          </TeamProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    await waitFor(() =>
      expect(queryByTestId('DeleteCustomDomainIcon')).not.toBeInTheDocument()
    )
    await userEvent.type(getByRole('textbox'), 'www.example.com')
    getByRole('button', { name: 'Connect' }).click()
    await waitFor(() =>
      expect(
        getByText('Something went wrong, please reload the page and try again')
      ).toBeInTheDocument()
    )
  })

  it('should show error message for a domain that is already in use', async () => {
    const createCustomDomainErrorUniqueConstraintMock = {
      ...createCustomDomainErrorMock,
      result: {
        errors: [new GraphQLError('custom domain already exists')]
      }
    }
    const { getByText, getByRole, queryByTestId } = render(
      <SnackbarProvider>
        <MockedProvider
          mocks={[
            getLastActiveTeamIdAndTeamsMock,
            createCustomDomainErrorUniqueConstraintMock
          ]}
        >
          <TeamProvider>
            <DomainNameForm />
          </TeamProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    await waitFor(() =>
      expect(queryByTestId('DeleteCustomDomainIcon')).not.toBeInTheDocument()
    )
    await userEvent.type(getByRole('textbox'), 'www.example.com')
    getByRole('button', { name: 'Connect' }).click()
    await waitFor(() =>
      expect(
        getByText('This domain is already connected to another NextSteps Team')
      ).toBeInTheDocument()
    )
  })

  it('should show error message for a domain that is already in use by another team in account', async () => {
    const createCustomDomainErrorAlreadyInUseMock = {
      ...createCustomDomainErrorMock,
      result: {
        errors: [new GraphQLError("it's already in use by your account.")]
      }
    }
    const { getByText, getByRole, queryByTestId } = render(
      <SnackbarProvider>
        <MockedProvider
          mocks={[
            getLastActiveTeamIdAndTeamsMock,
            createCustomDomainErrorAlreadyInUseMock
          ]}
        >
          <TeamProvider>
            <DomainNameForm />
          </TeamProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    await waitFor(() =>
      expect(queryByTestId('DeleteCustomDomainIcon')).not.toBeInTheDocument()
    )
    await userEvent.type(getByRole('textbox'), 'www.example.com')
    getByRole('button', { name: 'Connect' }).click()
    await waitFor(() =>
      expect(
        getByText('This domain is already connected to another NextSteps Team')
      ).toBeInTheDocument()
    )
  })
})
