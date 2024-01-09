import { fireEvent, render, waitFor } from '@testing-library/react'
import { UserCredential, signInWithPopup } from 'firebase/auth'
import { NextRouter, useRouter } from 'next/router'

import { GoogleButton } from './GoogleButton'

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithPopup: jest.fn(),
  GoogleAuthProvider: jest.fn()
}))

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))
const mockSignInWithPopup = signInWithPopup as jest.MockedFunction<
  typeof signInWithPopup
>

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('GoogleButton', () => {
  it('handles Google sign-in correctly', async () => {
    mockSignInWithPopup.mockResolvedValueOnce({} as unknown as UserCredential)

    const push = jest.fn()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)

    const { getByRole } = render(<GoogleButton />)

    fireEvent.click(getByRole('button', { name: 'Sign in with Google' }))
    await waitFor(() => expect(mockSignInWithPopup).toHaveBeenCalled())
    expect(push).toHaveBeenCalledWith('/')
  })
})
