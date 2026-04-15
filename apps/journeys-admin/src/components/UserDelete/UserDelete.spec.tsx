import { ApolloError } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { ThemeProvider } from '../ThemeProvider'

import { UserDeleteWithErrorBoundary } from './UserDelete'

const mockPush = jest.fn()

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    query: {}
  })
}))

const mockEnqueueSnackbar = jest.fn()
jest.mock('notistack', () => ({
  useSnackbar: () => ({
    enqueueSnackbar: mockEnqueueSnackbar
  }),
  SnackbarProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}))

const mockUseSuspenseQuery = jest.fn()
const mockUseMutation = jest.fn()
const mockUseSubscription = jest.fn()

jest.mock('@apollo/client', () => {
  const actual = jest.requireActual('@apollo/client')
  return {
    ...actual,
    useSuspenseQuery: (...args: unknown[]) => mockUseSuspenseQuery(...args),
    useMutation: (...args: unknown[]) => mockUseMutation(...args),
    useSubscription: (...args: unknown[]) => mockUseSubscription(...args)
  }
})

const mockCheckMutate = jest.fn()
const mockJourneysCheckMutate = jest.fn()
const mockJourneysConfirmMutate = jest.fn()

function getOperationName(doc: unknown): string {
  return (doc as any)?.definitions?.[0]?.name?.value ?? ''
}

function setupMutations(): void {
  mockUseMutation.mockImplementation((doc: unknown) => {
    const name = getOperationName(doc)
    if (name === 'UserDeleteJourneysCheck')
      return [mockJourneysCheckMutate, { loading: false }]
    if (name === 'UserDeleteJourneysConfirm')
      return [mockJourneysConfirmMutate, { loading: false }]
    return [mockCheckMutate, { loading: false }]
  })
  mockUseSubscription.mockReturnValue({})
}

const superAdminData = {
  data: {
    me: { __typename: 'AuthenticatedUser', id: 'user-1', superAdmin: true }
  }
}

const renderComponent = (): ReturnType<typeof render> =>
  render(
    <ThemeProvider>
      <SnackbarProvider>
        <MockedProvider>
          <UserDeleteWithErrorBoundary />
        </MockedProvider>
      </SnackbarProvider>
    </ThemeProvider>
  )

