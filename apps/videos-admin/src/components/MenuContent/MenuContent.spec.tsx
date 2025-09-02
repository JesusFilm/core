import { render, screen } from '@testing-library/react'

import { MenuContent } from './MenuContent'

describe('MenuContent', () => {
  it('should show menu content items', () => {
    render(<MenuContent />)

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Video Library' })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Settings' })).toBeInTheDocument()
  })
})
