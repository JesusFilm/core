import { fireEvent, render, waitFor } from '@testing-library/react'
import { signInWithEmailAndPassword } from 'firebase/auth'

import { PasswordPage } from './PasswordPage'

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn()
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

  it('should check if the user password is correct', async () => {
    const mockSignInWithEmailAndPassword =
      signInWithEmailAndPassword as jest.MockedFunction<
        typeof signInWithEmailAndPassword
      >

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
