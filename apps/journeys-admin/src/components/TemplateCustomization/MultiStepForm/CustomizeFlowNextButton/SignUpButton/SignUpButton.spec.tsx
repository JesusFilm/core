import { fireEvent, render, screen } from '@testing-library/react'
import { useRouter } from 'next/router'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { CustomizationScreen } from '../../../utils/getCustomizeFlowConfig'

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

const defaultScreens: CustomizationScreen[] = [
  'language',
  'text',
  'links',
  'media',
  'social',
  'done'
]

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
    render(
      <JourneyProvider value={{}}>
        <SignUpButton screens={defaultScreens} currentScreen="language" />
      </JourneyProvider>
    )

    expect(screen.getByTestId('CustomizeFlowNextButton')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument()
    expect(screen.getByText('Sign Up')).toBeInTheDocument()
  })

  it('calls router.push with sign-in path and redirect when clicked', () => {
    render(
      <JourneyProvider value={{}}>
        <SignUpButton screens={defaultScreens} currentScreen="language" />
      </JourneyProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }))

    expect(mockPush).toHaveBeenCalledTimes(1)
    expect(mockPush.mock.calls[0]).toHaveLength(1)
    const [firstArg] = mockPush.mock.calls[0]
    expect(firstArg).toMatchObject({
      pathname: '/users/sign-in',
      query: { redirect: expect.any(String) }
    })
    expect(firstArg.query.redirect).toMatch(/^\//)
  })

  it('includes journey customize URL in redirect when journey exists', () => {
    render(
      <JourneyProvider value={{ journey: { id: 'journey-123' } as never }}>
        <SignUpButton screens={defaultScreens} currentScreen="language" />
      </JourneyProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }))

    expect(mockPush).toHaveBeenCalledTimes(1)
    const [firstArg] = mockPush.mock.calls[0]
    expect(firstArg.query.redirect).toBe(
      '/templates/journey-123/customize?screen=text'
    )
  })

  it('uses root path in redirect when on last screen', () => {
    render(
      <JourneyProvider value={{}}>
        <SignUpButton screens={defaultScreens} currentScreen="done" />
      </JourneyProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }))

    expect(mockPush).toHaveBeenCalledTimes(1)
    const [firstArg] = mockPush.mock.calls[0]
    expect(firstArg.query.redirect).toBe('/')
  })
})