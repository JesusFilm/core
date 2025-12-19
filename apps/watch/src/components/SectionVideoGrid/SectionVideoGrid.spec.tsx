import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'

import { VideoLabel } from '../../../__generated__/globalTypes'
import { GET_COLLECTION_SHOWCASE_CONTENT } from '../SectionVideoCarousel/queries'
import type { SectionVideoCollectionCarouselSlide } from '../SectionVideoCarousel/useSectionVideoCollectionCarouselContent'

import { SectionVideoGrid } from '.'

// eslint-disable-next-line import/no-namespace
import * as carouselContentHook from '../SectionVideoCarousel/useSectionVideoCollectionCarouselContent'

const originalUseCarouselContent =
  carouselContentHook.useSectionVideoCollectionCarouselContent

let capturedSlides: SectionVideoCollectionCarouselSlide[] = []

const collectionMock = {
  __typename: 'Video',
  id: 'collection-1',
  label: VideoLabel.collection,
  slug: 'collection-slug',
  title: [{ __typename: 'VideoTitle', value: 'Collection Title' }],
  snippet: [{ __typename: 'VideoSnippet', value: 'Collection Snippet' }],
  description: [
    {
      __typename: 'VideoDescription',
      value: 'Our mission is to reach everyone. Secondary sentence.'
    }
  ],
  imageAlt: [{ __typename: 'VideoImageAlt', value: 'Collection Alt' }],
  posterImages: [
    {
      __typename: 'CloudflareImage',
      mobileCinematicHigh: 'https://example.com/collection-poster.jpg'
    }
  ],
  bannerImages: [],
  variant: {
    __typename: 'VideoVariant',
    id: 'variant-1',
    duration: 0,
    hls: null,
    slug: 'collection-slug/en'
  },
  parents: [],
  childrenCount: 2,
  children: [
    {
      __typename: 'Video',
      id: 'child-1',
      label: VideoLabel.featureFilm,
      slug: 'child-one',
      title: [{ __typename: 'VideoTitle', value: 'Child One' }],
      snippet: [{ __typename: 'VideoSnippet', value: 'Child Snippet' }],
      imageAlt: [{ __typename: 'VideoImageAlt', value: 'Child One Alt' }],
      posterImages: [
        {
          __typename: 'CloudflareImage',
          mobileCinematicHigh: 'https://example.com/child-one.jpg'
        }
      ],
      bannerImages: [],
      variant: {
        __typename: 'VideoVariant',
        id: 'child-1-var',
        duration: 0,
        hls: null,
        slug: 'child-one/en'
      },
      parents: [
        {
          __typename: 'Video',
          id: 'collection-1',
          slug: 'collection-slug',
          label: VideoLabel.collection
        }
      ],
      childrenCount: 0,
      children: []
    },
    {
      __typename: 'Video',
      id: 'child-collection',
      label: VideoLabel.collection,
      slug: 'child-collection-slug',
      title: [{ __typename: 'VideoTitle', value: 'Child Collection' }],
      snippet: [{ __typename: 'VideoSnippet', value: 'Nested Snippet' }],
      imageAlt: [
        { __typename: 'VideoImageAlt', value: 'Child Collection Alt' }
      ],
      posterImages: [],
      bannerImages: [
        {
          __typename: 'CloudflareImage',
          mobileCinematicHigh: 'https://example.com/child-collection.jpg'
        }
      ],
      variant: {
        __typename: 'VideoVariant',
        id: 'child-collection-var',
        duration: 0,
        hls: null,
        slug: 'child-collection/en'
      },
      parents: [
        {
          __typename: 'Video',
          id: 'collection-1',
          slug: 'collection-slug',
          label: VideoLabel.collection
        }
      ],
      childrenCount: 1,
      children: [
        {
          __typename: 'Video',
          id: 'grandchild-1',
          label: VideoLabel.episode,
          slug: 'grandchild-one',
          title: [{ __typename: 'VideoTitle', value: 'Grandchild One' }],
          snippet: [
            { __typename: 'VideoSnippet', value: 'Grandchild Snippet' }
          ],
          imageAlt: [{ __typename: 'VideoImageAlt', value: 'Grandchild Alt' }],
          posterImages: [
            {
              __typename: 'CloudflareImage',
              mobileCinematicHigh: 'https://example.com/grandchild.jpg'
            }
          ],
          bannerImages: [],
          variant: {
            __typename: 'VideoVariant',
            id: 'grandchild-var',
            duration: 0,
            hls: null,
            slug: 'grandchild-one/en'
          },
          parents: [
            {
              __typename: 'Video',
              id: 'child-collection',
              slug: 'child-collection-slug',
              label: VideoLabel.collection
            }
          ],
          childrenCount: 0,
          children: []
        }
      ]
    }
  ]
}

