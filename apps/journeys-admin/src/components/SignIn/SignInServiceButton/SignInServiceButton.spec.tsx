import { fireEvent, render, waitFor } from '@testing-library/react'
import { UserCredential, signInWithPopup } from 'firebase/auth'

import { SignInServiceButton } from './SignInServiceButton'

const mockSetCustomParameters = jest.fn()

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithPopup: jest.fn(),
  GoogleAuthProvider: jest.fn().mockImplementation(() => {
    return { setCustomParameters: mockSetCustomParameters }
  }),
  FacebookAuthProvider: jest.fn().mockImplementation(() => {
    return { setCustomParameters: mockSetCustomParameters }
  })
}))

const mockSignInWithPopup = signInWithPopup as jest.MockedFunction<
  typeof signInWithPopup
>

describe('SignInServiceButton', () => {
  it('should handle Google sign-in correctly', async () => {
    mockSignInWithPopup.mockResolvedValueOnce({} as unknown as UserCredential)

    const { getByRole } = render(<SignInServiceButton service="google.com" />)

    fireEvent.click(getByRole('button', { name: 'Sign in with Google' }))
    await waitFor(() => expect(mockSignInWithPopup).toHaveBeenCalled())
  })

  it('should handle Facebook sign-in correctly', async () => {
    mockSignInWithPopup.mockResolvedValueOnce({} as unknown as UserCredential)

    const { getByRole } = render(<SignInServiceButton service="facebook.com" />)

    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(mockSignInWithPopup).toHaveBeenCalled())
  })
})
