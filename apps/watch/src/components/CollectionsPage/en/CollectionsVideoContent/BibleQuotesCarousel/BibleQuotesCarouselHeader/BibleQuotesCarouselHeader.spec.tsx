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
    onOpenDialog: jest.fn()
  }

  it('renders the title correctly', () => {
    render(<BibleQuotesCarouselHeader {...defaultProps} />)

    expect(screen.getByText('Bible Quotes Title')).toBeInTheDocument()
  })

  it('calls onOpenDialog when the share button is clicked', () => {
    render(<BibleQuotesCarouselHeader {...defaultProps} />)

    fireEvent.click(screen.getByText('Share'))
    expect(defaultProps.onOpenDialog).toHaveBeenCalledTimes(1)
  })

  it('handles undefined onOpenDialog prop gracefully', () => {
    const { onOpenDialog, ...propsWithoutCallback } = defaultProps

    render(<BibleQuotesCarouselHeader {...propsWithoutCallback} />)

    fireEvent.click(screen.getByText('Share'))
    fireEvent.keyDown(screen.getByText('Share').closest('button')!, {
      key: 'Enter'
    })
  })
})
