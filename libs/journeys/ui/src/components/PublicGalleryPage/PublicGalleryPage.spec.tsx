import { render, screen, within } from '@testing-library/react'

import { PublicGalleryPage } from './PublicGalleryPage'
import { makeData, makeItems, mockItem } from './publicGalleryPageData.mock'

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
      // Per-card aria-labels (e.g. "Use {{title}}") mean role-name queries
      // don't resolve in this stubbed-t environment; testids are stable.
      expect(
        screen.getAllByTestId('GalleryTemplateCardUseButton')[0]
      ).toHaveAttribute(
        'href',
        'https://admin.nextstep.is/?useTemplate=template-0'
      )
      expect(
        screen.getAllByTestId('GalleryTemplateCardPreviewButton')[0]
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

    describe('admin URL construction', () => {
      // Restore the env var between tests so override/fallback don't leak.
      const originalAdminUrl = process.env.NEXT_PUBLIC_JOURNEYS_ADMIN_URL

      afterEach(() => {
        if (originalAdminUrl == null) {
          delete process.env.NEXT_PUBLIC_JOURNEYS_ADMIN_URL
        } else {
          process.env.NEXT_PUBLIC_JOURNEYS_ADMIN_URL = originalAdminUrl
        }
      })

      it('encodes special characters in the template id via URLSearchParams', () => {
        // URLSearchParams uses application/x-www-form-urlencoded: spaces become
        // `+`, `/` becomes `%2F`, `&` becomes `%26`. Pinning this so a future
        // change to URL construction can't silently shift the encoding.
        const items = [{ ...mockItem, id: 'tmpl/with spaces&chars' }]
        render(
          <PublicGalleryPage variant="journey" data={makeData({ items })} />
        )
        expect(
          screen.getAllByTestId('GalleryTemplateCardUseButton')[0]
        ).toHaveAttribute(
          'href',
          'https://admin.nextstep.is/?useTemplate=tmpl%2Fwith+spaces%26chars'
        )
      })

      it('uses NEXT_PUBLIC_JOURNEYS_ADMIN_URL when set', () => {
        process.env.NEXT_PUBLIC_JOURNEYS_ADMIN_URL =
          'https://staging.example.com'
        render(
          <PublicGalleryPage
            variant="journey"
            data={makeData({ items: makeItems(1) })}
          />
        )
        expect(
          screen.getAllByTestId('GalleryTemplateCardUseButton')[0]
        ).toHaveAttribute(
          'href',
          'https://staging.example.com/?useTemplate=template-0'
        )
      })

      it('falls back to https://admin.nextstep.is when env unset', () => {
        delete process.env.NEXT_PUBLIC_JOURNEYS_ADMIN_URL
        render(
          <PublicGalleryPage
            variant="journey"
            data={makeData({ items: makeItems(1) })}
          />
        )
        expect(
          screen.getAllByTestId('GalleryTemplateCardUseButton')[0]
        ).toHaveAttribute(
          'href',
          'https://admin.nextstep.is/?useTemplate=template-0'
        )
      })

      it('preserves the env value verbatim — a trailing slash does not double the path', () => {
        process.env.NEXT_PUBLIC_JOURNEYS_ADMIN_URL =
          'https://staging.example.com/'
        render(
          <PublicGalleryPage
            variant="journey"
            data={makeData({ items: makeItems(1) })}
          />
        )
        // `new URL('/', base)` collapses the duplicate slash that the old
        // template-string construction produced.
        expect(
          screen.getAllByTestId('GalleryTemplateCardUseButton')[0]
        ).toHaveAttribute(
          'href',
          'https://staging.example.com/?useTemplate=template-0'
        )
      })

      it('falls back to a sanitised template string when the env value is schemeless', () => {
        // `new URL('/', 'admin.staging.local')` throws because the base isn't a
        // valid absolute URL. The guard in buildUseTemplateHref catches it and
        // hand-builds the href, so render doesn't crash.
        process.env.NEXT_PUBLIC_JOURNEYS_ADMIN_URL = 'admin.staging.local'
        render(
          <PublicGalleryPage
            variant="journey"
            data={makeData({ items: makeItems(1) })}
          />
        )
        expect(
          screen.getAllByTestId('GalleryTemplateCardUseButton')[0]
        ).toHaveAttribute('href', 'admin.staging.local/?useTemplate=template-0')
      })
    })

    describe('card action links', () => {
      it('carry rel="noopener noreferrer" and target="_blank" on Use and Preview', () => {
        render(
          <PublicGalleryPage
            variant="journey"
            data={makeData({ items: makeItems(1) })}
          />
        )
        const useLink = screen.getAllByTestId('GalleryTemplateCardUseButton')[0]
        const previewLink = screen.getAllByTestId(
          'GalleryTemplateCardPreviewButton'
        )[0]
        expect(useLink).toHaveAttribute('target', '_blank')
        expect(useLink).toHaveAttribute('rel', 'noopener noreferrer')
        expect(previewLink).toHaveAttribute('target', '_blank')
        expect(previewLink).toHaveAttribute('rel', 'noopener noreferrer')
      })

      it('encodes a slug containing "/" so it never escapes the route', () => {
        const items = [{ ...mockItem, id: 'template-0', slug: 'foo/bar' }]
        render(
          <PublicGalleryPage variant="journey" data={makeData({ items })} />
        )
        // The slug is run through encodeURIComponent before being interpolated
        // into the preview path, so "/" becomes "%2F" and can't be read as a
        // path-segment separator.
        expect(
          screen.getAllByTestId('GalleryTemplateCardPreviewButton')[0]
        ).toHaveAttribute('href', '/foo%2Fbar')
      })

      it('gives Preview buttons an aria-label keyed on the item title', () => {
        // The stubbed-t test environment returns keys verbatim and does NOT
        // interpolate `{{title}}`, so we assert on the key shape rather than
        // an interpolated value. The presence of `{{title}}` in the rendered
        // attribute proves the `t('Preview {{title}}', { title: itemTitle })`
        // call site is wired correctly — production i18n then interpolates
        // it into a distinct, screen-reader-friendly label per card.
        render(
          <PublicGalleryPage
            variant="journey"
            data={makeData({ items: makeItems(1) })}
          />
        )
        const preview = screen.getAllByTestId(
          'GalleryTemplateCardPreviewButton'
        )[0]
        expect(preview.getAttribute('aria-label')).toMatch(/\{\{title\}\}/)
        expect(preview.getAttribute('aria-label')).not.toBe('Preview')
      })
    })

    describe('meta line', () => {
      it('omits the language when languageName is empty', () => {
        const items = [
          {
            ...mockItem,
            languageName: [],
            createdAt: '2026-01-15T00:00:00.000Z'
          }
        ]
        render(
          <PublicGalleryPage variant="journey" data={makeData({ items })} />
        )
        // metaLine returns just the date when there's no language to join.
        expect(screen.getByText('January 2026')).toBeInTheDocument()
      })

      it('omits the date when createdAt is null', () => {
        const items = [{ ...mockItem, createdAt: null }]
        render(
          <PublicGalleryPage variant="journey" data={makeData({ items })} />
        )
        // No "Month Year" string anywhere on the page.
        expect(
          screen.queryByText(/^[A-Z][a-z]+ \d{4}$/)
        ).not.toBeInTheDocument()
      })
    })

    it('renders the placeholder icon when an item has no image', () => {
      // MUI sets a `data-testid="<Name>Icon"` on SvgIcon outside production.
      const items = [{ ...mockItem, image: null }]
      render(<PublicGalleryPage variant="journey" data={makeData({ items })} />)
      expect(
        screen.getAllByTestId('InsertPhotoRoundedIcon').length
      ).toBeGreaterThan(0)
    })

    it('preserves newlines in the collection description (pre-wrap)', () => {
      render(
        <PublicGalleryPage
          variant="journey"
          data={makeData({ description: 'line one\nline two' })}
        />
      )
      // RTL's default normaliser would collapse the newline; the identity
      // normaliser proves the DOM text node still carries it (the pre-wrap
      // style class is what then renders it on its own line in the browser).
      expect(
        screen.getByText('line one\nline two', { normalizer: (text) => text })
      ).toBeInTheDocument()
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
