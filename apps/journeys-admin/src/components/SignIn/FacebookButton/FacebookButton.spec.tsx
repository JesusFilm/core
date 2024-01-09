import { fireEvent, render, waitFor } from '@testing-library/react'
import { UserCredential, signInWithPopup } from 'firebase/auth'
import { NextRouter, useRouter } from 'next/router'

import { FacebookButton } from './FacebookButton'

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithPopup: jest.fn(),
  FacebookAuthProvider: jest.fn()
}))

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))
const mockSignInWithPopup = signInWithPopup as jest.MockedFunction<
  typeof signInWithPopup
>

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('FacebookButton', () => {
  it('handles Facebook sign-in correctly', async () => {
    mockSignInWithPopup.mockResolvedValueOnce({} as unknown as UserCredential)

    const push = jest.fn()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)

    const { getByRole } = render(<FacebookButton />)

    fireEvent.click(getByRole('button', { name: 'Sign in with Facebook' }))
    await waitFor(() => expect(mockSignInWithPopup).toHaveBeenCalled())
    expect(push).toHaveBeenCalledWith('/')
  })
})
