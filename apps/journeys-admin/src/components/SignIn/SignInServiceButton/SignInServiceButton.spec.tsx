import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import {
  UserCredential,
  getAuth,
  linkWithPopup,
  signInWithPopup
} from 'firebase/auth'
import { NextRouter, useRouter } from 'next/router'

import {
  JourneyPublish,
  JourneyPublishVariables
} from '../../../../__generated__/JourneyPublish'
import { UpdateMe, UpdateMeVariables } from '../../../../__generated__/UpdateMe'
import { JOURNEY_PUBLISH, UPDATE_ME } from '../RegisterPage/RegisterPage'

import { SignInServiceButton } from './SignInServiceButton'

const mockSetCustomParameters = jest.fn()

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({ currentUser: null })),
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

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockSignInWithPopup = signInWithPopup as jest.MockedFunction<
  typeof signInWithPopup
>
const mockGetAuth = getAuth as jest.MockedFunction<typeof getAuth>
const mockLinkWithPopup = linkWithPopup as jest.MockedFunction<
  typeof linkWithPopup
>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('SignInServiceButton', () => {
  describe('new user', () => {
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
    })

    it('should handle Okta sign-in correctly', async () => {
      mockSignInWithPopup.mockResolvedValueOnce({} as unknown as UserCredential)

      render(
        <MockedProvider>
          <SignInServiceButton service="oidc.okta" />
        </MockedProvider>
      )

      fireEvent.click(
        screen.getByRole('button', { name: 'Continue with Okta' })
      )
      await waitFor(() => expect(mockSignInWithPopup).toHaveBeenCalled())
    })
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
      mockGetAuth.mockReturnValue({
        currentUser: anonymousUser
      } as ReturnType<typeof getAuth>)
      mockLinkWithPopup.mockResolvedValue(linkedUserCredential)
      mockUseRouter.mockReturnValue(routerWithRedirect)
    })

    afterEach(() => {
      mockGetAuth.mockImplementation(
        () => ({ currentUser: null }) as ReturnType<typeof getAuth>
      )
    })

    it('should handle Google sign-in correctly', async () => {
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
        expect(updateMeMock.result).toHaveBeenCalled()
      })
      await waitFor(() => {
        expect(journeyPublishMock.result).toHaveBeenCalled()
      })
    })

    it('should handle Facebook sign-in correctly', async () => {
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
          <SignInServiceButton service="facebook.com" />
        </MockedProvider>
      )

      fireEvent.click(screen.getByRole('button'))

      await waitFor(() => {
        expect(mockLinkWithPopup).toHaveBeenCalled()
      })
      await waitFor(() => {
        expect(updateMeMock.result).toHaveBeenCalled()
      })
      await waitFor(() => {
        expect(journeyPublishMock.result).toHaveBeenCalled()
      })
    })

    it('should handle Okta sign-in correctly', async () => {
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
        expect(updateMeMock.result).toHaveBeenCalled()
      })
      await waitFor(() => {
        expect(journeyPublishMock.result).toHaveBeenCalled()
      })
    })
  })
})
