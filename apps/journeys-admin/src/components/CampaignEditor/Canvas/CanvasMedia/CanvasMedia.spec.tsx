import { render, screen } from '@testing-library/react'

import { CanvasMedia } from './CanvasMedia'

describe('CanvasMedia', () => {
  it('points an empty Media Slot at Settings', () => {
    render(<CanvasMedia media={null} />)

    expect(screen.getByTestId('CanvasMediaPlaceholder')).toHaveTextContent(
      'Add media in Settings'
    )
  })
})
