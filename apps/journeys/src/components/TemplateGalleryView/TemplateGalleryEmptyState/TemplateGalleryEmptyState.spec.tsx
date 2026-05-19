import { render, screen } from '@testing-library/react'

import { TemplateGalleryEmptyState } from './TemplateGalleryEmptyState'

describe('TemplateGalleryEmptyState', () => {
  it('renders the empty-state message', () => {
    render(<TemplateGalleryEmptyState />)
    expect(
      screen.getByText('This gallery has no templates yet.')
    ).toBeInTheDocument()
  })
})
