import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import { GraphQLError } from 'graphql'

import '../../../../../test/i18n'

import { TemplateGalleryPageMediaType } from '../../../../../__generated__/globalTypes'
import { TEMPLATE_GALLERY_PAGE_EMBED_PREVIEW } from '../../../../libs/useTemplateGalleryPageEmbedPreview'
import {
  CollectionMediaValues,
  EMPTY_MEDIA
} from '../useCollectionForm/collectionMedia'

import { MediaPreview } from './MediaPreview'

const linkMedia = (url: string): CollectionMediaValues => ({
  ...EMPTY_MEDIA,
  type: TemplateGalleryPageMediaType.link,
  url
})
const muxMedia = (
  overrides: Partial<CollectionMediaValues> = {}
): CollectionMediaValues => ({
  ...EMPTY_MEDIA,
  type: TemplateGalleryPageMediaType.mux,
  ...overrides
})

function successMock(url: string, embedUrl: string): MockedResponse {
  return {
    request: { query: TEMPLATE_GALLERY_PAGE_EMBED_PREVIEW, variables: { url } },
    result: { data: { templateGalleryPageEmbedPreview: embedUrl } }
  }
}
function errorMock(url: string, reason: string): MockedResponse {
  return {
    request: { query: TEMPLATE_GALLERY_PAGE_EMBED_PREVIEW, variables: { url } },
    result: {
      errors: [
        new GraphQLError('preview failed', {
          extensions: { code: 'BAD_USER_INPUT', reason }
        })
      ]
    }
  }
}

function renderPreview(
  media: CollectionMediaValues,
  {
    mocks = [],
    compact = false
  }: { mocks?: MockedResponse[]; compact?: boolean } = {}
): void {
  render(
    <MockedProvider mocks={mocks}>
      <MediaPreview media={media} compact={compact} />
    </MockedProvider>
  )
}

