import { render, screen } from '@testing-library/react'

import { mockTemplate } from '../galleryFixture'

import { GalleryTemplateCard } from './GalleryTemplateCard'

describe('GalleryTemplateCard', () => {
  it('renders title, description, language, and image', () => {
    render(
      <GalleryTemplateCard
        template={mockTemplate}
        href="https://admin.nextstep.is/?useTemplate=template-1"
      />
    )

    expect(screen.getByTestId('GalleryTemplateCard')).toBeInTheDocument()
    expect(screen.getByText('Sample Template')).toBeInTheDocument()
    expect(
      screen.getByText('A sample template for testing')
    ).toBeInTheDocument()
    expect(screen.getByText(/English/)).toBeInTheDocument()
    expect(screen.getByAltText('Sample image')).toBeInTheDocument()
  })

  it('does not render the card as a clickable link', () => {
    render(
      <GalleryTemplateCard
        template={mockTemplate}
        href="https://admin.nextstep.is/?useTemplate=template-1"
      />
    )
    // Card is no longer wrapped in an anchor — click handlers will be added
    // to dedicated buttons in a separate ticket.
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('renders a placeholder when there is no primary image', () => {
    render(
      <GalleryTemplateCard
        template={{ ...mockTemplate, primaryImageBlock: null }}
        href="https://admin.nextstep.is/?useTemplate=template-1"
      />
    )
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})
