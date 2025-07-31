import { type AlgoliaVideo } from '@core/journeys/ui/algolia/useAlgoliaVideos'

import { transformAlgoliaVideos } from './transformAlgoliaVideos'

describe('transformAlgoliaVideos', () => {
  const algoliaVideos = [
    {
      videoId: 'videoId',
      titles: ['title'],
      description: ['description'],
      duration: 10994,
      languageId: '529',
      subtitles: [],
      slug: 'video-slug/english',
      label: 'featureFilm',
      image: 'image.jpg',
      imageAlt: 'Life of Jesus (Gospel of John)',
      childrenCount: 49,
      objectID: '2_529-GOJ-0-0'
    }
  ] as unknown as AlgoliaVideo[]

  const transformedVideos = [
    {
      __typename: 'Video',
      childrenCount: 49,
      id: 'videoId',
      images: [
        {
          __typename: 'CloudflareImage',
          mobileCinematicHigh: 'image.jpg'
        }
      ],
      imageAlt: [
        {
          __typename: 'VideoImageAlt',
          value: 'Life of Jesus (Gospel of John)'
        }
      ],
      label: 'featureFilm',
      slug: 'video-slug/english',
      snippet: [],
      title: [
        {
          __typename: 'VideoTitle',
          value: 'title'
        }
      ],
      variant: {
        __typename: 'VideoVariant',
        duration: 10994,
        hls: null,
        id: '2_529-GOJ-0-0',
        slug: 'video-slug/english'
      }
    }
  ]

  it('should transform algolia video items correctly', () => {
    const result = transformAlgoliaVideos(algoliaVideos)
    expect(result).toEqual(transformedVideos)
  })
})
