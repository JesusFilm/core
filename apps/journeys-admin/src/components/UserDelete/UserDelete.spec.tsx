import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
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

jest.mock('notistack', () => ({
  useSnackbar: () => ({
    enqueueSnackbar: jest.fn()
  }),
  SnackbarProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}))

const mockUseSuspenseQuery = jest.fn()
jest.mock('@apollo/client', () => {
  const actual = jest.requireActual('@apollo/client')
  return {
    ...actual,
    useSuspenseQuery: (...args: unknown[]) => mockUseSuspenseQuery(...args)
  }
})

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
    mockUseSuspenseQuery.mockReturnValue({
      data: {
        me: {
          __typename: 'AuthenticatedUser',
          id: 'user-1',
          superAdmin: true
        }
      }
    })
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
    const { getAllByRole } = renderComponent()

    const deleteUserButtons = getAllByRole('button', { name: 'Delete User' })
    const actionBtn = deleteUserButtons[deleteUserButtons.length - 1]
    expect(actionBtn).toBeDisabled()
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
})
