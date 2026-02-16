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
        <GuestPreviewScreen />
      </JourneyProvider>
    )
    expect(
      screen.getByText(
        'This content contains buttons linking to external sites. Check them and update the links below.'
      )
    ).toBeInTheDocument()
  })

  it('renders mobile subtitle', () => {
    render(
      <JourneyProvider value={{ journey, variant: 'admin' }}>
        <GuestPreviewScreen />
      </JourneyProvider>
    )
    expect(screen.getByText('Tap on a card to zoom it in')).toBeInTheDocument()
  })

  it('displays quoted journey title when journey has title', () => {
    render(
      <JourneyProvider value={{ journey, variant: 'admin' }}>
        <GuestPreviewScreen />
      </JourneyProvider>
    )
    expect(screen.getByText('"my journey"')).toBeInTheDocument()
  })

  it('renders CardsPreview', () => {
    render(
      <JourneyProvider value={{ journey, variant: 'admin' }}>
        <GuestPreviewScreen />
      </JourneyProvider>
    )
    const placeholder = screen.queryByTestId('CardsPreviewPlaceholder')
    const slide = screen.queryByTestId('CardsSwiperSlide')
    expect(placeholder != null || slide != null).toBe(true)
  })
})
