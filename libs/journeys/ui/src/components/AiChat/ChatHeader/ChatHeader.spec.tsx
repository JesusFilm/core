import { render } from '@testing-library/react'

import { ChatHeader } from './ChatHeader'

// `next-i18next/pages` is a Next.js subpath that doesn't resolve in jest;
// register the mock as virtual so jest doesn't try to find it on disk.
jest.mock(
  'next-i18next/pages',
  () => ({ useTranslation: () => ({ t: (key: string) => key }) }),
  { virtual: true }
)

describe('ChatHeader', () => {
  it('renders the title and caption', () => {
    const { getByText } = render(<ChatHeader />)
    expect(getByText('Ask a question')).toBeInTheDocument()
    expect(getByText('Replies may not be perfect')).toBeInTheDocument()
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
})
