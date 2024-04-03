import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import {
  GetAdminJourneys,
  GetAdminJourneysVariables
} from '../../../../__generated__/GetAdminJourneys'
import { GetLastActiveTeamIdAndTeams } from '../../../../__generated__/GetLastActiveTeamIdAndTeams'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { GET_ADMIN_JOURNEYS } from '../../../libs/useAdminJourneysQuery/useAdminJourneysQuery'
import {
  defaultJourney,
  publishedJourney
} from '../../JourneyList/journeyListData'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '../TeamProvider'

import { CustomDomainDialog } from './CustomDomainDialog'
import {
  checkCustomDomainMockConfiguredAndVerified,
  getCustomDomainMockARecord,
  getCustomDomainMockCNameAndJourneyCollection,
  getCustomDomainMockEmpty,
  mockCreateCustomDomain,
  mockDeleteCustomDomain,
  mockJourneyCollectionCreate,
  mockJourneyCollectionDelete,
  mockJourneyCollectionUpdate
} from './data'

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

  it('creates a custom domain', async () => {
    const cache = new InMemoryCache()
    const { getByRole, getByText } = render(
      <MockedProvider
        cache={cache}
        mocks={[
          getLastActiveTeamIdAndTeamsMock,
          getAdminJourneysMock,
          mockCreateCustomDomain,
          getCustomDomainMockEmpty,
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

    await waitFor(() =>
      expect(getCustomDomainMockEmpty.result).toHaveBeenCalled()
    )

    fireEvent.change(getByRole('textbox'), {
      target: { value: 'www.example.com' }
    })
    fireEvent.click(getByText('Connect'))

    await waitFor(() =>
      expect(mockCreateCustomDomain.result).toHaveBeenCalled()
    )

    expect(cache.extract()['CustomDomain:customDomainId']).toEqual({
      __typename: 'CustomDomain',
      apexName: 'www.example.com',
      id: 'customDomainId',
      journeyCollection: null,
      name: 'www.example.com'
    })
  })

  it('validates form', async () => {
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
    fireEvent.change(getByRole('textbox'), {
      target: { value: '-www.example.com' }
    })
    fireEvent.click(getByText('Connect'))

    await waitFor(() =>
      expect(getByText('Must be a valid URL')).toBeInTheDocument()
    )
    fireEvent.change(getByRole('textbox'), {
      target: { value: '' }
    })
    await waitFor(() =>
      expect(getByText('Domain name is a required field')).toBeInTheDocument()
    )
    await waitFor(() =>
      expect(mockCreateCustomDomain.result).not.toHaveBeenCalled()
    )
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
    await waitFor(() =>
      expect(getCustomDomainMockARecord.result).toHaveBeenCalled()
    )
    expect(cache.extract()['CustomDomain:customDomainId']).toBeDefined()
    fireEvent.click(getByRole('button', { name: 'Disconnect' }))
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
          mockJourneyCollectionCreate,
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
    await waitFor(() =>
      expect(getCustomDomainMockARecord.result).toHaveBeenCalled()
    )
    fireEvent.mouseDown(getByRole('combobox', { expanded: false }))
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
          mockJourneyCollectionUpdate,
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
    await waitFor(() =>
      expect(
        getCustomDomainMockCNameAndJourneyCollection.result
      ).toHaveBeenCalled()
    )
    fireEvent.mouseDown(getByRole('combobox'))
    fireEvent.click(getByRole('option', { name: 'Published Journey Heading' }))
    await waitFor(() =>
      expect(mockJourneyCollectionUpdate.result).toHaveBeenCalled()
    )
  })

  it('deletes a custom journey', async () => {
    const { getByRole, getByLabelText } = render(
      <MockedProvider
        mocks={[
          getLastActiveTeamIdAndTeamsMock,
          getAdminJourneysMock,
          getCustomDomainMockCNameAndJourneyCollection,
          mockJourneyCollectionDelete
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

    await waitFor(() =>
      fireEvent.mouseDown(getByRole('combobox', { expanded: false }))
    )
    fireEvent.click(getByLabelText('Clear'))
    await waitFor(() =>
      expect(mockJourneyCollectionDelete.result).toHaveBeenCalled()
    )
  })
})
