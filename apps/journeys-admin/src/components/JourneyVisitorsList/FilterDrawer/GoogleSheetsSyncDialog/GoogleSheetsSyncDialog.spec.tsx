import { render, screen, waitFor } from '@testing-library/react'
import mockRouter from 'next-router-mock'

import { GoogleSheetsSyncDialog } from './GoogleSheetsSyncDialog'

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (value: string) => value
  })
}))

const mockEnqueueSnackbar = jest.fn()

jest.mock('notistack', () => ({
  useSnackbar: () => ({
    enqueueSnackbar: mockEnqueueSnackbar
  })
}))

const mockUseQuery = jest.fn()
const mockUseLazyQuery = jest.fn()
const mockUseMutation = jest.fn()

jest.mock('@apollo/client', () => ({
  gql: (strings: TemplateStringsArray | string) => strings,
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
  useLazyQuery: (...args: unknown[]) => mockUseLazyQuery(...args),
  useMutation: (...args: unknown[]) => mockUseMutation(...args)
}))

const mockUseIntegrationQuery = jest.fn()

jest.mock('../../../../libs/useIntegrationQuery/useIntegrationQuery', () => ({
  useIntegrationQuery: (...args: unknown[]) => mockUseIntegrationQuery(...args)
}))

const defaultJourneyData = {
  journey: {
    id: 'journey1',
    createdAt: '2023-01-01T00:00:00.000Z',
    title: 'Journey Title',
    team: {
      id: 'team1'
    }
  }
}

const defaultIntegrationsData = {
  integrations: [
    {
      __typename: 'IntegrationGoogle',
      id: 'integration1',
      accountEmail: 'test@example.com'
    }
  ]
}

let loadSyncsMock: jest.Mock
function setupApolloMocks({
  syncs = [],
  syncsLoading = false
}: {
  syncs?: Array<Record<string, unknown>>
  syncsLoading?: boolean
} = {}): void {
  const getPickerTokenMock = jest.fn()
  loadSyncsMock = jest.fn().mockResolvedValue(undefined)

  mockUseLazyQuery
    .mockImplementationOnce(() => [
      getPickerTokenMock,
      { data: undefined, loading: false }
    ])
    .mockImplementationOnce(() => [
      loadSyncsMock,
      {
        data: { googleSheetsSyncs: syncs },
        loading: syncsLoading,
        called: true
      }
    ])

  mockUseMutation
    .mockImplementationOnce(() => [
      jest.fn().mockResolvedValue(undefined),
      { loading: false }
    ])
    .mockImplementationOnce(() => [
      jest.fn().mockResolvedValue(undefined),
      { loading: false }
    ])
}

describe('GoogleSheetsSyncDialog', () => {
  const onClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseQuery.mockReset()
    mockUseLazyQuery.mockReset()
    mockUseMutation.mockReset()
    mockUseIntegrationQuery.mockReset()
    mockEnqueueSnackbar.mockClear()
    mockRouter.setCurrentUrl('/journeys')

    mockUseQuery.mockReturnValue({ data: defaultJourneyData })
    mockUseIntegrationQuery.mockReturnValue({
      data: defaultIntegrationsData
    })
    mockUseLazyQuery.mockImplementation(() => [
      jest.fn(),
      { data: undefined, loading: false, called: false }
    ])
    mockUseMutation.mockImplementation(() => [jest.fn(), { loading: false }])
  })

  it('fetches syncs when dialog is opened', async () => {
    setupApolloMocks()

    render(
      <GoogleSheetsSyncDialog open journeyId="journey1" onClose={onClose} />
    )

    await waitFor(() => {
      expect(loadSyncsMock).toHaveBeenCalledWith({
        variables: { filter: { journeyId: 'journey1' } },
        fetchPolicy: 'network-only'
      })
    })
  })

  it('auto-opens the add sync dialog when returning from integration creation', async () => {
    setupApolloMocks()
    mockRouter.setCurrentUrl(
      '/journeys?integrationCreated=true&openSyncDialog=true'
    )

    render(
      <GoogleSheetsSyncDialog open journeyId="journey1" onClose={onClose} />
    )

    await screen.findByRole('button', { name: 'Create Sync' })
    expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
      'Google integration created successfully',
      { variant: 'success' }
    )
    await waitFor(() => {
      expect(mockRouter.query.integrationCreated).toBeUndefined()
      expect(mockRouter.query.openSyncDialog).toBeUndefined()
    })
  })

  it('opens the add sync dialog automatically when there are no syncs', async () => {
    setupApolloMocks()

    render(
      <GoogleSheetsSyncDialog open journeyId="journey1" onClose={onClose} />
    )

    await screen.findByRole('button', { name: 'Create Sync' })
  })

  it('does not auto-open the add sync dialog when there are existing syncs', async () => {
    setupApolloMocks({
      syncs: [
        {
          id: 'sync1',
          spreadsheetId: 'spreadsheet1',
          sheetName: 'Sheet1',
          email: 'test@example.com',
          deletedAt: null,
          createdAt: '2024-01-01T00:00:00.000Z',
          integration: { __typename: 'IntegrationGoogle', id: 'integration1' }
        }
      ]
    })

    render(
      <GoogleSheetsSyncDialog open journeyId="journey1" onClose={onClose} />
    )

    // Wait for syncs to be fetched, then assert the create-sync modal is not shown
    await waitFor(() => {
      expect(loadSyncsMock).toHaveBeenCalled()
    })

    expect(
      screen.queryByRole('button', { name: 'Create Sync' })
    ).not.toBeInTheDocument()
  })
})
