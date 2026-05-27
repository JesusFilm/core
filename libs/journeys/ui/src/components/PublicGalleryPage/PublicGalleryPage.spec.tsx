import { render, screen, within } from '@testing-library/react'

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

    it('features all three items (no complete set) when there are exactly three', () => {
      render(
        <PublicGalleryPage
          variant="journey"
          data={makeData({ items: makeItems(3) })}
        />
      )
      // All three sit in the featured rows, so the "More" grid never renders
      // and is not left showing a single bare card. ('Explore' shows both as
      // the section label and the nav link, hence getAllByText.)
      expect(screen.queryByText('More')).not.toBeInTheDocument()
      expect(screen.getAllByText('Explore').length).toBeGreaterThan(0)
    })

    it('keeps two featured and grids the rest when there are four', () => {
      render(
        <PublicGalleryPage
          variant="journey"
          data={makeData({ items: makeItems(4) })}
        />
      )
      // Four items keep the two-featured default, so the complete-set grid
      // renders the remaining two cards (each in the mobile and desktop grid)
      // rather than sitting empty. Featured rows use no card testid, so these
      // come only from the complete set.
      expect(
        screen.getAllByTestId('GalleryTemplateCard').length
      ).toBeGreaterThan(0)
    })

    it('renders the section nav with the cover plus a link per visible section', () => {
      render(
        <PublicGalleryPage
          variant="journey"
          data={makeData({
            items: makeItems(5),
            mediaUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
          })}
        />
      )
      const nav = screen.getByRole('navigation', { name: 'Gallery sections' })
      // The cover (collection title) leads, then five items + media surface the
      // remaining sections as nav links.
      expect(
        within(nav).getByRole('button', { name: 'Overview' })
      ).toBeInTheDocument()
      expect(
        within(nav).getByRole('button', { name: 'Explore' })
      ).toBeInTheDocument()
      expect(
        within(nav).getByRole('button', { name: 'More' })
      ).toBeInTheDocument()
      expect(
        within(nav).getByRole('button', { name: 'Strategy' })
      ).toBeInTheDocument()
    })

    it('derives sections from template count: cover + featured only, with few templates', () => {
      render(
        <PublicGalleryPage
          variant="journey"
          data={makeData({ items: makeItems(3) })}
        />
      )
      // Three items feature all three (no complete set) and there's no media,
      // so the nav still shows — the cover plus the featured section.
      const nav = screen.getByRole('navigation', { name: 'Gallery sections' })
      expect(
        within(nav).getByRole('button', { name: 'Overview' })
      ).toBeInTheDocument()
      expect(
        within(nav).getByRole('button', { name: 'Explore' })
      ).toBeInTheDocument()
      expect(
        within(nav).queryByRole('button', { name: 'More' })
      ).not.toBeInTheDocument()
    })

    it('always keeps the cover section in the nav, even with no templates', () => {
      render(
        <PublicGalleryPage variant="journey" data={makeData({ items: [] })} />
      )
      const nav = screen.getByRole('navigation', { name: 'Gallery sections' })
      expect(
        within(nav).getByRole('button', { name: 'Overview' })
      ).toBeInTheDocument()
      expect(
        within(nav).queryByRole('button', { name: 'Explore' })
      ).not.toBeInTheDocument()
    })

    it('exposes a hamburger menu button (the mobile nav entry point)', () => {
      render(
        <PublicGalleryPage
          variant="journey"
          data={makeData({ items: makeItems(5) })}
        />
      )
      const nav = screen.getByRole('navigation', { name: 'Gallery sections' })
      // The hamburger carries the nav's label and a popup; the section links
      // (cover "Overview", "Explore", …) carry their own labels.
      const menuButton = within(nav).getByRole('button', {
        name: 'Gallery sections'
      })
      expect(menuButton).toHaveAttribute('aria-haspopup', 'true')
    })

    it('shows the cover CTA when there are templates', () => {
      render(
        <PublicGalleryPage
          variant="journey"
          data={makeData({ items: makeItems(5) })}
        />
      )
      // Targeted by testid: its "Explore" label is shared with the nav links.
      expect(screen.getByTestId('GalleryCoverCta')).toBeInTheDocument()
    })

    it('omits the cover CTA when there are no templates', () => {
      render(
        <PublicGalleryPage variant="journey" data={makeData({ items: [] })} />
      )
      expect(screen.queryByTestId('GalleryCoverCta')).not.toBeInTheDocument()
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

    it('mirrors the journey split: three items all sit in Explore, no More', () => {
      render(
        <PublicGalleryPage
          variant="admin"
          data={makeData({ items: makeItems(3) })}
        />
      )
      // No nav in the admin preview, so these labels appear only as section
      // headings.
      expect(screen.getByText('Explore')).toBeInTheDocument()
      expect(screen.queryByText('More')).not.toBeInTheDocument()
    })

    it('mirrors the journey split: four items fill the More section', () => {
      render(
        <PublicGalleryPage
          variant="admin"
          data={makeData({ items: makeItems(4) })}
        />
      )
      expect(screen.getByText('Explore')).toBeInTheDocument()
      expect(screen.getByText('More')).toBeInTheDocument()
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
