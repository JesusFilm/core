import { type AlgoliaVideo } from '@core/journeys/ui/algolia/useAlgoliaVideos'

import { transformAlgoliaVideos } from './transformAlgoliaVideos'

describe('transformAlgoliaVideos', () => {
  const algoliaVideos = [
    {
      videoId: 'videoId',
      titles: ['title'],
      titlesWithLanguages: [
        { value: 'English Title', languageId: '529' },
        { value: 'Spanish Title', languageId: '21028' }
      ],
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
          value: 'English Title'
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

  it('should use default (English) title when no locale is provided', () => {
    const result = transformAlgoliaVideos(algoliaVideos)
    expect(result[0].title[0].value).toBe('English Title')
  })

  it('should use localized title when matching locale is found', () => {
    const result = transformAlgoliaVideos(algoliaVideos, '21028')
    expect(result[0].title[0].value).toBe('Spanish Title')
  })

  it('should fallback to English title when locale is not found', () => {
    const result = transformAlgoliaVideos(algoliaVideos, '496')
    expect(result[0].title[0].value).toBe('English Title')
  })

  it('should fallback to empty string when no titles are available', () => {
    const videosWithNoTitles = [
      {
        ...algoliaVideos[0],
        titlesWithLanguages: []
      }
    ] as unknown as AlgoliaVideo[]
    const result = transformAlgoliaVideos(videosWithNoTitles)
    expect(result[0].title[0].value).toBe('')
  })

  it('should transform all other video properties correctly', () => {
    const result = transformAlgoliaVideos(algoliaVideos)
    expect(result).toEqual(transformedVideos)
  })
})
