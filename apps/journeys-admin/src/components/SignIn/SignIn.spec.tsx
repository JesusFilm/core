import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import { useRouter } from 'next/router'
import { type MockedFunction } from 'vitest'

import { SignIn } from './SignIn'

const mockUseAuth = vi.fn()
const mockReplace = vi.fn()

vi.mock('../../libs/auth', () => ({
  __esModule: true,
  useAuth: (...args: unknown[]) => mockUseAuth(...args)
}))

vi.mock('next/router', () => ({
  __esModule: true,
  useRouter: vi.fn()
}))

const mockUseRouter = useRouter as MockedFunction<typeof useRouter>

describe('SignIn', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: null
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
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', isAnonymous: false }
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

    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', isAnonymous: false }
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
