import { fireEvent, render, waitFor } from '@testing-library/react'
import { FirebaseError } from 'firebase/app'
import { signInWithEmailAndPassword } from 'firebase/auth'

import { PasswordPage } from './PasswordPage'

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn()
}))

describe('PasswordPage', () => {
  it('should render password page', () => {
    const { getByText, getByLabelText } = render(
      <PasswordPage userEmail="example@example.com" userPassword="example" />
    )

    expect(getByText('Sign in')).toBeInTheDocument()
    expect(getByLabelText('Email')).toHaveValue('example@example.com')
    expect(getByLabelText('Password')).toHaveValue('example')
  })

  it('should require user to enter a password', async () => {
    const { getByText, getByRole } = render(
      <PasswordPage userEmail="example@example.com" />
    )

    fireEvent.click(getByRole('button', { name: 'Sign In' }))
    await waitFor(() =>
      expect(getByText('Enter your password')).toBeInTheDocument()
    )
  })

  it('should sign user in if password is correct', async () => {
    const mockSignInWithEmailAndPassword =
      signInWithEmailAndPassword as jest.MockedFunction<
        typeof signInWithEmailAndPassword
      >

    const { getByLabelText, getByRole } = render(
      <PasswordPage userEmail="example@example.com" />
    )

    fireEvent.change(getByLabelText('Password'), {
      target: { value: 'Password' }
    })
    fireEvent.click(getByRole('button', { name: 'Sign In' }))

    await waitFor(() => {
      expect(mockSignInWithEmailAndPassword).toHaveBeenCalled()
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
    fireEvent.click(getByRole('button', { name: 'Sign In' }))

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
    fireEvent.click(getByRole('button', { name: 'Sign In' }))

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

  it('should take user to help page if they have forgotten their password', async () => {
    const mockSetActivePage = jest.fn()

    const { getByText } = render(
      <PasswordPage
        setActivePage={mockSetActivePage}
        userEmail="example@example.com"
      />
    )

    fireEvent.click(getByText('Forgot your password?'))
    await waitFor(() => {
      expect(mockSetActivePage).toHaveBeenCalledWith('help')
    })
  })

  it('should take user to home page on pressing cancel', async () => {
    const mockSetActivePage = jest.fn()

    const { getByRole } = render(
      <PasswordPage
        setActivePage={mockSetActivePage}
        userEmail="example@example.com"
      />
    )

    fireEvent.click(getByRole('button', { name: 'Cancel' }))
    await waitFor(() => {
      expect(mockSetActivePage).toHaveBeenCalledWith('home')
    })
  })

  it('should toggle password visibility on clicking eye', async () => {
    const { getByLabelText } = render(
      <PasswordPage
        setActivePage={jest.fn()}
        userEmail="example@example.com"
        userPassword="example"
      />
    )
    const passwordInput = getByLabelText('Password')
    expect(passwordInput).toHaveAttribute('type', 'password')

    fireEvent.click(getByLabelText('toggle password visibility'))
    expect(passwordInput).toHaveAttribute('type', 'text')
  })
})
