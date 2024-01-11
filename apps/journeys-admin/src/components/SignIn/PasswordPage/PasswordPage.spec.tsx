import { fireEvent, render, waitFor } from '@testing-library/react'
import { FirebaseError } from 'firebase/app'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { NextRouter, useRouter } from 'next/router'

import { PasswordPage } from './PasswordPage'

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn()
}))

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

describe('PasswordPage', () => {
  it('should render password page', () => {
    const { getByText, getByRole } = render(
      <PasswordPage setActivePage={jest.fn()} userEmail="example@example.com" />
    )

    expect(getByText('Sign in')).toBeInTheDocument()
    expect(getByRole('textbox', { name: 'Email' })).toHaveValue(
      'example@example.com'
    )
  })

  it('should require user to enter a password', async () => {
    const { getByText, getByRole } = render(
      <PasswordPage setActivePage={jest.fn()} userEmail="example@example.com" />
    )

    fireEvent.click(getByRole('button', { name: 'SIGN IN' }))
    await waitFor(() =>
      expect(getByText('Enter your password')).toBeInTheDocument()
    )
  })

  it('should sign user in if password is correct', async () => {
    const mockSignInWithEmailAndPassword =
      signInWithEmailAndPassword as jest.MockedFunction<
        typeof signInWithEmailAndPassword
      >

    const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
    const push = jest.fn()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)

    const { getByLabelText, getByRole } = render(
      <PasswordPage setActivePage={jest.fn()} userEmail="example@example.com" />
    )

    fireEvent.change(getByLabelText('Password'), {
      target: { value: 'Password' }
    })
    fireEvent.click(getByRole('button', { name: 'SIGN IN' }))

    await waitFor(() => {
      expect(mockSignInWithEmailAndPassword).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith({
        pathname: '/'
      })
    })
  })

  it('should show error text if password is incorrect', async () => {
    const mockSignInWithEmailAndPassword =
      signInWithEmailAndPassword as jest.MockedFunction<
        typeof signInWithEmailAndPassword
      >

    mockSignInWithEmailAndPassword.mockImplementation(() => {
      throw new FirebaseError('auth/wrong-password', 'error message text')
    })

    const { getByLabelText, getByRole, getByText } = render(
      <PasswordPage setActivePage={jest.fn()} userEmail="example@example.com" />
    )

    fireEvent.change(getByLabelText('Password'), {
      target: { value: 'Wrong Password' }
    })
    fireEvent.click(getByRole('button', { name: 'SIGN IN' }))

    await waitFor(() => {
      expect(mockSignInWithEmailAndPassword).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(
        getByText("The email and password you entered don't match")
      ).toBeInTheDocument()
    })
  })

  it('should show error text if user makes too many login attempts', async () => {
    const mockSignInWithEmailAndPassword =
      signInWithEmailAndPassword as jest.MockedFunction<
        typeof signInWithEmailAndPassword
      >

    mockSignInWithEmailAndPassword.mockImplementation(() => {
      throw new FirebaseError('auth/too-many-requests', 'error message text')
    })

    const { getByLabelText, getByRole, getByText } = render(
      <PasswordPage setActivePage={jest.fn()} userEmail="example@example.com" />
    )

    fireEvent.change(getByLabelText('Password'), {
      target: { value: 'Password after too many requests' }
    })
    fireEvent.click(getByRole('button', { name: 'SIGN IN' }))

    await waitFor(() => {
      expect(mockSignInWithEmailAndPassword).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(
        getByText(
          'You have entered an incorrect password too many times. Please try again in a few minutes.'
        )
      ).toBeInTheDocument()
    })
  })

  it('should take user to help page if they have trouble signing in', async () => {
    const mockSetActivePage = jest.fn()

    const { getByRole } = render(
      <PasswordPage
        setActivePage={mockSetActivePage}
        userEmail="example@example.com"
      />
    )

    fireEvent.click(getByRole('button', { name: 'Trouble signing in?' }))
    await waitFor(() => {
      expect(mockSetActivePage).toHaveBeenCalledWith('help')
    })
  })
})
