import { fireEvent, render, screen } from '@testing-library/react'

import { CollectionContentHeader } from './CollectionContentHeader'

jest.mock('./AudioLanguageSelect', () => ({
  AudioLanguageSelect: () => (
    <div data-testid="AudioLanguageSelect">Audio Selector</div>
  )
}))

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (str: string) => str
  })
}))

type Props = Parameters<typeof CollectionContentHeader>[0]

describe('CollectionContentHeader', () => {
  const defaultProps: Props = {
    label: 'Collection',
    childCountLabel: '3 Items',
    onShare: jest.fn()
  }

  it('renders label and child count', () => {
    render(<CollectionContentHeader {...defaultProps} />)

    expect(screen.getByText('Collection')).toBeInTheDocument()
    expect(screen.getAllByText('3 Items')[0]).toBeInTheDocument()
  })

  it('invokes share handler', () => {
    const onShare = jest.fn()
    render(<CollectionContentHeader {...defaultProps} onShare={onShare} />)

    fireEvent.click(screen.getByRole('button', { name: 'Share' }))
    expect(onShare).toHaveBeenCalled()
  })
})
