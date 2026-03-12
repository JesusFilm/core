import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { UserCredential, linkWithPopup, signInWithPopup } from 'firebase/auth'
import { NextRouter, useRouter } from 'next/router'

import {
  JourneyPublish,
  JourneyPublishVariables
} from '../../../../__generated__/JourneyPublish'
import { UpdateMe, UpdateMeVariables } from '../../../../__generated__/UpdateMe'
import { getFirebaseAuth } from '../../../libs/auth'
import { JOURNEY_PUBLISH, UPDATE_ME } from '../RegisterPage/RegisterPage'

import { SignInServiceButton } from './SignInServiceButton'

const mockSetCustomParameters = jest.fn()
const mockLoginWithCredential = jest.fn().mockResolvedValue(undefined)

jest.mock('firebase/auth', () => ({
  signInWithPopup: jest.fn(),
  linkWithPopup: jest.fn(),
  GoogleAuthProvider: jest.fn().mockImplementation(() => {
    return { setCustomParameters: mockSetCustomParameters }
  }),
  FacebookAuthProvider: jest.fn().mockImplementation(() => {
    return { setCustomParameters: mockSetCustomParameters }
  }),
  OAuthProvider: jest.fn().mockImplementation(() => {
    return { setCustomParameters: mockSetCustomParameters }
  })
}))

jest.mock('../../../libs/auth', () => ({
  getFirebaseAuth: jest.fn(() => ({ currentUser: null })),
  loginWithCredential: (...args: unknown[]) => mockLoginWithCredential(...args)
}))

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockSignInWithPopup = signInWithPopup as jest.MockedFunction<
  typeof signInWithPopup
>
const mockGetFirebaseAuth = getFirebaseAuth as jest.MockedFunction<
  typeof getFirebaseAuth
>
const mockLinkWithPopup = linkWithPopup as jest.MockedFunction<
  typeof linkWithPopup
>
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
  })
})
