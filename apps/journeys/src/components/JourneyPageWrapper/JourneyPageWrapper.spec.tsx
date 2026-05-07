import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useChatOverlay } from '@core/journeys/ui/ChatOverlayProvider'

import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'
import { ThemeMode, ThemeName } from '../../../__generated__/globalTypes'

import { JourneyPageWrapper } from './JourneyPageWrapper'

function ChatOverlayProbe(): JSX.Element {
  const { open, setOpen } = useChatOverlay()
  return (
    <div data-testid="ChatOverlayProbe" data-open={String(open)}>
      <button type="button" onClick={() => setOpen(true)}>
        open
      </button>
    </div>
  )
}

describe('JourneyPageWrapper', () => {
  const journey = {
    id: 'journeyId',
    themeName: ThemeName.base,
    themeMode: ThemeMode.dark
  } as unknown as Journey

  it('renders the children', () => {
    render(
      <JourneyPageWrapper journey={journey} locale="en" rtl={false}>
        <div>Test Child</div>
      </JourneyPageWrapper>
    )

    expect(screen.getByText('Test Child')).toBeInTheDocument()
  })

  it('wraps children in ChatOverlayProvider so useChatOverlay is wired (not the no-op fallback)', async () => {
    const user = userEvent.setup()

    render(
      <JourneyPageWrapper journey={journey} locale="en" rtl={false}>
        <ChatOverlayProbe />
      </JourneyPageWrapper>
    )

    const probe = screen.getByTestId('ChatOverlayProbe')
    expect(probe.getAttribute('data-open')).toBe('false')
    await user.click(screen.getByRole('button', { name: 'open' }))
    // The fallback `setOpen` is a no-op — `data-open` would stay 'false'.
    // A live provider flips it to 'true'.
    expect(probe.getAttribute('data-open')).toBe('true')
  })
})
