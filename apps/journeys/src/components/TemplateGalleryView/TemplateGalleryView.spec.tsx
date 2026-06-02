import { render, screen } from '@testing-library/react'

import { makeGallery, makeLinkMedia, mockTemplate } from './galleryFixture'
import { TemplateGalleryView } from './TemplateGalleryView'

describe('TemplateGalleryView', () => {
  it('renders gallery header, media, and template grid when populated', () => {
    render(
      <TemplateGalleryView
        gallery={makeGallery({
          media: makeLinkMedia(
            'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
          ),
          templates: [mockTemplate]
        })}
      />
    )
    expect(screen.getByTestId('TemplateGalleryHeader')).toBeInTheDocument()
    expect(screen.getByTestId('TemplateGalleryMedia')).toBeInTheDocument()
    expect(screen.getByTestId('TemplateGalleryGrid')).toBeInTheDocument()
    expect(screen.getByTestId('GalleryTemplateCard')).toBeInTheDocument()
    expect(screen.getByText('Sample Template')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Use' })).toHaveAttribute(
      'href',
      'https://admin.nextstep.is/?useTemplate=template-1'
    )
    expect(screen.getByRole('link', { name: 'Preview' })).toHaveAttribute(
      'href',
      '/sample-template'
    )
  })

  it('shows the empty state when there are no templates', () => {
    render(<TemplateGalleryView gallery={makeGallery({ templates: [] })} />)
    expect(screen.getByTestId('TemplateGalleryEmptyState')).toBeInTheDocument()
    expect(screen.queryByTestId('TemplateGalleryGrid')).not.toBeInTheDocument()
  })

  it('omits the media block when media is null', () => {
    render(<TemplateGalleryView gallery={makeGallery({ media: null })} />)
    expect(screen.queryByTestId('TemplateGalleryMedia')).not.toBeInTheDocument()
  })
})
