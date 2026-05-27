import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { FirebaseError } from 'firebase/app'
import {
  UserCredential,
  createUserWithEmailAndPassword,
  linkWithCredential,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth'
import { NextRouter, useRouter } from 'next/router'
import { type MockedFunction } from 'vitest'

import {
  JourneyPublish,
  JourneyPublishVariables
} from '../../../../__generated__/JourneyPublish'
import { getFirebaseAuth } from '../../../libs/auth'

import { JOURNEY_PUBLISH, RegisterPage } from './RegisterPage'

const mockLoginWithCredential = vi.fn().mockResolvedValue(undefined)

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn(),
  linkWithCredential: vi.fn(),
  EmailAuthProvider: {
    credential: vi.fn((email: string, password: string) => ({
      email,
      password
    }))
  }
}))

const mockLogin = vi.fn().mockResolvedValue(undefined)

vi.mock('../../../libs/auth', () => ({
  getFirebaseAuth: vi.fn(() => ({ currentUser: null })),
  login: (...args: unknown[]) => mockLogin(...args),
  loginWithCredential: (...args: unknown[]) => mockLoginWithCredential(...args)
}))

vi.mock('../../../libs/pendingGuestJourney', () => ({
  getPendingGuestJourney: vi.fn(() => null),
  clearPendingGuestJourney: vi.fn()
}))

vi.mock('next/router', () => ({
  __esModule: true,
  useRouter: vi.fn()
}))
const mockUseRouter = useRouter as MockedFunction<typeof useRouter>

