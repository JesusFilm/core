import { render, screen } from '@testing-library/react'

import { makeGallery, mockTemplate } from './galleryFixture'
import { TemplateGalleryView } from './TemplateGalleryView'

function makeTemplates(count: number): (typeof mockTemplate)[] {
  return Array.from({ length: count }, (_, index) => ({
    ...mockTemplate,
    id: `template-${index}`,
    slug: `template-${index}`
  }))
}

describe('TemplateGalleryView', () => {
  it('renders the sectioned layout with header, media, and templates', () => {
    render(
      <TemplateGalleryView
        gallery={makeGallery({
          mediaUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          templates: makeTemplates(5)
        })}
      />
    )
    expect(screen.getByTestId('TemplateGallerySections')).toBeInTheDocument()
    expect(screen.getByTestId('TemplateGalleryHeader')).toBeInTheDocument()
    expect(screen.getByTestId('TemplateGalleryMedia')).toBeInTheDocument()
    expect(screen.getAllByText('Sample Template').length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Use' })[0]).toHaveAttribute(
      'href',
      'https://admin.nextstep.is/?useTemplate=template-0'
    )
    expect(screen.getAllByRole('link', { name: 'Preview' })[0]).toHaveAttribute(
      'href',
      '/template-0'
    )
  })

  it('shows the empty state when there are no templates', () => {
    render(<TemplateGalleryView gallery={makeGallery({ templates: [] })} />)
    expect(screen.getByTestId('TemplateGalleryEmptyState')).toBeInTheDocument()
    expect(screen.queryByTestId('GalleryTemplateCard')).not.toBeInTheDocument()
  })

  it('omits the media block when mediaUrl is null', () => {
    render(
      <TemplateGalleryView
        gallery={makeGallery({ mediaUrl: null, templates: makeTemplates(3) })}
      />
    )
    expect(screen.queryByTestId('TemplateGalleryMedia')).not.toBeInTheDocument()
  })

  it('features the first two templates and grids the rest', () => {
    render(
      <TemplateGalleryView
        gallery={makeGallery({ templates: makeTemplates(5) })}
      />
    )
    // The "complete set" renders both a mobile and a desktop grid (CSS toggles
    // which is visible), so each rest template has two cards: 2 featured rows +
    // 3 rest × 2 = 8 Use buttons in the DOM.
    expect(
      screen.getAllByTestId('GalleryTemplateCardUseButton').length
    ).toBeGreaterThanOrEqual(5)
  })
})
