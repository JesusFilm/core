import { fireEvent, render, waitFor } from '@testing-library/react'
import { UserCredential, signInWithPopup } from 'firebase/auth'
import { NextRouter, useRouter } from 'next/router'

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

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))
const mockSignInWithPopup = signInWithPopup as jest.MockedFunction<
  typeof signInWithPopup
>

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('SignInServiceButton', () => {
  it('should handle Google sign-in correctly', async () => {
    mockSignInWithPopup.mockResolvedValueOnce({} as unknown as UserCredential)

    const push = jest.fn()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)

    const { getByRole } = render(<SignInServiceButton service="google.com" />)

    fireEvent.click(getByRole('button', { name: 'Sign in with Google' }))
    await waitFor(() => expect(mockSignInWithPopup).toHaveBeenCalled())
    expect(push).toHaveBeenCalledWith('/')
  })

  it('should handle Facebook sign-in correctly', async () => {
    mockSignInWithPopup.mockResolvedValueOnce({} as unknown as UserCredential)

    const push = jest.fn()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)

    const { getByRole } = render(<SignInServiceButton service="facebook.com" />)

    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(mockSignInWithPopup).toHaveBeenCalled())
    expect(push).toHaveBeenCalledWith('/')
  })
})
