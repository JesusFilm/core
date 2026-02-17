import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { FirebaseError } from 'firebase/app'
import {
  UserCredential,
  createUserWithEmailAndPassword,
  getAuth,
  linkWithCredential,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth'
import { NextRouter, useRouter } from 'next/router'

import {
  JourneyPublish,
  JourneyPublishVariables
} from '../../../../__generated__/JourneyPublish'
import { UpdateMe, UpdateMeVariables } from '../../../../__generated__/UpdateMe'

import { RegisterPage, JOURNEY_PUBLISH, UPDATE_ME } from './RegisterPage'

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({ currentUser: null })),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  updateProfile: jest.fn(),
  linkWithCredential: jest.fn(),
  EmailAuthProvider: {
    credential: jest.fn((email: string, password: string) => ({
      email,
      password
    }))
  }
}))

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('PasswordPage', () => {
  const back = jest.fn()

  const routerWithRedirect = {
    back: jest.fn(),
    push: jest.fn(),
    query: {
      redirect: '/templates/journey-123/customize'
    }
  } as unknown as NextRouter

  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      back,
      push: jest.fn(),
      query: {
        redirect: null
      }
    } as unknown as NextRouter)
  })

  it('should render register page', () => {
    render(
      <MockedProvider>
        <RegisterPage
          setActivePage={jest.fn()}
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
          setActivePage={jest.fn()}
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
      createUserWithEmailAndPassword as jest.MockedFunction<
        typeof createUserWithEmailAndPassword
      >

    const mockSignInWithEmailAndPassword =
      signInWithEmailAndPassword as jest.MockedFunction<
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
          setActivePage={jest.fn()}
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
    const mockGetAuth = getAuth as jest.MockedFunction<typeof getAuth>
    const mockLinkWithCredential = linkWithCredential as jest.MockedFunction<
      typeof linkWithCredential
    >
    const mockUpdateProfile = updateProfile as jest.MockedFunction<
      typeof updateProfile
    >
    const anonymousUser = { isAnonymous: true, uid: 'anon-123' }
    mockGetAuth.mockReturnValue({
      currentUser: anonymousUser
    } as ReturnType<typeof getAuth>)
    mockLinkWithCredential.mockResolvedValue({
      user: { uid: 'linked-user' }
    } as unknown as UserCredential)
    mockUseRouter.mockReturnValue(routerWithRedirect)

    const updateMeMock: MockedResponse<UpdateMe, UpdateMeVariables> = {
      request: {
        query: UPDATE_ME,
        variables: {
          input: {
            firstName: 'First',
            lastName: 'name last name',
            email: 'example@example.com'
          }
        }
      },
      result: jest.fn(() => ({
        data: {
          updateMe: {
            __typename: 'User',
            id: 'user-1',
            firstName: 'First',
            lastName: 'name last name',
            email: 'example@example.com'
          }
        }
      }))
    }

    const journeyPublishMock: MockedResponse<
      JourneyPublish,
      JourneyPublishVariables
    > = {
      request: {
        query: JOURNEY_PUBLISH,
        variables: { id: 'journey-123' }
      },
      result: jest.fn(() => ({
        data: {
          journeyPublish: {
            __typename: 'Journey',
            id: 'journey-123'
          }
        }
      }))
    }

    render(
      <MockedProvider mocks={[updateMeMock, journeyPublishMock]}>
        <RegisterPage
          setActivePage={jest.fn()}
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
      expect(updateMeMock.result).toHaveBeenCalled()
    })
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

    mockGetAuth.mockImplementation(
      () => ({ currentUser: null }) as ReturnType<typeof getAuth>
    )
  })

  it('should show error if existing email is entered', async () => {
    const mockCreateUserWithEmailAndPassword =
      createUserWithEmailAndPassword as jest.MockedFunction<
        typeof createUserWithEmailAndPassword
      >

    mockCreateUserWithEmailAndPassword.mockImplementation(() => {
      throw new FirebaseError('auth/email-already-in-use', 'error message text')
    })

    render(
      <MockedProvider>
        <RegisterPage
          setActivePage={jest.fn()}
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

  it('should validate password', async () => {
    render(
      <MockedProvider>
        <RegisterPage
          setActivePage={jest.fn()}
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
        <RegisterPage setActivePage={jest.fn()} userPassword="example" />
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
          setActivePage={jest.fn()}
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
          setActivePage={jest.fn()}
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
    const mockSetActivePage = jest.fn()
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
