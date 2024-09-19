import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { GraphQLError } from 'graphql'
import { SnackbarProvider } from 'notistack'

import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '@core/journeys/ui/TeamProvider'
import { GetLastActiveTeamIdAndTeams } from '@core/journeys/ui/TeamProvider/__generated__/GetLastActiveTeamIdAndTeams'

import { CheckCustomDomain } from '../../../../../__generated__/CheckCustomDomain'
import {
  CreateCustomDomain,
  CreateCustomDomainVariables
} from '../../../../../__generated__/CreateCustomDomain'
import {
  DeleteCustomDomain,
  DeleteCustomDomainVariables
} from '../../../../../__generated__/DeleteCustomDomain'
import { GetCustomDomains_customDomains as CustomDomain } from '../../../../../__generated__/GetCustomDomains'
import { UserTeamRole } from '../../../../../__generated__/globalTypes'

import {
  CREATE_CUSTOM_DOMAIN,
  DELETE_CUSTOM_DOMAIN,
  DomainNameForm
} from './DomainNameForm'

const createCustomDomainMock: MockedResponse<
  CreateCustomDomain,
  CreateCustomDomainVariables
> = {
  request: {
    query: CREATE_CUSTOM_DOMAIN,
    variables: { input: { name: 'www.example.com', teamId: 'teamId' } }
  },
  result: {
    data: {
      customDomainCreate: {
        __typename: 'CustomDomain',
        id: 'customDomainId',
        apexName: 'www.example.com',
        name: 'www.example.com',
        journeyCollection: null
      }
    }
  }
}

const deleteCustomDomainMock: MockedResponse<
  DeleteCustomDomain,
  DeleteCustomDomainVariables
> = {
  request: {
    query: DELETE_CUSTOM_DOMAIN,
    variables: { customDomainId: 'customDomainId' }
  },
  result: {
    data: {
      customDomainDelete: {
        __typename: 'CustomDomain',
        id: 'customDomainId'
      }
    }
  }
}

const createCustomDomainErrorMock: MockedResponse<
  CheckCustomDomain,
  CreateCustomDomainVariables
> = {
  request: {
    query: CREATE_CUSTOM_DOMAIN,
    variables: { input: { name: 'www.example.com', teamId: 'teamId' } }
  },
  result: {
    errors: [new GraphQLError('Error!')]
  }
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

describe('DomainNameForm', () => {
  const customDomain: CustomDomain = {
    id: 'customDomainId',
    __typename: 'CustomDomain',
    name: 'example.com',
    apexName: 'example.com',
    journeyCollection: null
  }

  it('should delete a custom domain', async () => {
    const cache = new InMemoryCache()
    const result = jest.fn().mockReturnValue(deleteCustomDomainMock.result)
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider
          cache={cache}
          mocks={[{ ...deleteCustomDomainMock, result }]}
        >
          <DomainNameForm
            customDomain={customDomain}
            currentUserTeamRole={UserTeamRole.manager}
          />
        </MockedProvider>
      </SnackbarProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Disconnect' }))

    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(cache.extract()['CustomDomain:customDomainId']).toBeUndefined()
  })

  it('should create a custom domain', async () => {
    const cache = new InMemoryCache()
    const result = jest.fn().mockReturnValue(createCustomDomainMock.result)
    const { queryByTestId, getByRole } = render(
      <SnackbarProvider>
        <MockedProvider
          cache={cache}
          mocks={[
            getLastActiveTeamIdAndTeamsMock,
            { ...createCustomDomainMock, result }
          ]}
        >
          <TeamProvider>
            <DomainNameForm currentUserTeamRole={UserTeamRole.manager} />
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
    await waitFor(() => expect(result).toHaveBeenCalled())
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
            <DomainNameForm currentUserTeamRole={UserTeamRole.manager} />
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
            <DomainNameForm currentUserTeamRole={UserTeamRole.manager} />
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
            <DomainNameForm currentUserTeamRole={UserTeamRole.manager} />
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
            <DomainNameForm currentUserTeamRole={UserTeamRole.manager} />
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

  it('should now allow user to create custom domain if they are only a team member', async () => {
    const createCustomDomainErrorAlreadyInUseMock = {
      ...createCustomDomainErrorMock,
      result: {
        errors: [
          new GraphQLError('user is not allowed to create custom domain')
        ]
      }
    }
    const { getByRole, queryByTestId, getByText } = render(
      <SnackbarProvider>
        <MockedProvider
          mocks={[
            getLastActiveTeamIdAndTeamsMock,
            createCustomDomainErrorAlreadyInUseMock
          ]}
        >
          <TeamProvider>
            <DomainNameForm currentUserTeamRole={UserTeamRole.member} />
          </TeamProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    await waitFor(() =>
      expect(queryByTestId('DeleteCustomDomainIcon')).not.toBeInTheDocument()
    )
    fireEvent.mouseOver(getByRole('button', { name: 'Connect' }))
    await waitFor(() =>
      expect(
        getByText('Only team managers can update the custom domain')
      ).toBeInTheDocument()
    )

    expect(getByRole('button', { name: 'Connect' })).toBeDisabled()
  })
})
