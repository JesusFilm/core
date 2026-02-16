import { fireEvent, render, screen } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { journey } from '@core/journeys/ui/JourneyProvider/JourneyProvider.mock'

import { GuestPreviewScreen } from './GuestPreviewScreen'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (str: string) => str
  })
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

function renderGuestPreviewScreen(): void {
  render(
    <JourneyProvider value={{ journey, variant: 'admin' }}>
      <GuestPreviewScreen />
    </JourneyProvider>
  )
}

describe('GuestPreviewScreen', () => {
  let push: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    push = jest.fn()
    mockUseRouter.mockReturnValue({
      push,
      query: {},
      events: { on: jest.fn() }
    } as unknown as NextRouter)
  })

  describe('static content and headings', () => {
    it('renders desktop subtitle', () => {
      renderGuestPreviewScreen()
      expect(
        screen.getByText(
          'This content contains buttons linking to external sites. Check them and update the links below.'
        )
      ).toBeInTheDocument()
    })

    it('renders mobile subtitle', () => {
      renderGuestPreviewScreen()
      expect(
        screen.getByText('Tap on a card to zoom it in')
      ).toBeInTheDocument()
    })

    describe('journey title', () => {
      it('displays quoted journey title when journey has title', () => {
        renderGuestPreviewScreen()
        expect(screen.getByText('"my journey"')).toBeInTheDocument()
      })
    })

    describe('CardsPreview', () => {
      it('renders CardsPreview', () => {
        renderGuestPreviewScreen()
        const placeholder = screen.queryByTestId('CardsPreviewPlaceholder')
        const slide = screen.queryByTestId('CardsSwiperSlide')
        expect(placeholder != null || slide != null).toBe(true)
      })
    })

    describe('AccountCheckDialog', () => {
      it('opens dialog when Continue with account is clicked', () => {
        renderGuestPreviewScreen()
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

        const button = screen.getByRole('button', {
          name: 'Continue with account'
        })
        fireEvent.click(button)

        const dialog = screen.getByRole('dialog')
        expect(dialog).toBeInTheDocument()
        expect(dialog).toHaveTextContent('We Like Your Choice!')
        expect(dialog).toHaveTextContent('Login with my account')
        expect(dialog).toHaveTextContent('Create a new account')
      })
    })

    describe('handleSignIn navigation', () => {
      it('calls router.push with login true when Login with my account is clicked', () => {
        renderGuestPreviewScreen()
        fireEvent.click(
          screen.getByRole('button', { name: 'Continue with account' })
        )
        fireEvent.click(
          screen.getByRole('button', { name: 'Login with my account' })
        )

        expect(push).toHaveBeenCalledTimes(1)
        expect(push).toHaveBeenCalledWith(
          {
            pathname: '/users/sign-in',
            query: {
              redirect: expect.stringContaining('createNew=true&screen=social'),
              login: true
            }
          },
          undefined,
          { shallow: true }
        )
        const redirectUrl = push.mock.calls[0][0].query.redirect
        expect(redirectUrl).toContain('/templates/journeyId/customize')
      })

      it('calls router.push with login false when Create a new account is clicked', () => {
        renderGuestPreviewScreen()
        fireEvent.click(
          screen.getByRole('button', { name: 'Continue with account' })
        )
        fireEvent.click(
          screen.getByRole('button', { name: 'Create a new account' })
        )

        expect(push).toHaveBeenCalledTimes(1)
        expect(push).toHaveBeenCalledWith(
          {
            pathname: '/users/sign-in',
            query: {
              redirect: expect.stringContaining('createNew=true&screen=social'),
              login: false
            }
          },
          undefined,
          { shallow: true }
        )
      })
    })
  })
})
