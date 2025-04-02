import { fireEvent, render, screen } from '@testing-library/react'

import { BibleQuotesCarouselHeader } from './BibleQuotesCarouselHeader'

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}))

describe('BibleQuotesCarouselHeader', () => {
  const defaultProps = {
    bibleQuotesTitle: 'Bible Quotes Title',
    onOpenDialog: jest.fn(),
    shareButtonText: 'Share'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the title correctly', () => {
    render(<BibleQuotesCarouselHeader {...defaultProps} />)

    expect(screen.getByText('Bible Quotes Title')).toBeInTheDocument()
    expect(screen.getByText('Share')).toBeInTheDocument()
  })

  it('calls onOpenDialog when the share button is clicked', () => {
    render(<BibleQuotesCarouselHeader {...defaultProps} />)

    fireEvent.click(screen.getByText('Share'))
    expect(defaultProps.onOpenDialog).toHaveBeenCalledTimes(1)
  })

  it('calls onOpenDialog when Enter key is pressed on the share button', () => {
    render(<BibleQuotesCarouselHeader {...defaultProps} />)

    const shareButton = screen.getByText('Share').closest('button')!
    fireEvent.keyDown(shareButton, { key: 'Enter' })
    expect(defaultProps.onOpenDialog).toHaveBeenCalledTimes(1)
  })

  it('handles undefined onOpenDialog prop gracefully', () => {
    const { onOpenDialog, ...propsWithoutCallback } = defaultProps
    const consoleSpy = jest.spyOn(console, 'error')

    render(<BibleQuotesCarouselHeader {...propsWithoutCallback} />)

    // Test that clicking the button doesn't cause errors
    fireEvent.click(screen.getByText('Share'))

    // Test that pressing Enter key doesn't cause errors
    fireEvent.keyDown(screen.getByText('Share').closest('button')!, {
      key: 'Enter'
    })

    // Verify no console errors were produced
    expect(consoleSpy).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})
