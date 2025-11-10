import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'

import { logout } from '@/app/api'
import { useAuth } from '@/libs/auth/authContext'

import { Header } from './Header'

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
    ;(useAuth as jest.Mock).mockReturnValue({
      user: {
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null
      }
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders the mobile menu button', () => {
    const onMenuClick = jest.fn()
    render(<Header onMenuClick={onMenuClick} />)
    expect(screen.getByLabelText('Open menu')).toBeInTheDocument()
  })

  it('calls onMenuClick when mobile menu button is clicked', async () => {
    const user = userEvent.setup()
    const onMenuClick = jest.fn()
    render(<Header onMenuClick={onMenuClick} />)
    const menuButton = screen.getByLabelText('Open menu')
    await user.click(menuButton)
    expect(onMenuClick).toHaveBeenCalled()
  })

  it('displays user initial when no photo URL', () => {
    render(<Header onMenuClick={jest.fn()} />)
    expect(screen.getByText('T')).toBeInTheDocument()
  })

  it('displays user photo when available', () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: {
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg'
      }
    })
    render(<Header onMenuClick={jest.fn()} />)
    const img = screen.getByAltText('Test User')
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg')
  })

  it('opens dropdown when profile button is clicked', async () => {
    const user = userEvent.setup()
    render(<Header onMenuClick={jest.fn()} />)
    const profileButton = screen.getByLabelText('User menu')
    await user.click(profileButton)
    expect(screen.getByText('Log out')).toBeInTheDocument()
  })

  it('calls logout and redirects when logout is clicked', async () => {
    const user = userEvent.setup()
    render(<Header onMenuClick={jest.fn()} />)
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

