import { fireEvent, render } from '@testing-library/react'

import { JourneyProvider } from '../../../libs/JourneyProvider'
import { JourneyFields as Journey } from '../../../libs/JourneyProvider/__generated__/JourneyFields'

import { ChatHeader } from './ChatHeader'

vi.mock('next-i18next/pages', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

describe('ChatHeader', () => {
  it('renders the title and caption', () => {
    const { getByText, getByRole } = render(<ChatHeader />)
    expect(getByText('Ask your questions about faith')).toBeInTheDocument()
    expect(getByText(/Replies may not be perfect/)).toBeInTheDocument()
    const link = getByRole('link', { name: 'About this chat' })
    expect(link).toHaveAttribute('href', '/legal/about-chat')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('carries the journey language as ?lang on the about-this-chat link (NES-1724)', () => {
    const journey = { language: { bcp47: 'es' } } as unknown as Journey
    const { getByRole } = render(
      <JourneyProvider value={{ journey, variant: 'default' }}>
        <ChatHeader />
      </JourneyProvider>
    )
    expect(getByRole('link', { name: 'About this chat' })).toHaveAttribute(
      'href',
      '/legal/about-chat?lang=es'
    )
  })

  it('renders the animated mark in both states', () => {
    // Visual verification of the actual animation belongs in the
    // browser — emotion's keyframe stylesheet doesn't surface
    // through jsdom's getComputedStyle. We just confirm both states
    // render without error and the mark is present.
    const { container, rerender } = render(<ChatHeader thinking={false} />)
    expect(container.querySelector('.jfp-mark-top')).not.toBeNull()
    expect(container.querySelector('.jfp-mark-bottom')).not.toBeNull()

    rerender(<ChatHeader thinking />)
    expect(container.querySelector('.jfp-mark-top')).not.toBeNull()
    expect(container.querySelector('.jfp-mark-bottom')).not.toBeNull()
  })

  it('does not render a close button without onClose', () => {
    const { queryByRole } = render(<ChatHeader />)
    expect(
      queryByRole('button', { name: 'Close chat' })
    ).not.toBeInTheDocument()
  })

  it('renders a close button that calls onClose when provided', () => {
    const onClose = vi.fn()
    const { getByRole } = render(<ChatHeader onClose={onClose} />)

    fireEvent.click(getByRole('button', { name: 'Close chat' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
