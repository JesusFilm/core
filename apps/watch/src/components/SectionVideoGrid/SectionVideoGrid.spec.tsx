import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'

import { VideoLabel } from '../../../__generated__/globalTypes'
import { GET_COLLECTION_SHOWCASE_CONTENT } from '../SectionVideoCarousel/queries'

import { SectionVideoGrid } from './SectionVideoGrid'

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string>) => {
      if (key === 'Watch {{title}}') {
        return `Watch ${options?.title ?? ''}`
      }
      return key
    }
  })
}))

jest.mock('next/router', () => ({
  useRouter: () => ({ locale: 'en' })
}))

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
      imageAlt: [{ __typename: 'VideoImageAlt', value: 'Child Collection Alt' }],
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
          snippet: [{ __typename: 'VideoSnippet', value: 'Grandchild Snippet' }],
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
        collectionIds: ['collection-1'],
        videoIds: ['video-1'],
        languageId: '529'
      }
    },
    result: {
      data: {
        collections: [collectionMock],
        videos: [singleVideo]
      }
    }
  }
]

const collectionOnlyMocks: MockedResponse[] = [
  {
    request: {
      query: GET_COLLECTION_SHOWCASE_CONTENT,
      variables: {
        collectionIds: ['collection-1'],
        languageId: '529'
      }
    },
    result: {
      data: {
        collections: [collectionMock],
        videos: []
      }
    }
  }
]

const emptyMocks: MockedResponse[] = [
  {
    request: {
      query: GET_COLLECTION_SHOWCASE_CONTENT,
      variables: {
        collectionIds: ['collection-1'],
        languageId: '529'
      }
    },
    result: {
      data: {
        collections: [
          {
            ...collectionMock,
            children: [],
            childrenCount: 0
          }
        ],
        videos: []
      }
    }
  }
]

describe('SectionVideoGrid', () => {
  it('renders slides from collection children and videos in grid layout', async () => {
    render(
      <MockedProvider mocks={baseMocks} addTypename>
        <SectionVideoGrid
          sources={[
            { type: 'video', id: 'video-1' },
            { type: 'collection', id: 'collection-1', limitChildren: 3 }
          ]}
        />
      </MockedProvider>
    )

    await waitFor(() =>
      expect(
        screen.getByTestId('SectionVideoGridSlide-child-1')
      ).toBeInTheDocument()
    )
    expect(
      screen.getByTestId('SectionVideoGridSlide-grandchild-1')
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('SectionVideoGridSlide-video-1')
    ).toBeInTheDocument()
    expect(screen.getByTestId('SectionVideoGridCTA')).toHaveTextContent(
      'Watch'
    )
    expect(screen.getByTestId('SectionVideoGridDescription')).toHaveTextContent(
      'Our mission is to reach everyone. Secondary sentence.'
    )
  })

  it('respects override props for copy and CTA', async () => {
    render(
      <MockedProvider mocks={collectionOnlyMocks} addTypename>
        <SectionVideoGrid
          sources={[
            { type: 'collection', id: 'collection-1' }
          ]}
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
    expect(
      screen.getByTestId('SectionVideoGridSubtitle')
    ).toHaveTextContent('Override Subtitle')
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
        <SectionVideoGrid
          sources={[{ type: 'collection', id: 'collection-1' }]}
        />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(
        screen.queryByTestId('SectionVideoGrid')
      ).not.toBeInTheDocument()
    })
  })

  it('shows skeleton loading state', async () => {
    render(
      <MockedProvider mocks={collectionOnlyMocks} addTypename>
        <SectionVideoGrid
          sources={[{ type: 'collection', id: 'collection-1' }]}
        />
      </MockedProvider>
    )

    // Check that skeleton elements are present initially
    const skeletonElements = document.querySelectorAll('.animate-pulse')
    expect(skeletonElements.length).toBeGreaterThan(0)

    // Wait for loading to complete
    await waitFor(() =>
      expect(
        screen.getByTestId('SectionVideoGridSlide-child-1')
      ).toBeInTheDocument()
    )
  })
})
