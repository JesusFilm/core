import { render, screen } from '@testing-library/react'

import { mockTemplate } from '../galleryFixture'

import { GalleryTemplateCard } from './GalleryTemplateCard'

describe('GalleryTemplateCard', () => {
  it('renders title, description, language, and image', () => {
    render(<GalleryTemplateCard template={mockTemplate} />)

    expect(screen.getByTestId('GalleryTemplateCard')).toBeInTheDocument()
    expect(screen.getByText('Sample Template')).toBeInTheDocument()
    expect(
      screen.getByText('A sample template for testing')
    ).toBeInTheDocument()
    expect(screen.getByText(/English/)).toBeInTheDocument()
    expect(screen.getByAltText('Sample image')).toBeInTheDocument()
  })

  it('does not render the card as a clickable link', () => {
    render(<GalleryTemplateCard template={mockTemplate} />)
    // Card is no longer wrapped in an anchor — click handlers will be added
    // to dedicated buttons in a separate ticket.
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('renders the meta line with the formatted year and the language', () => {
    render(<GalleryTemplateCard template={mockTemplate} />)
    // mockTemplate.createdAt is '2026-01-01T00:00:00.000Z'. Assert on the
    // year + language with a regex so the test is locale-independent.
    expect(screen.getByText(/2026/)).toBeInTheDocument()
    expect(screen.getByText(/English/)).toBeInTheDocument()
  })

  it('omits the meta line entirely when both date and language are missing', () => {
    render(
      <GalleryTemplateCard
        template={{
          ...mockTemplate,
          createdAt: null,
          language: { ...mockTemplate.language, name: [] }
        }}
      />
    )
    expect(screen.queryByText(/2026/)).not.toBeInTheDocument()
    expect(screen.queryByText(/English/)).not.toBeInTheDocument()
  })

  it('omits the description Typography when description is empty', () => {
    render(
      <GalleryTemplateCard
        template={{ ...mockTemplate, description: '' }}
      />
    )
    expect(
      screen.queryByText('A sample template for testing')
    ).not.toBeInTheDocument()
  })

  it('renders a placeholder when there is no primary image', () => {
    render(
      <GalleryTemplateCard
        template={{ ...mockTemplate, primaryImageBlock: null }}
      />
    )
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    // The placeholder icon renders inside the card; assert wrapper still mounts.
    expect(screen.getByTestId('GalleryTemplateCard')).toBeInTheDocument()
  })
})