describe('UserDeleteWithErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSuspenseQuery.mockReturnValue(superAdminData)
    setupMutations()
  })

  it('should render the form for superAdmin users', () => {
    const { getAllByText, getByText } = renderComponent()

    expect(getAllByText('Delete User').length).toBeGreaterThanOrEqual(1)
    expect(getByText('Check')).toBeInTheDocument()
    expect(getByText('Warning')).toBeInTheDocument()
  })

  it('should redirect non-superAdmin users', () => {
    mockUseSuspenseQuery.mockReturnValue({
      data: {
        me: {
          __typename: 'AuthenticatedUser',
          id: 'user-1',
          superAdmin: false
        }
      }
    })

    renderComponent()

    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('should render empty for non-superAdmin', () => {
    mockUseSuspenseQuery.mockReturnValue({
      data: {
        me: {
          __typename: 'AuthenticatedUser',
          id: 'user-1',
          superAdmin: false
        }
      }
    })

    const { queryByText } = renderComponent()

    expect(queryByText('Check')).not.toBeInTheDocument()
  })

  it('should have delete button disabled before check', () => {
    const { getByRole } = renderComponent()

    expect(getByRole('button', { name: 'Delete User' })).toBeDisabled()
  })

  it('should have check button disabled when input is empty', () => {
    const { getByText } = renderComponent()

    expect(getByText('Check').closest('button')).toBeDisabled()
  })

  it('should render lookup type selector with email as default', () => {
    const { getByLabelText } = renderComponent()

    expect(getByLabelText('Lookup By')).toBeInTheDocument()
  })

  it('should render logs textfield', () => {
    const { getByRole } = renderComponent()

    const logsField = getByRole('textbox', { name: 'Logs' })
    expect(logsField).toBeInTheDocument()
    expect(logsField).toHaveAttribute('readonly')
  })

  describe('check flow', () => {
    it('shows logs from both steps and enables delete button on success', async () => {
      mockCheckMutate.mockResolvedValue({
        data: {
          userDeleteCheck: {
            userId: 'firebase-uid-1',
            userEmail: 'test@example.com',
            userFirstName: 'Test',
            logs: [
              {
                message: 'User found: test@example.com',
                level: 'info',
                timestamp: '2024-01-01T00:00:00.000Z'
              }
            ]
          }
        }
      })
      mockJourneysCheckMutate.mockResolvedValue({
        data: {
          userDeleteJourneysCheck: {
            journeysToDelete: 2,
            journeysToTransfer: 0,
            journeysToRemove: 0,
            teamsToDelete: 1,
            teamsToTransfer: 0,
            teamsToRemove: 0,
            logs: [
              {
                message: 'Found 2 journeys to delete',
                level: 'info',
                timestamp: '2024-01-01T00:00:01.000Z'
              }
            ]
          }
        }
      })

      const { getByRole } = renderComponent()

      fireEvent.change(getByRole('textbox', { name: 'User email to delete' }), {
        target: { value: 'test@example.com' }
      })
      fireEvent.click(getByRole('button', { name: 'Check' }))

      await waitFor(() => {
        expect(getByRole('textbox', { name: 'Logs' }).value).toContain(
          'User found: test@example.com'
        )
      })

      expect(getByRole('textbox', { name: 'Logs' }).value).toContain(
        'Found 2 journeys to delete'
      )
      expect(getByRole('button', { name: 'Delete User' })).not.toBeDisabled()
    })

    it('preserves step 1 logs when step 2 fails', async () => {
      mockCheckMutate.mockResolvedValue({
        data: {
          userDeleteCheck: {
            userId: 'firebase-uid-1',
            userEmail: 'test@example.com',
            userFirstName: 'Test',
            logs: [
              {
                message: 'User found: test@example.com',
                level: 'info',
                timestamp: '2024-01-01T00:00:00.000Z'
              }
            ]
          }
        }
      })
      mockJourneysCheckMutate.mockRejectedValue(
        new ApolloError({ errorMessage: 'journeys service unavailable' })
      )

      const { getByRole } = renderComponent()

      fireEvent.change(getByRole('textbox', { name: 'User email to delete' }), {
        target: { value: 'test@example.com' }
      })
      fireEvent.click(getByRole('button', { name: 'Check' }))

      await waitFor(() => {
        expect(mockEnqueueSnackbar).toHaveBeenCalled()
      })

      // Step 1 logs must still be visible despite step 2 failing
      expect(getByRole('textbox', { name: 'Logs' }).value).toContain(
        'User found: test@example.com'
      )
    })
  })

  describe('delete flow', () => {
    async function runCheck(
      getByRole: ReturnType<typeof render>['getByRole']
    ): Promise<void> {
      mockCheckMutate.mockResolvedValue({
        data: {
          userDeleteCheck: {
            userId: 'firebase-uid-1',
            userEmail: 'test@example.com',
            userFirstName: 'Test',
            logs: [
              {
                message: 'User found',
                level: 'info',
                timestamp: '2024-01-01T00:00:00.000Z'
              }
            ]
          }
        }
      })
      mockJourneysCheckMutate.mockResolvedValue({
        data: {
          userDeleteJourneysCheck: {
            journeysToDelete: 0,
            journeysToTransfer: 0,
            journeysToRemove: 0,
            teamsToDelete: 0,
            teamsToTransfer: 0,
            teamsToRemove: 0,
            logs: [
              {
                message: 'No journeys to delete',
                level: 'info',
                timestamp: '2024-01-01T00:00:01.000Z'
              }
            ]
          }
        }
      })

      fireEvent.change(getByRole('textbox', { name: 'User email to delete' }), {
        target: { value: 'test@example.com' }
      })
      fireEvent.click(getByRole('button', { name: 'Check' }))

      await waitFor(() => {
        expect(getByRole('button', { name: 'Delete User' })).not.toBeDisabled()
      })
    }

    it('shows success snackbar after full happy path deletion', async () => {
      let capturedOnData: ((opts: unknown) => void) | null = null
      mockUseSubscription.mockImplementation(
        (_doc: unknown, opts: { onData?: (o: unknown) => void }) => {
          if (opts?.onData != null) capturedOnData = opts.onData
          return {}
        }
      )

      mockJourneysConfirmMutate.mockResolvedValue({
        data: {
          userDeleteJourneysConfirm: {
            success: true,
            deletedJourneyIds: ['j1'],
            deletedTeamIds: [],
            deletedUserJourneyIds: ['uj1'],
            deletedUserTeamIds: [],
            logs: [
              {
                message: 'Journeys deleted successfully',
                level: 'info',
                timestamp: '2024-01-01T00:00:02.000Z'
              }
            ]
          }
        }
      })

      const { getByRole, getByText } = renderComponent()
      await runCheck(getByRole)

      fireEvent.click(getByRole('button', { name: 'Delete User' }))
      await waitFor(() =>
        expect(getByText('Confirm User Deletion')).toBeInTheDocument()
      )
      fireEvent.click(getByRole('button', { name: 'Delete Permanently' }))

      await waitFor(() => {
        expect(mockJourneysConfirmMutate).toHaveBeenCalledWith({
          variables: { userId: 'firebase-uid-1' }
        })
      })

      // Simulate subscription emitting completion
      act(() => {
        capturedOnData?.({
          data: {
            data: {
              userDeleteConfirm: {
                log: {
                  message: 'User deleted successfully',
                  level: 'info',
                  timestamp: '2024-01-01T00:00:03.000Z'
                },
                done: true,
                success: true
              }
            }
          }
        })
      })

      await waitFor(() => {
        expect(mockEnqueueSnackbar).toHaveBeenCalledWith('User deleted successfully', {
          variant: 'success'
        })
      })
    })

    it('shows error snackbar when journeys confirm returns failure', async () => {
      mockJourneysConfirmMutate.mockResolvedValue({
        data: {
          userDeleteJourneysConfirm: {
            success: false,
            deletedJourneyIds: [],
            deletedTeamIds: [],
            deletedUserJourneyIds: [],
            deletedUserTeamIds: [],
            logs: [
              {
                message: 'Failed to delete journeys',
                level: 'error',
                timestamp: '2024-01-01T00:00:02.000Z'
              }
            ]
          }
        }
      })

      const { getByRole, getByText } = renderComponent()
      await runCheck(getByRole)

      fireEvent.click(getByRole('button', { name: 'Delete User' }))
      await waitFor(() =>
        expect(getByText('Confirm User Deletion')).toBeInTheDocument()
      )
      fireEvent.click(getByRole('button', { name: 'Delete Permanently' }))

      await waitFor(() => {
        expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
          'Journeys cleanup failed. Check logs for details.',
          { variant: 'error' }
        )
      })
    })
  })
})
