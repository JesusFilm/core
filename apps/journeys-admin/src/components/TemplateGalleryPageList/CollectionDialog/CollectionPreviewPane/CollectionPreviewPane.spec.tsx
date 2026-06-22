import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GraphQLError } from 'graphql'
import { SnackbarProvider } from 'notistack'

import '../../../../../test/i18n'

import { TemplateGalleryPageMediaType } from '../../../../../__generated__/globalTypes'
import { TEMPLATE_GALLERY_PAGE_EMBED_PREVIEW } from '../../../../libs/useTemplateGalleryPageEmbedPreview'
import {
  CollectionMediaValues,
  EMPTY_MEDIA
} from '../useCollectionForm/collectionMedia'

import { CollectionPreviewPane } from './CollectionPreviewPane'

// A mock for the link preview-resolve query (the server normalizer that the
// preview now calls). `result` for a resolved embedUrl, or pass `errors`.
function embedPreviewMock(
  url: string,
  result: { embedUrl: string } | { reason: string }
): MockedResponse {
  return {
    request: { query: TEMPLATE_GALLERY_PAGE_EMBED_PREVIEW, variables: { url } },
    result:
      'embedUrl' in result
        ? { data: { templateGalleryPageEmbedPreview: result.embedUrl } }
        : {
            errors: [
              new GraphQLError('preview failed', {
                extensions: { code: 'BAD_USER_INPUT', reason: result.reason }
              })
            ]
          }
  }
}

function linkMedia(url: string): CollectionMediaValues {
  return { ...EMPTY_MEDIA, type: TemplateGalleryPageMediaType.link, url }
}

function muxMedia(
  overrides: Partial<CollectionMediaValues> = {}
): CollectionMediaValues {
  return {
    ...EMPTY_MEDIA,
    type: TemplateGalleryPageMediaType.mux,
    ...overrides
  }
}

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
    media: EMPTY_MEDIA
  }

  function renderPane(
    overrides: Partial<React.ComponentProps<typeof CollectionPreviewPane>> = {},
    mocks: MockedResponse[] = []
  ): void {
    render(
      <MockedProvider mocks={mocks}>
        <SnackbarProvider>
          <CollectionPreviewPane
            values={baseValues}
            selectedJourneysOrdered={[]}
            publicUrl="https://your.nextstep.is/template-gallery/my-collection"
            slug="my-collection"
            {...overrides}
          />
        </SnackbarProvider>
      </MockedProvider>
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
    it('renders the server-resolved embed iframe for a link', async () => {
      // The preview calls templateGalleryPageEmbedPreview (the same normalizer
      // as save) and iframes whatever embedUrl it returns — incl. a canva.link
      // short link the client can't resolve itself.
      const url = 'https://canva.link/0fi14tc9momlpe8'
      const embedUrl = 'https://www.canva.com/design/DAF/my-slug/view?embed'
      renderPane({ values: { ...baseValues, media: linkMedia(url) } }, [
        embedPreviewMock(url, { embedUrl })
      ])
      expect(
        await screen.findByTestId('GalleryMediaPreviewIframe')
      ).toHaveAttribute('src', embedUrl)
    })

    it('shows the provider error inline when the link cannot be resolved', async () => {
      const url = 'https://youtu.be/Xprivate1A'
      renderPane({ values: { ...baseValues, media: linkMedia(url) } }, [
        embedPreviewMock(url, { reason: 'YOUTUBE_PRIVATE' })
      ])
      expect(
        await screen.findByText(/this youtube video is private/i)
      ).toBeInTheDocument()
      expect(
        screen.queryByTestId('GalleryMediaPreviewIframe')
      ).not.toBeInTheDocument()
    })

    it('renders a Mux thumbnail for an existing upload', () => {
      renderPane({
        values: {
          ...baseValues,
          media: muxMedia({ muxPlaybackId: 'pb-1' })
        }
      })
      expect(
        screen.getByTestId('GalleryMediaPreviewThumbnail')
      ).toHaveAttribute('src', 'https://image.mux.com/pb-1/thumbnail.jpg')
    })

    it('shows a loading skeleton until the Mux thumbnail loads', () => {
      renderPane({
        values: {
          ...baseValues,
          media: muxMedia({ muxPlaybackId: 'pb-1' })
        }
      })
      expect(
        screen.getByTestId('GalleryMediaPreviewSkeleton')
      ).toBeInTheDocument()
      fireEvent.load(screen.getByTestId('GalleryMediaPreviewThumbnail'))
      expect(
        screen.queryByTestId('GalleryMediaPreviewSkeleton')
      ).not.toBeInTheDocument()
    })

    it('shows a processing placeholder for a fresh upload without a playbackId', () => {
      renderPane({
        values: {
          ...baseValues,
          media: muxMedia({ muxVideoId: 'v1' })
        }
      })
      expect(screen.getByText('Processing video…')).toBeInTheDocument()
    })

    it('shows an idle placeholder (not "processing") for an empty upload slot', () => {
      // Upload tab selected but nothing uploaded/uploading: must not imply work
      // is in progress.
      renderPane({ values: { ...baseValues, media: muxMedia() } })
      expect(
        screen.getByText('Your uploaded video will appear here')
      ).toBeInTheDocument()
      expect(screen.queryByText('Processing video…')).not.toBeInTheDocument()
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
