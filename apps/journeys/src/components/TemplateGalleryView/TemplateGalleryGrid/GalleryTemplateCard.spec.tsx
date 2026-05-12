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

  it('renders a labelled Use button that opens the admin deep link in a new tab', () => {
    render(<GalleryTemplateCard template={mockTemplate} />)

    const useButton = screen.getByRole('link', { name: 'Use' })
    expect(useButton).toHaveAttribute(
      'href',
      'https://admin.nextstep.is/?useTemplate=template-1'
    )
    expect(useButton).toHaveAttribute('target', '_blank')
    expect(useButton).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders Preview as an unlabelled icon button with the Play3 icon that opens the journey slug in a new tab', () => {
    render(<GalleryTemplateCard template={mockTemplate} />)

    const previewIconButton = screen.getByRole('link', { name: 'Preview' })
    expect(previewIconButton).toHaveAttribute('href', '/sample-template')
    expect(previewIconButton).toHaveAttribute('target', '_blank')
    expect(previewIconButton).toHaveAttribute('rel', 'noopener noreferrer')
    expect(previewIconButton).not.toHaveTextContent('Preview')
    expect(
      previewIconButton.querySelector('[data-testid="Play3Icon"]')
    ).not.toBeNull()
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
      <GalleryTemplateCard template={{ ...mockTemplate, description: '' }} />
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
