import { render, screen } from '@testing-library/react'

import { MediaLibraryTeamTag } from './MediaLibraryTeamTag'

describe('MediaLibraryTeamTag', () => {
  it('should render the Team label', () => {
    render(<MediaLibraryTeamTag />)
    expect(screen.getByText('Team')).toBeInTheDocument()
  })

  it('should forward the data-testid and render aria-hidden', () => {
    render(<MediaLibraryTeamTag data-testid="team-tag-1" />)
    const tag = screen.getByTestId('team-tag-1')
    expect(tag).toHaveAttribute('aria-hidden', 'true')
  })
})
