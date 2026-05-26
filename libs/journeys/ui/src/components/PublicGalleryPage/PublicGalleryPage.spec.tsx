import { render, screen } from '@testing-library/react'

import { PublicGalleryPage } from './PublicGalleryPage'
import { makeData, makeItems } from './publicGalleryPageData.mock'

describe('PublicGalleryPage', () => {
  describe('journey variant', () => {
    it('renders the sectioned layout with header and templates', () => {
      render(
        <PublicGalleryPage
          variant="journey"
          data={makeData({ items: makeItems(5) })}
        />
      )
      expect(screen.getByTestId('TemplateGallerySections')).toBeInTheDocument()
      expect(screen.getByTestId('TemplateGalleryHeader')).toBeInTheDocument()
      expect(screen.getAllByText('Sample Template').length).toBeGreaterThan(0)
    })

    it('builds the admin deep link and viewer link from item id and slug', () => {
      render(
        <PublicGalleryPage
          variant="journey"
          data={makeData({ items: makeItems(5) })}
        />
      )
      expect(screen.getAllByRole('link', { name: 'Use' })[0]).toHaveAttribute(
        'href',
        'https://admin.nextstep.is/?useTemplate=template-0'
      )
      expect(
        screen.getAllByRole('link', { name: 'Preview' })[0]
      ).toHaveAttribute('href', '/template-0')
    })

    it('features the first two items and grids the rest', () => {
      render(
        <PublicGalleryPage
          variant="journey"
          data={makeData({ items: makeItems(5) })}
        />
      )
      // The rest grid renders both a mobile and desktop grid (CSS toggles
      // which is visible), so 2 featured rows + 3 rest × 2 = at least 5 Use
      // buttons surface.
      expect(
        screen.getAllByTestId('GalleryTemplateCardUseButton').length
      ).toBeGreaterThanOrEqual(5)
    })

    it('shows the empty state when there are no items', () => {
      render(
        <PublicGalleryPage variant="journey" data={makeData({ items: [] })} />
      )
      expect(
        screen.getByTestId('TemplateGalleryEmptyState')
      ).toBeInTheDocument()
      expect(
        screen.queryByTestId('GalleryTemplateCard')
      ).not.toBeInTheDocument()
    })

    it('renders the media section when mediaUrl is set', () => {
      render(
        <PublicGalleryPage
          variant="journey"
          data={makeData({
            mediaUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
          })}
        />
      )
      expect(screen.getByTestId('TemplateGalleryMedia')).toBeInTheDocument()
    })

    it('omits the media section when mediaUrl is null', () => {
      render(
        <PublicGalleryPage
          variant="journey"
          data={makeData({ mediaUrl: null })}
        />
      )
      expect(
        screen.queryByTestId('TemplateGalleryMedia')
      ).not.toBeInTheDocument()
    })
  })

  describe('admin variant', () => {
    it('renders the compact recreation with item titles', () => {
      render(
        <PublicGalleryPage
          variant="admin"
          data={makeData({ items: makeItems(3) })}
        />
      )
      expect(
        screen.getByTestId('PublicGalleryPageAdminView')
      ).toBeInTheDocument()
      expect(screen.getByText('Easter Gallery 2026')).toBeInTheDocument()
      expect(screen.getAllByText('Sample Template')).toHaveLength(3)
    })

    it('renders decorative, non-interactive actions (no real links)', () => {
      render(
        <PublicGalleryPage
          variant="admin"
          data={makeData({ items: makeItems(2) })}
        />
      )
      expect(
        screen.queryByRole('link', { name: 'Use' })
      ).not.toBeInTheDocument()
      // The journey view's full sections never mount in the admin variant.
      expect(
        screen.queryByTestId('TemplateGallerySections')
      ).not.toBeInTheDocument()
    })

    it('shows placeholder copy when fields are empty', () => {
      render(
        <PublicGalleryPage
          variant="admin"
          data={makeData({
            items: [],
            title: '',
            description: '',
            creatorName: ''
          })}
        />
      )
      expect(screen.getByText('Untitled collection')).toBeInTheDocument()
      expect(
        screen.getByText(
          'A short description of your collection will appear here.'
        )
      ).toBeInTheDocument()
      expect(screen.getByText('Creator name')).toBeInTheDocument()
    })
  })
})
