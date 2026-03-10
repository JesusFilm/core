import { fireEvent, render, waitFor } from '@testing-library/react'
import { UserCredential, signInWithPopup } from 'firebase/auth'

import { SignInServiceButton } from './SignInServiceButton'

const mockSetCustomParameters = jest.fn()
const mockLoginWithCredential = jest.fn().mockResolvedValue(undefined)

jest.mock('firebase/auth', () => ({
  signInWithPopup: jest.fn(),
  GoogleAuthProvider: jest.fn().mockImplementation(() => {
    return { setCustomParameters: mockSetCustomParameters }
  }),
  FacebookAuthProvider: jest.fn().mockImplementation(() => {
    return { setCustomParameters: mockSetCustomParameters }
  }),
  OAuthProvider: jest.fn().mockImplementation(() => {
    return { setCustomParameters: mockSetCustomParameters }
  })
}))

jest.mock('../../../libs/auth', () => ({
  getFirebaseAuth: jest.fn(),
  loginWithCredential: (...args: unknown[]) =>
    mockLoginWithCredential(...args)
}))

const mockSignInWithPopup = signInWithPopup as jest.MockedFunction<
  typeof signInWithPopup
>

describe('SignInServiceButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should handle Google sign-in correctly', async () => {
    mockSignInWithPopup.mockResolvedValueOnce({} as unknown as UserCredential)

    const { getByRole } = render(<SignInServiceButton service="google.com" />)

    fireEvent.click(getByRole('button', { name: 'Continue with Google' }))
    await waitFor(() => expect(mockSignInWithPopup).toHaveBeenCalled())
    await waitFor(() => expect(mockLoginWithCredential).toHaveBeenCalled())
  })

  it('should handle Facebook sign-in correctly', async () => {
    mockSignInWithPopup.mockResolvedValueOnce({} as unknown as UserCredential)

    const { getByRole } = render(<SignInServiceButton service="facebook.com" />)

    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(mockSignInWithPopup).toHaveBeenCalled())
    await waitFor(() => expect(mockLoginWithCredential).toHaveBeenCalled())
  })

  it('should handle Okta sign-in correctly', async () => {
    mockSignInWithPopup.mockResolvedValueOnce({} as unknown as UserCredential)

    const { getByRole } = render(<SignInServiceButton service="oidc.okta" />)

    fireEvent.click(getByRole('button', { name: 'Continue with Okta' }))
    await waitFor(() => expect(mockSignInWithPopup).toHaveBeenCalled())
    await waitFor(() => expect(mockLoginWithCredential).toHaveBeenCalled())
  })
})