const singleVideo = {
  __typename: 'Video',
  id: 'video-1',
  label: VideoLabel.featureFilm,
  slug: 'single-video',
  title: [{ __typename: 'VideoTitle', value: 'Single Video' }],
  snippet: [{ __typename: 'VideoSnippet', value: 'Single snippet' }],
  imageAlt: [{ __typename: 'VideoImageAlt', value: 'Single Alt' }],
  posterImages: [
    {
      __typename: 'CloudflareImage',
      mobileCinematicHigh: 'https://example.com/single-video.jpg'
    }
  ],
  bannerImages: [],
  variant: {
    __typename: 'VideoVariant',
    id: 'video-variant',
    duration: 0,
    hls: null,
    slug: 'single-video/en'
  },
  parents: [],
  childrenCount: 0,
  children: []
}

const baseMocks: MockedResponse[] = [
  {
    request: {
      query: GET_COLLECTION_SHOWCASE_CONTENT,
      variables: {
        ids: ['video-1', 'collection-1'],
        languageId: '529'
      }
    },
    result: {
      data: {
        videos: [collectionMock, singleVideo]
      }
    }
  }
]

const collectionOnlyMocks: MockedResponse[] = [
  {
    request: {
      query: GET_COLLECTION_SHOWCASE_CONTENT,
      variables: {
        ids: ['collection-1'],
        languageId: '529'
      }
    },
    result: {
      data: {
        videos: [collectionMock]
      }
    }
  }
]

const emptyMocks: MockedResponse[] = [
  {
    request: {
      query: GET_COLLECTION_SHOWCASE_CONTENT,
      variables: {
        ids: ['collection-1'],
        languageId: '529'
      }
    },
    result: {
      data: {
        videos: []
      }
    }
  }
]

