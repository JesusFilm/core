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
import { type Mock, type MockedFunction } from 'vitest'

import {
  JourneyPublish,
  JourneyPublishVariables
} from '../../../../__generated__/JourneyPublish'
import { getFirebaseAuth } from '../../../libs/auth'
import { JOURNEY_PUBLISH } from '../RegisterPage/RegisterPage'

import { SignInServiceButton } from './SignInServiceButton'

const mockSetCustomParameters = vi.fn()
const mockLoginWithCredential = vi.fn().mockResolvedValue(undefined)
const mockLogin = vi.fn().mockResolvedValue(undefined)

vi.mock('firebase/auth', () => {
  const credentialFromError = vi.fn()
  const OAuthProviderMock: Mock & {
    credentialFromError: Mock
  } = Object.assign(
    vi.fn().mockImplementation(() => ({
      setCustomParameters: vi.fn()
    })),
    { credentialFromError }
  )
  return {
    signInWithPopup: vi.fn(),
    signInWithCredential: vi.fn(),
    linkWithPopup: vi.fn(),
    OAuthProvider: OAuthProviderMock,
    GoogleAuthProvider: vi.fn().mockImplementation(() => ({
      setCustomParameters: vi.fn()
    })),
    FacebookAuthProvider: vi.fn().mockImplementation(() => ({
      setCustomParameters: vi.fn()
    }))
  }
})

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

const mockSignInWithPopup = signInWithPopup as MockedFunction<
  typeof signInWithPopup
>
const mockSignInWithCredential = signInWithCredential as MockedFunction<
  typeof signInWithCredential
>
const mockGetFirebaseAuth = getFirebaseAuth as MockedFunction<
  typeof getFirebaseAuth
>
const mockLinkWithPopup = linkWithPopup as MockedFunction<typeof linkWithPopup>
const mockCredentialFromError = (
  OAuthProvider as unknown as { credentialFromError: Mock }
).credentialFromError
const mockUseRouter = useRouter as MockedFunction<typeof useRouter>

describe('SignInServiceButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetFirebaseAuth.mockReturnValue({
      currentUser: null
    } as ReturnType<typeof getFirebaseAuth>)
    mockUseRouter.mockReturnValue({
      back: vi.fn(),
      push: vi.fn(),
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
        email: 'example@example.com',
        getIdToken: vi.fn().mockResolvedValue('guest-linked-token')
      }
    } as unknown as UserCredential

    const routerWithRedirect = {
      back: vi.fn(),
      push: vi.fn(),
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

    it('should call getIdToken with force-refresh on the pending journey path', async () => {
      const mockGetIdToken = vi.fn().mockResolvedValue('fresh-google-token')
      mockLinkWithPopup.mockResolvedValueOnce({
        user: {
          displayName: 'Jane Smith',
          email: 'jane@gmail.com',
          getIdToken: mockGetIdToken
        }
      } as unknown as UserCredential)

      mockUseRouter.mockReturnValueOnce({
        back: vi.fn(),
        push: vi.fn(),
        query: {}
      } as unknown as NextRouter)

      const { getPendingGuestJourney } = await vi.importMock(
        '../../../libs/pendingGuestJourney'
      )
      ;(getPendingGuestJourney as Mock).mockReturnValueOnce({
        journeyId: 'pending-journey-id'
      })

      render(
        <MockedProvider>
          <SignInServiceButton service="google.com" />
        </MockedProvider>
      )

      fireEvent.click(
        screen.getByRole('button', { name: 'Continue with Google' })
      )

      await waitFor(() => {
        expect(mockGetIdToken).toHaveBeenCalledWith(true)
      })
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('fresh-google-token')
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
        user: { getIdToken: vi.fn().mockResolvedValue('new-token') }
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
