import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import {
  OAuthProvider,
  UserCredential,
  linkWithPopup,
  signInWithCredential,
  signInWithPopup
} from 'firebase/auth'
import { NextRouter, useRouter } from 'next/router'

import {
  JourneyPublish,
  JourneyPublishVariables
} from '../../../../__generated__/JourneyPublish'
import { getFirebaseAuth } from '../../../libs/auth'
import { JOURNEY_PUBLISH } from '../RegisterPage/RegisterPage'

import { SignInServiceButton } from './SignInServiceButton'

const mockSetCustomParameters = jest.fn()
const mockLoginWithCredential = jest.fn().mockResolvedValue(undefined)
const mockLogin = jest.fn().mockResolvedValue(undefined)

jest.mock('firebase/auth', () => {
  const credentialFromError = jest.fn()
  const OAuthProviderMock: jest.Mock & {
    credentialFromError: jest.Mock
  } = Object.assign(
    jest.fn().mockImplementation(() => ({
      setCustomParameters: jest.fn()
    })),
    { credentialFromError }
  )
  return {
    signInWithPopup: jest.fn(),
    signInWithCredential: jest.fn(),
    linkWithPopup: jest.fn(),
    OAuthProvider: OAuthProviderMock,
    GoogleAuthProvider: jest.fn().mockImplementation(() => ({
      setCustomParameters: jest.fn()
    })),
    FacebookAuthProvider: jest.fn().mockImplementation(() => ({
      setCustomParameters: jest.fn()
    }))
  }
})

jest.mock('../../../libs/auth', () => ({
  getFirebaseAuth: jest.fn(() => ({ currentUser: null })),
  login: (...args: unknown[]) => mockLogin(...args),
  loginWithCredential: (...args: unknown[]) => mockLoginWithCredential(...args)
}))

jest.mock('../../../libs/pendingGuestJourney', () => ({
  getPendingGuestJourney: jest.fn(() => null),
  clearPendingGuestJourney: jest.fn()
}))

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockSignInWithPopup = signInWithPopup as jest.MockedFunction<
  typeof signInWithPopup
>
const mockSignInWithCredential = signInWithCredential as jest.MockedFunction<
  typeof signInWithCredential
>
const mockGetFirebaseAuth = getFirebaseAuth as jest.MockedFunction<
  typeof getFirebaseAuth
>
const mockLinkWithPopup = linkWithPopup as jest.MockedFunction<
  typeof linkWithPopup
