import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { UserCredential, signInWithCustomToken } from 'firebase/auth'
import { SnackbarProvider } from 'notistack'

import { USER_IMPERSONATE } from './ImpersonateDialog'

import { ImpersonateDialog } from '.'

const mockLoginWithCredential = jest.fn().mockResolvedValue(undefined)

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  signInWithCustomToken: jest.fn()
}))

jest.mock('../../../../../libs/auth', () => ({
  loginWithCredential: (...args: unknown[]) => mockLoginWithCredential(...args)
}))

const mockSignInWithCustomToken = signInWithCustomToken as jest.MockedFunction<
  typeof signInWithCustomToken
>

const onClose = jest.fn()

describe('JourneyView/Menu/ImpersonateDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should not set journey impersonate on close', async () => {
    const { getByRole } = render(
      <MockedProvider mocks={[]}>
        <SnackbarProvider>
          <ImpersonateDialog open onClose={onClose} />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.change(getByRole('textbox'), {
      target: { value: 'New Impersonate' }
    })
    fireEvent.click(getByRole('button', { name: 'Cancel' }))

    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })

  it('should impersonate user on submit', async () => {
    const credential = { user: {} } as unknown as UserCredential
    mockSignInWithCustomToken.mockResolvedValue(credential)

    const result = jest.fn(() => ({
      data: {
        userImpersonate: 'accessToken'
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: USER_IMPERSONATE,
              variables: { email: 'bob.jones@example.com' }
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <ImpersonateDialog open onClose={onClose} />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.change(getByRole('textbox'), {
      target: { value: 'bob.jones@example.com' }
    })
    fireEvent.click(getByRole('button', { name: 'Impersonate' }))

    await waitFor(() => {
      expect(result).toHaveBeenCalled()
    })
    // signs in as the impersonated user, then refreshes the server-side
    // session cookie so SSR runs as that user (otherwise journey edits 403)
    await waitFor(() => {
      expect(mockSignInWithCustomToken).toHaveBeenCalledWith({}, 'accessToken')
    })
    expect(mockLoginWithCredential).toHaveBeenCalledWith(credential)
  })

  it('shows notistack error alert when impersonate fails to update', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: USER_IMPERSONATE,
              variables: { email: 'bob.jones@example.com' }
            }
          }
        ]}
      >
        <SnackbarProvider>
          <ImpersonateDialog open onClose={onClose} />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.change(getByRole('textbox'), {
      target: { value: 'bob.jones@example.com' }
    })
    fireEvent.click(getByRole('button', { name: 'Impersonate' }))
    await waitFor(() =>
      expect(
        getByText('Impersonation failed. Reload the page or try again.')
      ).toBeInTheDocument()
    )
  })
})