describe('PasswordPage', () => {
  const back = vi.fn()

  const routerWithRedirect = {
    back: vi.fn(),
    push: vi.fn(),
    query: {
      redirect: '/templates/journey-123/customize'
    }
  } as unknown as NextRouter

  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      back,
      push: vi.fn(),
      query: {
        redirect: null
      }
    } as unknown as NextRouter)
  })

  it('should render register page', () => {
    render(
      <MockedProvider>
        <RegisterPage
          setActivePage={vi.fn()}
          userEmail="example@example.com"
        />
      </MockedProvider>
    )

    expect(screen.getByText('Create account')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveValue(
      'example@example.com'
    )
  })

  it('should require user to enter a name and password', async () => {
    render(
      <MockedProvider>
        <RegisterPage
          setActivePage={vi.fn()}
          userEmail="example@example.com"
        />
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }))
    await waitFor(() =>
      expect(screen.getByText('Enter your password')).toBeInTheDocument()
    )
    expect(screen.getByText('Enter your account name')).toBeInTheDocument()
  })

  it('should allow user to create an account', async () => {
    const mockCreateUserWithEmailAndPassword =
      createUserWithEmailAndPassword as MockedFunction<
        typeof createUserWithEmailAndPassword
      >

    const mockSignInWithEmailAndPassword =
      signInWithEmailAndPassword as MockedFunction<
        typeof signInWithEmailAndPassword
      >

    mockCreateUserWithEmailAndPassword.mockResolvedValue({
      user: {
        uid: '123'
      }
    } as unknown as UserCredential)

    render(
      <MockedProvider>
        <RegisterPage
          setActivePage={vi.fn()}
          userEmail="example@example.com"
        />
      </MockedProvider>
    )

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'First name last name' }
    })

    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'Password' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }))

    await waitFor(() => {
      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(mockSignInWithEmailAndPassword).toHaveBeenCalled()
    })
  })

  it('should convert anonymous account to permanent account', async () => {
    const mockGetFirebaseAuth = getFirebaseAuth as MockedFunction<
      typeof getFirebaseAuth
    >
    const mockLinkWithCredential = linkWithCredential as MockedFunction<
      typeof linkWithCredential
    >
    const mockUpdateProfile = updateProfile as MockedFunction<
      typeof updateProfile
    >
    const anonymousUser = { isAnonymous: true, uid: 'anon-123' }
    mockGetFirebaseAuth.mockReturnValue({
      currentUser: anonymousUser
    } as ReturnType<typeof getFirebaseAuth>)
    mockLinkWithCredential.mockResolvedValue({
      user: { uid: 'linked-user' }
    } as unknown as UserCredential)
    mockUseRouter.mockReturnValue(routerWithRedirect)

    const journeyPublishMock: MockedResponse<
      JourneyPublish,
      JourneyPublishVariables
    > = {
      request: {
        query: JOURNEY_PUBLISH,
        variables: { id: 'journey-123' }
      },
      result: vi.fn(() => ({
        data: {
          journeyPublish: {
            __typename: 'Journey',
            id: 'journey-123'
          }
        }
      })) as MockedResponse<JourneyPublish, JourneyPublishVariables>['result']
    }

    render(
      <MockedProvider mocks={[journeyPublishMock]}>
        <RegisterPage
          setActivePage={vi.fn()}
          userEmail="example@example.com"
        />
      </MockedProvider>
    )

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'First name last name' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'Password' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }))

    await waitFor(() => {
      expect(journeyPublishMock.result).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(mockLinkWithCredential).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith(expect.anything(), {
        displayName: 'First name last name'
      })
    })

    mockGetFirebaseAuth.mockImplementation(
      () => ({ currentUser: null }) as ReturnType<typeof getFirebaseAuth>
    )
  })

  it('should show error if existing email is entered', async () => {
    const mockCreateUserWithEmailAndPassword =
      createUserWithEmailAndPassword as MockedFunction<
        typeof createUserWithEmailAndPassword
      >

    mockCreateUserWithEmailAndPassword.mockImplementation(() => {
      throw new FirebaseError('auth/email-already-in-use', 'error message text')
    })

    render(
      <MockedProvider>
        <RegisterPage
          setActivePage={vi.fn()}
          userEmail="example@example.com"
        />
      </MockedProvider>
    )

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'First name last name' }
    })

    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'Password' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }))

    await waitFor(() => {
      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(
        screen.getByText('The email address is already used by another account')
      ).toBeInTheDocument()
    })
  })

  it('should fallback to signInWithEmailAndPassword when anonymous and email-already-in-use', async () => {
    const mockGetFirebaseAuth = getFirebaseAuth as MockedFunction<
      typeof getFirebaseAuth
    >
    const mockLinkWithCredential = linkWithCredential as MockedFunction<
      typeof linkWithCredential
    >
    const mockSignInWithEmailAndPassword =
      signInWithEmailAndPassword as MockedFunction<
        typeof signInWithEmailAndPassword
      >

    const anonymousUser = { isAnonymous: true, uid: 'anon-123' }
    mockGetFirebaseAuth.mockReturnValue({
      currentUser: anonymousUser
    } as ReturnType<typeof getFirebaseAuth>)

    mockLinkWithCredential.mockRejectedValue(
      new FirebaseError('auth/email-already-in-use', 'email already in use')
    )

    const signedInCredential = {
      user: { getIdToken: vi.fn().mockResolvedValue('new-token') }
    } as unknown as UserCredential
    mockSignInWithEmailAndPassword.mockResolvedValue(signedInCredential)

    render(
      <MockedProvider>
        <RegisterPage
          setActivePage={vi.fn()}
          userEmail="example@example.com"
        />
      </MockedProvider>
    )

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'First name last name' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'Password' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }))

    await waitFor(() => {
      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'example@example.com',
        'Password'
      )
    })
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('new-token')
    })

    mockGetFirebaseAuth.mockImplementation(
      () => ({ currentUser: null }) as ReturnType<typeof getFirebaseAuth>
    )
  })

  it('should validate password', async () => {
    render(
      <MockedProvider>
        <RegisterPage
          setActivePage={vi.fn()}
          userEmail="example@example.com"
        />
      </MockedProvider>
    )
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: '123' }
    })
    fireEvent.blur(screen.getByLabelText('Password'))
    await waitFor(() =>
      expect(
        screen.getByText('Password must be at least 6 characters long')
      ).toBeInTheDocument()
    )
  })

  it('should toggle password visibility on clicking eye', async () => {
    render(
      <MockedProvider>
        <RegisterPage setActivePage={vi.fn()} userPassword="example" />
      </MockedProvider>
    )
    const passwordInput = screen.getByLabelText('Password')
    expect(passwordInput).toHaveAttribute('type', 'password')

    fireEvent.click(screen.getByLabelText('toggle password visibility'))
    expect(passwordInput).toHaveAttribute('type', 'text')
  })

  it('should check if name is too short', async () => {
    render(
      <MockedProvider>
        <RegisterPage
          setActivePage={vi.fn()}
          userEmail="example@example.com"
        />
      </MockedProvider>
    )
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'a' }
    })
    fireEvent.blur(screen.getByLabelText('Name'))
    await waitFor(() =>
      expect(screen.getByText('Too Short!')).toBeInTheDocument()
    )
  })

  it('should check if name is too long', async () => {
    render(
      <MockedProvider>
        <RegisterPage
          setActivePage={vi.fn()}
          userEmail="example@example.com"
        />
      </MockedProvider>
    )
    fireEvent.change(screen.getByLabelText('Name'), {
      target: {
        value:
          'This is a very very very very very very very very very very very very very very long name'
      }
    })
    fireEvent.blur(screen.getByLabelText('Name'))
    await waitFor(() =>
      expect(screen.getByText('Too Long!')).toBeInTheDocument()
    )
  })

  it('should go back to home page when cancel is clicked', async () => {
    const mockSetActivePage = vi.fn()
    render(
      <MockedProvider>
        <RegisterPage
          setActivePage={mockSetActivePage}
          userEmail="example@example.com"
        />
      </MockedProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(mockSetActivePage).toHaveBeenCalledWith('home')
    })
  })

  it('should navigate back when clicking cancel button', () => {
    render(
      <MockedProvider>
        <RegisterPage />
      </MockedProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(back).toHaveBeenCalled()
  })
})