>
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { OAuthProvider: MockedOAuthProvider } = require('firebase/auth')
const mockCredentialFromError = MockedOAuthProvider.credentialFromError as jest.Mock
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('SignInServiceButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetFirebaseAuth.mockReturnValue({
      currentUser: null
    } as ReturnType<typeof getFirebaseAuth>)
    mockUseRouter.mockReturnValue({
      back: jest.fn(),
      push: jest.fn(),
      query: {}
    } as unknown as NextRouter)
  })

  it('should handle Google sign-in correctly', async () => {
    mockSignInWithPopup.mockResolvedValueOnce({} as unknown as UserCredential)

    render(
      <MockedProvider>
        <SignInServiceButton service="google.com" />
      </MockedProvider>
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Continue with Google' })
    )
    await waitFor(() => expect(mockSignInWithPopup).toHaveBeenCalled())
    await waitFor(() => expect(mockLoginWithCredential).toHaveBeenCalled())
  })

  it('should handle Facebook sign-in correctly', async () => {
    mockSignInWithPopup.mockResolvedValueOnce({} as unknown as UserCredential)

    render(
      <MockedProvider>
        <SignInServiceButton service="facebook.com" />
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button'))
    await waitFor(() => expect(mockSignInWithPopup).toHaveBeenCalled())
    await waitFor(() => expect(mockLoginWithCredential).toHaveBeenCalled())
  })

  it('should handle Okta sign-in correctly', async () => {
    mockSignInWithPopup.mockResolvedValueOnce({} as unknown as UserCredential)

    render(
      <MockedProvider>
        <SignInServiceButton service="oidc.okta" />
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Continue with Okta' }))
    await waitFor(() => expect(mockSignInWithPopup).toHaveBeenCalled())
    await waitFor(() => expect(mockLoginWithCredential).toHaveBeenCalled())
  })

  describe('guest user', () => {
    const anonymousUser = { isAnonymous: true, uid: 'anon-123' }
    const linkedUserCredential = {
      user: {
        displayName: 'First name last name',
        email: 'example@example.com'
      }
    } as unknown as UserCredential

    const routerWithRedirect = {
      back: jest.fn(),
      push: jest.fn(),
      query: { redirect: '/templates/journey-123/customize' }
    } as unknown as NextRouter

    beforeEach(() => {
      mockGetFirebaseAuth.mockReturnValue({
        currentUser: anonymousUser
      } as ReturnType<typeof getFirebaseAuth>)
      mockLinkWithPopup.mockResolvedValue(linkedUserCredential)
      mockUseRouter.mockReturnValue(routerWithRedirect)
    })

    afterEach(() => {
      mockGetFirebaseAuth.mockImplementation(
        () => ({ currentUser: null }) as ReturnType<typeof getFirebaseAuth>
      )
    })

    it('should handle Google sign-in correctly', async () => {
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
        <MockedProvider mocks={[journeyPublishMock]}>
          <SignInServiceButton service="google.com" />
        </MockedProvider>
      )

      fireEvent.click(
        screen.getByRole('button', { name: 'Continue with Google' })
      )

      await waitFor(() => {
        expect(mockLinkWithPopup).toHaveBeenCalled()
      })
      await waitFor(() => {
        expect(journeyPublishMock.result).toHaveBeenCalled()
      })
      await waitFor(() => {
        expect(mockLoginWithCredential).toHaveBeenCalled()
      })
    })

    it('should handle Facebook sign-in correctly', async () => {
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
        <MockedProvider mocks={[journeyPublishMock]}>
          <SignInServiceButton service="facebook.com" />
        </MockedProvider>
      )

      fireEvent.click(screen.getByRole('button'))

      await waitFor(() => {
        expect(mockLinkWithPopup).toHaveBeenCalled()
      })
      await waitFor(() => {
        expect(journeyPublishMock.result).toHaveBeenCalled()
      })
      await waitFor(() => {
        expect(mockLoginWithCredential).toHaveBeenCalled()
      })
    })

    it('should handle Okta sign-in correctly', async () => {
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
        <MockedProvider mocks={[journeyPublishMock]}>
          <SignInServiceButton service="oidc.okta" />
        </MockedProvider>
      )

      fireEvent.click(
        screen.getByRole('button', { name: 'Continue with Okta' })
      )

      await waitFor(() => {
        expect(mockLinkWithPopup).toHaveBeenCalled()
      })
      await waitFor(() => {
        expect(journeyPublishMock.result).toHaveBeenCalled()
      })
      await waitFor(() => {
        expect(mockLoginWithCredential).toHaveBeenCalled()
      })
    })

    it('should fallback to signInWithCredential when linkWithPopup fails with credential-already-in-use', async () => {
      const credentialAlreadyInUseError = Object.assign(
        new Error('credential already in use'),
        { code: 'auth/credential-already-in-use' }
      )
      mockLinkWithPopup.mockRejectedValueOnce(credentialAlreadyInUseError)

      const mockOAuthCredential = { providerId: 'google.com' }
      mockCredentialFromError.mockReturnValueOnce(
        mockOAuthCredential as ReturnType<
          typeof OAuthProvider.credentialFromError
        >
      )

      const signedInCredential = {
        user: { getIdToken: jest.fn().mockResolvedValue('new-token') }
      } as unknown as UserCredential
      mockSignInWithCredential.mockResolvedValueOnce(signedInCredential)

      render(
        <MockedProvider>
          <SignInServiceButton service="google.com" />
        </MockedProvider>
      )

      fireEvent.click(
        screen.getByRole('button', { name: 'Continue with Google' })
      )

      await waitFor(() => {
        expect(mockLinkWithPopup).toHaveBeenCalled()
      })
      await waitFor(() => {
        expect(mockSignInWithCredential).toHaveBeenCalledWith(
          expect.anything(),
          mockOAuthCredential
        )
      })
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('new-token')
      })
    })
  })
})
