import { fireEvent, render, waitFor } from '@testing-library/react'
import { FirebaseError } from 'firebase/app'
import {
  UserCredential,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword
} from 'firebase/auth'
import { type MockedFunction } from 'vitest'

import { getFirebaseAuth } from '../../../libs/auth'

import { PasswordPage } from './PasswordPage'

const mockLoginWithCredential = vi.fn().mockResolvedValue(undefined)
const mockLogin = vi.fn().mockResolvedValue(undefined)
const mockFirebaseSignOut = firebaseSignOut as MockedFunction<
  typeof firebaseSignOut
>

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('../../../libs/auth', () => ({
  getFirebaseAuth: vi.fn(() => ({ currentUser: null })),
  login: (...args: unknown[]) => mockLogin(...args),
  loginWithCredential: (...args: unknown[]) => mockLoginWithCredential(...args)
}))

vi.mock('../../../libs/pendingGuestJourney', () => ({
  getPendingGuestJourney: vi.fn(() => null),
  clearPendingGuestJourney: vi.fn()
}))

const mockGetFirebaseAuth = getFirebaseAuth as MockedFunction<
  typeof getFirebaseAuth
>

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
      signInWithEmailAndPassword as MockedFunction<
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
      signInWithEmailAndPassword as MockedFunction<
        typeof signInWithEmailAndPassword
      >

    mockSignInWithEmailAndPassword.mockImplementation(() => {
      throw new FirebaseError('auth/wrong-password', 'error message text')
    })

    const { getByLabelText, getByRole, getByText } = render(
      <PasswordPage setActivePage={vi.fn()} userEmail="example@example.com" />
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
      signInWithEmailAndPassword as MockedFunction<
        typeof signInWithEmailAndPassword
      >

    mockSignInWithEmailAndPassword.mockImplementation(() => {
      throw new FirebaseError('auth/too-many-requests', 'error message text')
    })

    const { getByLabelText, getByRole, getByText } = render(
      <PasswordPage setActivePage={vi.fn()} userEmail="example@example.com" />
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
    const mockSetActivePage = vi.fn()

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
    const mockSetActivePage = vi.fn()

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
        setActivePage={vi.fn()}
        userEmail="example@example.com"
        userPassword="example"
      />
    )
    const passwordInput = getByLabelText('Password')
    expect(passwordInput).toHaveAttribute('type', 'password')

    fireEvent.click(getByLabelText('toggle password visibility'))
    expect(passwordInput).toHaveAttribute('type', 'text')
  })

  it('should sign out anonymous user before signing in', async () => {
    const anonymousUser = { isAnonymous: true, uid: 'anon-123' }
    mockGetFirebaseAuth.mockReturnValue({
      currentUser: anonymousUser
    } as ReturnType<typeof getFirebaseAuth>)

    const mockSignInWithEmailAndPassword =
      signInWithEmailAndPassword as MockedFunction<
        typeof signInWithEmailAndPassword
      >
    mockSignInWithEmailAndPassword.mockResolvedValueOnce({
      user: { getIdToken: vi.fn().mockResolvedValue('token') }
    } as unknown as UserCredential)

    const { getByLabelText, getByRole } = render(
      <PasswordPage setActivePage={vi.fn()} userEmail="example@example.com" />
    )

    fireEvent.change(getByLabelText('Password'), {
      target: { value: 'Password' }
    })
    fireEvent.click(getByRole('button', { name: 'Sign In' }))

    await waitFor(() => {
      expect(mockFirebaseSignOut).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(mockSignInWithEmailAndPassword).toHaveBeenCalled()
    })

    mockGetFirebaseAuth.mockImplementation(
      () => ({ currentUser: null }) as ReturnType<typeof getFirebaseAuth>
    )
  })
})
