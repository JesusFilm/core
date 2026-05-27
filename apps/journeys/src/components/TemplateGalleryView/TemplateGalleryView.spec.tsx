import { render, screen, within } from '@testing-library/react'

import { makeGallery, mockTemplate } from './galleryFixture'
import { TemplateGalleryView } from './TemplateGalleryView'

describe('TemplateGalleryView', () => {
  it('renders the gallery header, templates, and media when populated', () => {
    render(
      <TemplateGalleryView
        gallery={makeGallery({
          mediaUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          templates: [mockTemplate]
        })}
      />
    )
    expect(screen.getByTestId('PublicTemplateGallery')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Easter Gallery 2026' })
    ).toBeInTheDocument()
    expect(screen.getByText('Sample Template')).toBeInTheDocument()
    expect(screen.getByTestId('PublicTemplateGalleryMedia')).toBeInTheDocument()

    const card = screen.getByTestId('PublicTemplateGalleryCard')
    expect(within(card).getByRole('link', { name: 'Use' })).toHaveAttribute(
      'href',
      'https://admin.nextstep.is/?useTemplate=template-1'
    )
    expect(within(card).getByRole('link', { name: 'Preview' })).toHaveAttribute(
      'href',
      '/sample-template'
    )
  })

  it('shows the empty state when there are no templates', () => {
    render(<TemplateGalleryView gallery={makeGallery({ templates: [] })} />)
    expect(
      screen.getByTestId('PublicTemplateGalleryEmptyState')
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId('PublicTemplateGalleryCard')
    ).not.toBeInTheDocument()
  })

  it('omits the media block when mediaUrl is null', () => {
    render(<TemplateGalleryView gallery={makeGallery({ mediaUrl: null })} />)
    expect(
      screen.queryByTestId('PublicTemplateGalleryMedia')
    ).not.toBeInTheDocument()
  })
})
