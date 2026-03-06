import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import { useRouter } from 'next/router'

import { SignIn } from './SignIn'

const mockUseUser = jest.fn()
const mockReplace = jest.fn()

jest.mock('next-firebase-auth', () => ({
  __esModule: true,
  useUser: (...args: unknown[]) => mockUseUser(...args)
}))

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('SignIn', () => {
  beforeEach(() => {
    mockUseUser.mockReturnValue({
      clientInitialized: true,
      id: null,
      firebaseUser: null
    })
    mockUseRouter.mockReturnValue({
      asPath: '/signin',
      replace: mockReplace,
      query: {}
    } as unknown as ReturnType<typeof useRouter>)
    mockReplace.mockClear()
  })

  it('should render sign in page', () => {
    render(
      <MockedProvider>
        <SignIn />
      </MockedProvider>
    )
    expect(screen.getByRole('tab', { name: 'New account' })).toHaveTextContent(
      'New account'
    )
  })

  it('should redirect to verify page when user is authenticated and not anonymous', () => {
    mockUseUser.mockReturnValue({
      clientInitialized: true,
      id: 'user-1',
      firebaseUser: { isAnonymous: false }
    })

    render(
      <MockedProvider>
        <SignIn />
      </MockedProvider>
    )

    expect(mockReplace).toHaveBeenCalledWith('/users/verify')
  })

  it('should redirect to verify page with search params when user is authenticated', () => {
    mockUseRouter.mockReturnValue({
      asPath: '/signin?redirect=/journeys/123',
      replace: mockReplace,
      query: { redirect: '/journeys/123' }
    } as unknown as ReturnType<typeof useRouter>)

    mockUseUser.mockReturnValue({
      clientInitialized: true,
      id: 'user-1',
      firebaseUser: { isAnonymous: false }
    })

    render(
      <MockedProvider>
        <SignIn />
      </MockedProvider>
    )

    expect(mockReplace).toHaveBeenCalledWith(
      '/users/verify?redirect=/journeys/123'
    )
  })
})
