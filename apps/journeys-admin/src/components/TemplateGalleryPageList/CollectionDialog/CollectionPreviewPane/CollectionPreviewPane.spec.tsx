import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SnackbarProvider } from 'notistack'

import '../../../../../test/i18n'

import { CollectionPreviewPane } from './CollectionPreviewPane'

describe('CollectionPreviewPane', () => {
  let originalOpen: typeof window.open

  beforeEach(() => {
    originalOpen = window.open
    window.open = vi.fn()
  })

  afterEach(() => {
    window.open = originalOpen
  })

  const baseValues = {
    title: 'My Collection',
    description: '',
    creatorName: 'Creator',
    creatorImageSrc: '',
    creatorImageAlt: '',
    media: { type: 'none' as const }
  }

  function renderPane(
    overrides: Partial<React.ComponentProps<typeof CollectionPreviewPane>> = {}
  ): void {
    render(
      <SnackbarProvider>
        <CollectionPreviewPane
          values={baseValues}
          selectedJourneysOrdered={[]}
          publicUrl="https://your.nextstep.is/template-gallery/my-collection"
          slug="my-collection"
          {...overrides}
        />
      </SnackbarProvider>
    )
  }

  it('opens the proxy URL in a new tab when "Open in new tab" is clicked', async () => {
    renderPane()
    await userEvent.click(
      screen.getByRole('button', { name: 'Open in new tab' })
    )
    expect(window.open).toHaveBeenCalledWith(
      '/api/preview-template-gallery?slug=my-collection',
      '_blank',
      'noopener,noreferrer'
    )
  })

  it('disables Open when publicUrl is null', () => {
    renderPane({ publicUrl: null, slug: null })
    expect(
      screen.getByRole('button', { name: 'Open in new tab' })
    ).toBeDisabled()
  })

  it('disables Open when canPublish is false', () => {
    renderPane({
      canPublish: false,
      publishBlockedReason: 'gate copy'
    })
    expect(
      screen.getByRole('button', { name: 'Open in new tab' })
    ).toBeDisabled()
  })

  it('disables Open when slug is missing', () => {
    renderPane({
      slug: null,
      publicUrl: 'https://your.nextstep.is/template-gallery/something'
    })
    expect(
      screen.getByRole('button', { name: 'Open in new tab' })
    ).toBeDisabled()
  })

  describe('media preview', () => {
    it('normalizes a YouTube watch URL and renders an iframe', () => {
      renderPane({
        values: {
          ...baseValues,
          media: { type: 'link', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }
        }
      })
      expect(screen.getByTestId('GalleryMediaPreviewIframe')).toHaveAttribute(
        'src',
        'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
      )
    })

    it('shows a save-first placeholder for a Canva URL (needs server normalization)', () => {
      renderPane({
        values: {
          ...baseValues,
          media: { type: 'link', url: 'https://www.canva.com/design/DA/view' }
        }
      })
      expect(
        screen.queryByTestId('GalleryMediaPreviewIframe')
      ).not.toBeInTheDocument()
      expect(
        screen.getByText('Preview available after saving')
      ).toBeInTheDocument()
    })

    it('does not iframe a non-allowlisted or non-https URL', () => {
      renderPane({
        values: {
          ...baseValues,
          media: { type: 'link', url: 'http://evil.example/x' }
        }
      })
      expect(
        screen.queryByTestId('GalleryMediaPreviewIframe')
      ).not.toBeInTheDocument()
    })

    it('renders a Mux thumbnail for an existing upload', () => {
      renderPane({
        values: {
          ...baseValues,
          media: { type: 'mux', muxVideoId: '', muxPlaybackId: 'pb-1' }
        }
      })
      expect(
        screen.getByTestId('GalleryMediaPreviewThumbnail')
      ).toHaveAttribute('src', 'https://image.mux.com/pb-1/thumbnail.jpg')
    })

    it('shows a processing placeholder for a fresh upload without a playbackId', () => {
      renderPane({
        values: {
          ...baseValues,
          media: { type: 'mux', muxVideoId: 'v1' }
        }
      })
      expect(screen.getByText('Processing video…')).toBeInTheDocument()
    })

    it('renders no media node when media is none', () => {
      renderPane()
      expect(
        screen.queryByTestId('GalleryMediaPreviewIframe')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByTestId('GalleryMediaPreviewPlaceholder')
      ).not.toBeInTheDocument()
    })
  })
})
