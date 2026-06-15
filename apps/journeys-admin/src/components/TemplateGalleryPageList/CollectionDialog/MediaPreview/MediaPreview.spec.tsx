import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
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
      renderPreview(linkMedia(url), { mocks: [errorMock(url, 'YOUTUBE_PRIVATE')] })
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
  })

  describe('mux (no query)', () => {
    it('renders the thumbnail for an existing upload', () => {
      renderPreview(muxMedia({ muxPlaybackId: 'pb-1' }))
      expect(screen.getByTestId('GalleryMediaPreviewThumbnail')).toHaveAttribute(
        'src',
        'https://image.mux.com/pb-1/thumbnail.jpg'
      )
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
