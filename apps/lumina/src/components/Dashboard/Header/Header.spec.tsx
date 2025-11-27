import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'

import { logout } from '@/app/api'

import { Header } from './Header'
import { MockedProvider, type MockedResponse } from '@apollo/client/testing'
import { ME_QUERY, type User } from '@/libs/auth/useUser'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

jest.mock('@/app/api', () => ({
  logout: jest.fn()
}))

jest.mock('@/libs/auth/authContext', () => ({
  useAuth: jest.fn()
}))

describe('Header', () => {
  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn()
  }

  beforeEach(() => {
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const mockUser: User = {
    id: 'user.id',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    imageUrl: 'https://example.com/photo.jpg',
    emailVerified: true
  }

  const meQueryMock: MockedResponse = {
    request: {
      query: ME_QUERY
    },
    result: {
      data: {
        me: mockUser
      }
    }
  }

  it('renders the mobile menu button', () => {
    const onMenuClick = jest.fn()
    render(
      <MockedProvider mocks={[meQueryMock]}>
        <Header onMenuClick={onMenuClick} />
      </MockedProvider>
    )
    expect(screen.getByLabelText('Open menu')).toBeInTheDocument()
  })

  it('calls onMenuClick when mobile menu button is clicked', async () => {
    const user = userEvent.setup()
    const onMenuClick = jest.fn()
    render(
      <MockedProvider mocks={[meQueryMock]}>
        <Header onMenuClick={onMenuClick} />
      </MockedProvider>
    )
    const menuButton = screen.getByLabelText('Open menu')
    await user.click(menuButton)
    expect(onMenuClick).toHaveBeenCalled()
  })

  it('displays user initial when no photo URL', async () => {
    render(
      <MockedProvider
        mocks={[
          {
            ...meQueryMock,
            result: {
              data: {
                me: { ...mockUser, imageUrl: null }
              }
            }
          }
        ]}
      >
        <Header onMenuClick={jest.fn()} />
      </MockedProvider>
    )
    await waitFor(() => {
      expect(screen.getByText('TU')).toBeInTheDocument()
    })
  })

  it('displays user photo when available', async () => {
    render(
      <MockedProvider mocks={[meQueryMock]}>
        <Header onMenuClick={jest.fn()} />
      </MockedProvider>
    )
    await waitFor(() => {
      expect(screen.getByAltText('Test User')).toBeInTheDocument()
    })
    expect(screen.getByAltText('Test User')).toHaveAttribute(
      'src',
      'https://example.com/photo.jpg'
    )
  })

  it('opens dropdown when profile button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <MockedProvider mocks={[meQueryMock]}>
        <Header onMenuClick={jest.fn()} />
      </MockedProvider>
    )
    const profileButton = screen.getByLabelText('User menu')
    await user.click(profileButton)
    expect(screen.getByText('Log out')).toBeInTheDocument()
  })

  it('calls logout and redirects when logout is clicked', async () => {
    const user = userEvent.setup()
    render(
      <MockedProvider mocks={[meQueryMock]}>
        <Header onMenuClick={jest.fn()} />
      </MockedProvider>
    )
    const profileButton = screen.getByLabelText('User menu')
    await user.click(profileButton)
    const logoutButton = screen.getByText('Log out')
    await user.click(logoutButton)
    await waitFor(() => {
      expect(logout).toHaveBeenCalled()
      expect(mockRouter.push).toHaveBeenCalledWith('/users/sign-in')
      expect(mockRouter.refresh).toHaveBeenCalled()
    })
  })
})
