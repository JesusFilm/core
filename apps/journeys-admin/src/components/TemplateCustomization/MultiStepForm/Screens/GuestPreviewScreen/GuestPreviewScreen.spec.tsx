import { fireEvent, render, screen } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { journey } from '@core/journeys/ui/JourneyProvider/JourneyProvider.mock'

import { CustomizationScreen } from '../../../utils/getCustomizeFlowConfig'

import { GuestPreviewScreen } from './GuestPreviewScreen'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

jest.mock('next-i18next/pages', () => ({
  useTranslation: () => ({
    t: (str: string) => str
  })
}))

jest.mock('../LinksScreen/CardsPreview', () => ({
  CardsPreview: ({
    steps,
    onCardClick
  }: {
    steps: Array<{ id: string }>
    onCardClick?: (step: { id: string }) => void
  }) => (
    <button
      data-testid="MockCardsPreview"
      onClick={() => onCardClick?.(steps[0])}
    >
      Cards Preview
    </button>
  )
}))

jest.mock(
  '../LinksScreen/CardsPreview/TemplateCardPreviewDialog/TemplateCardPreviewDialog',
  () => ({
    TemplateCardPreviewDialog: ({
      open,
      onClose,
      initialStepId
    }: {
      open: boolean
      onClose: () => void
      initialStepId: string | null
    }) => (
      <div
        data-testid="MockTemplateCardPreviewDialog"
        data-open={String(open)}
        data-initial-step-id={initialStepId ?? ''}
      >
        <button data-testid="MockDialogClose" onClick={onClose}>
          Close Dialog
        </button>
      </div>
    )
  })
)

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

const defaultScreens: CustomizationScreen[] = [
  'language',
  'text',
  'links',
  'guestPreview',
  'media',
  'social',
  'done'
]

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

  it('renders desktop subtitle', () => {
    render(
      <JourneyProvider value={{ journey, variant: 'admin' }}>
        <GuestPreviewScreen screens={defaultScreens} />
      </JourneyProvider>
    )
    expect(
      screen.getByText(
        'Preview your changes here. Tap on a card to zoom it in.'
      )
    ).toBeInTheDocument()
  })

  it('renders mobile subtitle', () => {
    render(
      <JourneyProvider value={{ journey, variant: 'admin' }}>
        <GuestPreviewScreen screens={defaultScreens} />
      </JourneyProvider>
    )
    expect(screen.getByText('Tap on a card to zoom it in')).toBeInTheDocument()
  })

  it('displays quoted journey title when journey has title', () => {
    render(
      <JourneyProvider value={{ journey, variant: 'admin' }}>
        <GuestPreviewScreen screens={defaultScreens} />
      </JourneyProvider>
    )
    expect(screen.getByText("'my journey'")).toBeInTheDocument()
  })

  it('renders CardsPreview', () => {
    render(
      <JourneyProvider value={{ journey, variant: 'admin' }}>
        <GuestPreviewScreen screens={defaultScreens} />
      </JourneyProvider>
    )
    expect(screen.getByTestId('MockCardsPreview')).toBeInTheDocument()
  })

  it('calls router.push with sign-in path and redirect when Continue with account is clicked', () => {
    render(
      <JourneyProvider value={{ journey, variant: 'admin' }}>
        <GuestPreviewScreen screens={defaultScreens} />
      </JourneyProvider>
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Continue with account' })
    )

    expect(push).toHaveBeenCalledTimes(1)
    const [firstArg] = push.mock.calls[0]
    expect(firstArg).toMatchObject({
      pathname: '/users/sign-in',
      query: { redirect: expect.any(String) }
    })
    expect(firstArg.query.redirect).toMatch(/^\//)
  })

  it('includes journey customize URL for next screen in redirect', () => {
    render(
      <JourneyProvider
        value={{ journey: { ...journey, id: 'journey-123' } as never }}
      >
        <GuestPreviewScreen screens={defaultScreens} />
      </JourneyProvider>
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Continue with account' })
    )

    expect(push).toHaveBeenCalledTimes(1)
    const [firstArg] = push.mock.calls[0]
    expect(firstArg.query.redirect).toBe(
      '/templates/journey-123/customize?screen=media'
    )
  })

  describe('dialog', () => {
    it('opens dialog with correct initialStepId when a card is clicked', () => {
      render(
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <GuestPreviewScreen screens={defaultScreens} />
        </JourneyProvider>
      )

      const dialog = screen.getByTestId('MockTemplateCardPreviewDialog')
      expect(dialog).toHaveAttribute('data-open', 'false')

      fireEvent.click(screen.getByTestId('MockCardsPreview'))

      expect(dialog).toHaveAttribute('data-open', 'true')
      expect(dialog).toHaveAttribute('data-initial-step-id', 'step0.id')
    })

    it('closes dialog when onClose is called', () => {
      render(
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <GuestPreviewScreen screens={defaultScreens} />
        </JourneyProvider>
      )

      fireEvent.click(screen.getByTestId('MockCardsPreview'))
      expect(
        screen.getByTestId('MockTemplateCardPreviewDialog')
      ).toHaveAttribute('data-open', 'true')

      fireEvent.click(screen.getByTestId('MockDialogClose'))
      expect(
        screen.getByTestId('MockTemplateCardPreviewDialog')
      ).toHaveAttribute('data-open', 'false')
    })
  })

  it('uses root path in redirect when guestPreview is the last screen', () => {
    const screensEndingAtPreview: CustomizationScreen[] = [
      'language',
      'text',
      'links',
      'guestPreview'
    ]

    render(
      <JourneyProvider value={{ journey, variant: 'admin' }}>
        <GuestPreviewScreen screens={screensEndingAtPreview} />
      </JourneyProvider>
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Continue with account' })
    )

    expect(push).toHaveBeenCalledTimes(1)
    const [firstArg] = push.mock.calls[0]
    expect(firstArg.query.redirect).toBe('/')
  })
})
