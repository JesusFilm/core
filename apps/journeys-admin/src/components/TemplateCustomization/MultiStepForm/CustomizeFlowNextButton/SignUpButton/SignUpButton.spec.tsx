import { fireEvent, render, screen } from '@testing-library/react'
import { useRouter } from 'next/router'

import { SignUpButton } from './SignUpButton'

const mockPush = jest.fn()

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('SignUpButton', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
      query: {}
    } as unknown as ReturnType<typeof useRouter>)
    mockPush.mockClear()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders Sign Up button with correct label', () => {
    render(<SignUpButton />)

    expect(screen.getByTestId('CustomizeFlowNextButton')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument()
    expect(screen.getByText('Sign Up')).toBeInTheDocument()
  })

  it('calls router.push with sign-in path and redirect when clicked', () => {
    render(<SignUpButton />)

    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }))

    expect(mockPush).toHaveBeenCalledTimes(1)
    // Should be called with exactly one argument (no shallow option)
    expect(mockPush.mock.calls[0]).toHaveLength(1)
    const [firstArg] = mockPush.mock.calls[0]
    expect(firstArg).toMatchObject({
      pathname: '/users/sign-in',
      query: { redirect: expect.any(String) }
    })
    // redirect must be a relative path (no origin prefix)
    expect(firstArg.query.redirect).toMatch(/^\//)
  })

  it('includes journey customize URL in redirect when journeyId is in query', () => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
      query: { journeyId: 'journey-123' }
    } as unknown as ReturnType<typeof useRouter>)

    render(<SignUpButton />)
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }))

    expect(mockPush).toHaveBeenCalledTimes(1)
    const [firstArg] = mockPush.mock.calls[0]
    // redirect should be a relative path (no domain prefix)
    expect(firstArg.query.redirect).toBe(
      '/templates/journey-123/customize?screen=media'
    )
  })

  it('uses root path in redirect when journeyId is not in query', () => {
    render(<SignUpButton />)
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }))

    expect(mockPush).toHaveBeenCalledTimes(1)
    const [firstArg] = mockPush.mock.calls[0]
    expect(firstArg.query.redirect).toBe('/')
  })
})