describe('MediaPreview', () => {
  describe('link (server-resolved)', () => {
    it('iframes the embedUrl the server returns', async () => {
      const url = 'https://canva.link/0fi14tc9momlpe8'
      const embedUrl = 'https://www.canva.com/design/DAF/x/view?embed'
      renderPreview(linkMedia(url), { mocks: [successMock(url, embedUrl)] })
      expect(
        await screen.findByTestId('GalleryMediaPreviewIframe')
      ).toHaveAttribute('src', embedUrl)
    })

    it('shows a resolving shimmer (not an iframe) while the query is in flight', () => {
      const url = 'https://canva.link/loading'
      renderPreview(linkMedia(url), {
        mocks: [
          {
            request: {
              query: TEMPLATE_GALLERY_PAGE_EMBED_PREVIEW,
              variables: { url }
            },
            result: {
              data: { templateGalleryPageEmbedPreview: 'https://x' }
            },
            delay: Infinity
          }
        ]
      })
      expect(
        screen.getByTestId('GalleryMediaPreviewResolving')
      ).toBeInTheDocument()
      expect(
        screen.queryByTestId('GalleryMediaPreviewIframe')
      ).not.toBeInTheDocument()
    })

    it("maps the provider's error reason to the inline message (full variant)", async () => {
      const url = 'https://youtu.be/Xprivate1A'
      renderPreview(linkMedia(url), {
        mocks: [errorMock(url, 'YOUTUBE_PRIVATE')]
      })
      expect(
        await screen.findByText(/this youtube video is private/i)
      ).toBeInTheDocument()
      expect(
        screen.queryByTestId('GalleryMediaPreviewIframe')
      ).not.toBeInTheDocument()
    })

    it('shows only the plain box (no error text) on error in the compact variant', async () => {
      const url = 'https://youtu.be/Xprivate1A'
      renderPreview(linkMedia(url), {
        compact: true,
        mocks: [errorMock(url, 'YOUTUBE_PRIVATE')]
      })
      // Let the query settle, then assert the compact box has no error copy.
      expect(
        await screen.findByTestId('GalleryMediaPreviewPlaceholder')
      ).toBeInTheDocument()
      expect(
        screen.queryByText(/this youtube video is private/i)
      ).not.toBeInTheDocument()
      // ...and it has settled past the resolving shimmer (the error fired).
      expect(
        screen.queryByTestId('GalleryMediaPreviewResolving')
      ).not.toBeInTheDocument()
    })

    it('does not query for an empty link — shows the paste-a-link placeholder', () => {
      renderPreview(linkMedia(''))
      expect(
        screen.getByText('Paste a link to see a preview')
      ).toBeInTheDocument()
      expect(
        screen.queryByTestId('GalleryMediaPreviewResolving')
      ).not.toBeInTheDocument()
    })

    it('does not query a non-https link — shows the placeholder, not an error', () => {
      // A half-typed / non-https URL is skipped client-side so it never fires
      // a request or surfaces a server error.
      renderPreview(linkMedia('http://canva.com/design/x'))
      expect(
        screen.getByText('Preview appears once you add the link')
      ).toBeInTheDocument()
      expect(
        screen.queryByTestId('GalleryMediaPreviewResolving')
      ).not.toBeInTheDocument()
    })

    it('reverts to the placeholder immediately when the link is cleared (no stale embed)', async () => {
      const url = 'https://canva.link/0fi14tc9momlpe8'
      const embedUrl = 'https://www.canva.com/design/DAF/x/view?embed'
      const { rerender } = render(
        <MockedProvider mocks={[successMock(url, embedUrl)]}>
          <MediaPreview media={linkMedia(url)} />
        </MockedProvider>
      )
      expect(
        await screen.findByTestId('GalleryMediaPreviewIframe')
      ).toBeInTheDocument()
      // Clearing the field skips the debounce, so the resolved embed must not
      // linger for the 500ms window.
      rerender(
        <MockedProvider mocks={[successMock(url, embedUrl)]}>
          <MediaPreview media={linkMedia('')} />
        </MockedProvider>
      )
      expect(
        screen.getByText('Paste a link to see a preview')
      ).toBeInTheDocument()
      expect(
        screen.queryByTestId('GalleryMediaPreviewIframe')
      ).not.toBeInTheDocument()
    })

    it('re-queries and swaps the embed when the link changes', async () => {
      const urlA = 'https://youtu.be/aaaaaaaaaaa'
      const urlB = 'https://youtu.be/bbbbbbbbbbb'
      const embedA = 'https://www.youtube.com/embed/aaaaaaaaaaa'
      const embedB = 'https://www.youtube.com/embed/bbbbbbbbbbb'
      // Both mocks must be in the initial provider — MockedProvider builds its
      // link from the first mocks array and ignores later prop changes.
      const mocks = [successMock(urlA, embedA), successMock(urlB, embedB)]
      const { rerender } = render(
        <MockedProvider mocks={mocks}>
          <MediaPreview media={linkMedia(urlA)} />
        </MockedProvider>
      )
      expect(
        await screen.findByTestId('GalleryMediaPreviewIframe')
      ).toHaveAttribute('src', embedA)
      rerender(
        <MockedProvider mocks={mocks}>
          <MediaPreview media={linkMedia(urlB)} />
        </MockedProvider>
      )
      // The debounce holds the prior embed until the new URL settles — a
      // dropped debounce (a query on every keystroke) would fail this.
      expect(screen.getByTestId('GalleryMediaPreviewIframe')).toHaveAttribute(
        'src',
        embedA
      )
      // Once the debounce settles, the new URL resolves to its own embed. The
      // generous timeout keeps the real 500ms debounce off the waitFor margin.
      await waitFor(
        () =>
          expect(
            screen.getByTestId('GalleryMediaPreviewIframe')
          ).toHaveAttribute('src', embedB),
        { timeout: 2000 }
      )
    })

    it('falls back to the generic message on a network error (no reason to map)', async () => {
      const url = 'https://youtu.be/neterror00'
      renderPreview(linkMedia(url), {
        mocks: [
          {
            request: {
              query: TEMPLATE_GALLERY_PAGE_EMBED_PREVIEW,
              variables: { url }
            },
            error: new Error('Network down')
          }
        ]
      })
      expect(
        await screen.findByText(
          "We couldn't add that media. Check the link and try again."
        )
      ).toBeInTheDocument()
    })

    it('clears a resolved embed when the next link errors (no stale embed over an error)', async () => {
      const urlA = 'https://youtu.be/resolvedok0'
      const urlB = 'https://youtu.be/Xprivateee1'
      const embedA = 'https://www.youtube.com/embed/resolvedok0'
      const mocks = [
        successMock(urlA, embedA),
        errorMock(urlB, 'YOUTUBE_PRIVATE')
      ]
      const { rerender } = render(
        <MockedProvider mocks={mocks}>
          <MediaPreview media={linkMedia(urlA)} />
        </MockedProvider>
      )
      expect(
        await screen.findByTestId('GalleryMediaPreviewIframe')
      ).toHaveAttribute('src', embedA)
      rerender(
        <MockedProvider mocks={mocks}>
          <MediaPreview media={linkMedia(urlB)} />
        </MockedProvider>
      )
      // The second URL fails validation — the prior embed must give way to the
      // inline error, never linger over it.
      expect(
        await screen.findByText(/this youtube video is private/i, undefined, {
          timeout: 2000
        })
      ).toBeInTheDocument()
      expect(
        screen.queryByTestId('GalleryMediaPreviewIframe')
      ).not.toBeInTheDocument()
    })

    it('falls back to the generic message for an unmapped provider reason', async () => {
      // Forward-compat: a backend reason the frontend hasn't mapped yet must
      // degrade to the generic copy, never surface the raw code.
      const url = 'https://youtu.be/futurecode'
      renderPreview(linkMedia(url), {
        mocks: [errorMock(url, 'SOME_FUTURE_REASON')]
      })
      expect(
        await screen.findByText(
          "We couldn't add that media. Check the link and try again."
        )
      ).toBeInTheDocument()
    })
  })

  describe('mux (no query)', () => {
    it('renders the thumbnail for an existing upload', () => {
      renderPreview(muxMedia({ muxPlaybackId: 'pb-1' }))
      expect(
        screen.getByTestId('GalleryMediaPreviewThumbnail')
      ).toHaveAttribute('src', 'https://image.mux.com/pb-1/thumbnail.jpg')
    })

    it('shows a processing placeholder for a fresh upload without a playbackId', () => {
      renderPreview(muxMedia({ muxVideoId: 'v1' }))
      expect(screen.getByText('Processing video…')).toBeInTheDocument()
    })

    it('shows an idle placeholder for an empty upload slot', () => {
      renderPreview(muxMedia())
      expect(
        screen.getByText('Your uploaded video will appear here')
      ).toBeInTheDocument()
    })
  })

  it('renders nothing for none media (full variant)', () => {
    const { container } = render(
      <MockedProvider mocks={[]}>
        <MediaPreview media={EMPTY_MEDIA} />
      </MockedProvider>
    )
    expect(
      screen.queryByTestId('GalleryMediaPreviewPlaceholder')
    ).not.toBeInTheDocument()
    expect(container).toBeEmptyDOMElement()
  })
})
