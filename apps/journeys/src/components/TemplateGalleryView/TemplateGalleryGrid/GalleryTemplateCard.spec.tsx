import { render, screen } from '@testing-library/react'

import { mockTemplate } from '../galleryFixture'

import { GalleryTemplateCard } from './GalleryTemplateCard'

describe('GalleryTemplateCard', () => {
  it('renders title, description, language, and image with the supplied href', () => {
    render(
      <GalleryTemplateCard
        template={mockTemplate}
        href="https://admin.nextstep.is/?useTemplate=template-1"
      />
    )

    const link = screen.getByRole('link', { name: 'Sample Template' })
    expect(link).toHaveAttribute(
      'href',
      'https://admin.nextstep.is/?useTemplate=template-1'
    )
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')

    expect(screen.getByText('Sample Template')).toBeInTheDocument()
    expect(
      screen.getByText('A sample template for testing')
    ).toBeInTheDocument()
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByAltText('Sample image')).toBeInTheDocument()
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
