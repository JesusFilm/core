import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'

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
  })
}))

const mockUseSuspenseQuery = jest.fn()
jest.mock('@apollo/client', () => {
  const actual = jest.requireActual('@apollo/client')
  return {
    ...actual,
    useSuspenseQuery: (...args: unknown[]) => mockUseSuspenseQuery(...args)
  }
})

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
    const { getAllByText, getByText } = render(
      <MockedProvider>
        <UserDeleteWithErrorBoundary />
      </MockedProvider>
    )

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

    render(
      <MockedProvider>
        <UserDeleteWithErrorBoundary />
      </MockedProvider>
    )

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

    const { queryByText } = render(
      <MockedProvider>
        <UserDeleteWithErrorBoundary />
      </MockedProvider>
    )

    expect(queryByText('Check')).not.toBeInTheDocument()
  })

  it('should have delete button disabled before check', () => {
    const { getAllByRole } = render(
      <MockedProvider>
        <UserDeleteWithErrorBoundary />
      </MockedProvider>
    )

    const deleteUserButtons = getAllByRole('button', { name: 'Delete User' })
    const actionBtn = deleteUserButtons[deleteUserButtons.length - 1]
    expect(actionBtn).toBeDisabled()
  })

  it('should have check button disabled when input is empty', () => {
    const { getByText } = render(
      <MockedProvider>
        <UserDeleteWithErrorBoundary />
      </MockedProvider>
    )

    expect(getByText('Check').closest('button')).toBeDisabled()
  })

  it('should render lookup type selector with email as default', () => {
    const { getByLabelText } = render(
      <MockedProvider>
        <UserDeleteWithErrorBoundary />
      </MockedProvider>
    )

    expect(getByLabelText('Lookup By')).toBeInTheDocument()
  })

  it('should render logs textfield', () => {
    const { getByRole } = render(
      <MockedProvider>
        <UserDeleteWithErrorBoundary />
      </MockedProvider>
    )

    const logsField = getByRole('textbox', { name: 'Logs' })
    expect(logsField).toBeInTheDocument()
    expect(logsField).toHaveAttribute('readonly')
  })
})
