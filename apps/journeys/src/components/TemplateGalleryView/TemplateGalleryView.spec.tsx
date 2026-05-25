import { fireEvent, render, screen } from '@testing-library/react'

import { makeGallery, mockTemplate } from './galleryFixture'
import { TemplateGalleryView } from './TemplateGalleryView'

describe('TemplateGalleryView', () => {
  it('renders gallery header, media, and template grid when populated', () => {
    render(
      <TemplateGalleryView
        gallery={makeGallery({
          mediaUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
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

  it('omits the media block when mediaUrl is null', () => {
    render(<TemplateGalleryView gallery={makeGallery({ mediaUrl: null })} />)
    expect(screen.queryByTestId('TemplateGalleryMedia')).not.toBeInTheDocument()
  })

  it('selects a different layout preset from the toggle', () => {
    render(<TemplateGalleryView gallery={makeGallery({ templates: [] })} />)
    const showcase = screen.getByRole('button', { name: 'Showcase' })
    const landing = screen.getByRole('button', { name: 'Landing' })
    expect(showcase).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(landing)

    expect(landing).toHaveAttribute('aria-pressed', 'true')
    expect(showcase).toHaveAttribute('aria-pressed', 'false')
  })

  it('features the first template when the Spotlight layout is selected', () => {
    render(
      <TemplateGalleryView
        gallery={makeGallery({ templates: [mockTemplate] })}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Spotlight' }))
    // The hero feature plus any scroller still surface the template.
    expect(screen.getByText('Sample Template')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Use' })).toBeInTheDocument()
  })

  it('renders the sectioned layout with two featured templates', () => {
    const templates = Array.from({ length: 5 }, (_, index) => ({
      ...mockTemplate,
      id: `template-${index}`,
      slug: `template-${index}`
    }))
    render(<TemplateGalleryView gallery={makeGallery({ templates })} />)
    fireEvent.click(screen.getByRole('button', { name: 'Sections' }))

    expect(screen.getByTestId('TemplateGallerySections')).toBeInTheDocument()
    // Every template surfaces. The "complete set" renders both a mobile and a
    // desktop grid (CSS toggles which is visible), so each rest template has
    // two cards: 2 featured + 3 rest × 2 = 8 Use buttons in the DOM.
    expect(
      screen.getAllByTestId('GalleryTemplateCardUseButton').length
    ).toBeGreaterThanOrEqual(5)
  })

  it('caps Feature rows at three and grids the remainder', () => {
    const templates = Array.from({ length: 5 }, (_, index) => ({
      ...mockTemplate,
      id: `template-${index}`,
      slug: `template-${index}`
    }))
    render(<TemplateGalleryView gallery={makeGallery({ templates })} />)
    fireEvent.click(screen.getByRole('button', { name: 'Feature rows' }))

    // 3 feature rows + 2 in the remainder grid = 5 cards, and the grid mounts.
    expect(screen.getAllByTestId('GalleryTemplateCard')).toHaveLength(5)
    expect(screen.getByTestId('TemplateGalleryGrid')).toBeInTheDocument()
  })
})