describe('SectionVideoGrid', () => {
  beforeEach(() => {
    capturedSlides = []
    jest
      .spyOn(carouselContentHook, 'useSectionVideoCollectionCarouselContent')
      .mockImplementation((options) => {
        const result = originalUseCarouselContent(options)
        capturedSlides = result.slides
        return result
      })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders slides from collection children and videos in grid layout', async () => {
    render(
      <MockedProvider mocks={baseMocks} addTypename>
        <SectionVideoGrid
          primaryCollectionId="collection-1"
          sources={[
            { id: 'video-1' },
            { id: 'collection-1', limitChildren: 3 }
          ]}
        />
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.getByTestId('VideoCard-video-1')).toBeInTheDocument()
    )

    expect(capturedSlides).toHaveLength(3)

    const childSlide = capturedSlides.find((slide) => slide.id === 'child-1')
    expect(childSlide).toMatchObject({
      containerSlug: 'collection-slug',
      variantSlug: 'child-one/en'
    })
    expect(childSlide?.video).toMatchObject({
      slug: 'child-one',
      variant: expect.objectContaining({ slug: 'child-one/en' })
    })

    const grandchildSlide = capturedSlides.find(
      (slide) => slide.id === 'grandchild-1'
    )
    expect(grandchildSlide).toMatchObject({
      containerSlug: 'child-collection-slug',
      variantSlug: 'grandchild-one/en'
    })
    expect(grandchildSlide?.video).toMatchObject({
      slug: 'grandchild-one',
      variant: expect.objectContaining({ slug: 'grandchild-one/en' })
    })

    const directVideoSlide = capturedSlides.find(
      (slide) => slide.id === 'video-1'
    )
    expect(directVideoSlide).toMatchObject({
      containerSlug: undefined,
      variantSlug: 'single-video/en'
    })
    expect(directVideoSlide?.video).toMatchObject({
      slug: 'single-video',
      variant: expect.objectContaining({ slug: 'single-video/en' })
    })

    expect(screen.getByTestId('VideoCard-grandchild-1')).toBeInTheDocument()
    expect(screen.getByTestId('VideoCard-video-1')).toBeInTheDocument()
    expect(screen.getByTestId('SectionVideoGridCTA')).toHaveTextContent('Watch')
    expect(screen.getByTestId('SectionVideoGridDescription')).toHaveTextContent(
      'Our mission is to reach everyone. Secondary sentence.'
    )
  })

  it('respects override props for copy and CTA', async () => {
    render(
      <MockedProvider mocks={collectionOnlyMocks} addTypename>
        <SectionVideoGrid
          sources={[{ id: 'collection-1' }]}
          subtitleOverride="Override Subtitle"
          titleOverride="Override Title"
          descriptionOverride="<strong>Bold Lead</strong> remaining copy"
          ctaLabelOverride="Explore"
          ctaHrefOverride="/custom-url"
        />
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.getByTestId('SectionVideoGrid')).toBeInTheDocument()
    )
    expect(screen.getByTestId('SectionVideoGridSubtitle')).toHaveTextContent(
      'Override Subtitle'
    )
    expect(screen.getByTestId('SectionVideoGridTitle')).toHaveTextContent(
      'Override Title'
    )
    const mission = screen.getByTestId('SectionVideoGridDescription')
    expect(mission).toHaveTextContent('Bold Lead')
    expect(mission).toHaveTextContent('remaining copy')
    const cta = screen.getByTestId('SectionVideoGridCTA')
    expect(cta).toHaveTextContent('Explore')
    expect((cta.closest('a') as HTMLAnchorElement).getAttribute('href')).toBe(
      '/custom-url'
    )
  })

  it('returns null when no slides are available', async () => {
    render(
      <MockedProvider mocks={emptyMocks} addTypename>
        <SectionVideoGrid sources={[{ id: 'collection-1' }]} />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('No videos found')).toBeInTheDocument()
    })
  })

  it('shows skeleton loading state', async () => {
    render(
      <MockedProvider mocks={collectionOnlyMocks} addTypename>
        <SectionVideoGrid sources={[{ id: 'collection-1' }]} />
      </MockedProvider>
    )

    // Check that skeleton elements are present initially
    const skeletonElements = document.querySelectorAll('.animate-pulse')
    expect(skeletonElements.length).toBeGreaterThan(0)

    // Wait for loading to complete
    await waitFor(() =>
      expect(screen.getByTestId('VideoCard-child-1')).toBeInTheDocument()
    )
  })

  it('resolves sources from primaryCollectionId when sources prop is not provided', async () => {
    render(
      <MockedProvider mocks={collectionOnlyMocks} addTypename>
        <SectionVideoGrid
          primaryCollectionId="collection-1"
          limitChildren={3}
        />
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.getByTestId('VideoCard-child-1')).toBeInTheDocument()
    )

    expect(capturedSlides).toHaveLength(2)

    const childSlide = capturedSlides.find((slide) => slide.id === 'child-1')
    expect(childSlide).toMatchObject({
      containerSlug: 'collection-slug',
      variantSlug: 'child-one/en'
    })
  })
})
