import { ResultOf } from 'gql.tada'

import {
  BibleCitation,
  CloudflareImage,
  ImageAspectRatio,
  Keyword,
  Video,
  VideoDescription,
  VideoImageAlt,
  VideoSnippet,
  VideoStudyQuestion,
  VideoSubtitle,
  VideoTitle,
  VideoVariant
} from '.prisma/api-media-client'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

describe('video', () => {
  const client = getClient()

  const authClient = getClient({
    headers: {
      authorization: 'token'
    },
    context: {
      currentRoles: ['publisher']
    }
  })

  type VideoAndIncludes = Video & {
    bibleCitation: BibleCitation[]
    keywords: Keyword[]
    title: VideoTitle[]
    snippet: VideoSnippet[]
    description: VideoDescription[]
    studyQuestions: VideoStudyQuestion[]
    imageAlt: VideoImageAlt[]
    children: Video[]
    subtitles: VideoSubtitle[]
    images: CloudflareImage[]
  }

  const children: Video[] = [
    {
      id: 'videoId2',
      label: 'collection',
      primaryLanguageId: 'primaryLanguageId',
      thumbnail: null,
      videoStill: null,
      mobileCinematicHigh: null,
      mobileCinematicLow: null,
      mobileCinematicVeryLow: null,
      image: null,
      slug: null,
      noIndex: null,
      published: true,
      childIds: []
    },
    {
      id: 'videoId1',
      label: 'collection',
      thumbnail: null,
      videoStill: null,
      mobileCinematicHigh: null,
      mobileCinematicLow: null,
      mobileCinematicVeryLow: null,
      primaryLanguageId: 'primaryLanguageId',
      image: null,
      slug: null,
      noIndex: null,
      published: true,
      childIds: []
    }
  ]

  const videos: VideoAndIncludes[] = [
    {
      id: 'videoId',
      label: 'behindTheScenes',
      primaryLanguageId: 'primaryLanguageId',
      image: null,
      thumbnail: null,
      videoStill: null,
      mobileCinematicHigh: null,
      mobileCinematicLow: null,
      mobileCinematicVeryLow: null,
      slug: null,
      noIndex: null,
      published: true,
      childIds: ['videoId1', 'videoId2'],
      bibleCitation: [
        {
          id: 'bibleCitationId',
          osisId: 'Gen',
          bibleBookId: 'bibleBookId',
          chapterStart: 1,
          chapterEnd: null,
          verseStart: 1,
          verseEnd: null,
          videoId: 'videoId',
          order: 0
        }
      ],
      keywords: [
        {
          id: 'keywordId',
          value: 'value',
          languageId: 'languageId'
        }
      ],
      title: [
        {
          id: 'titleId',
          value: 'value',
          primary: true,
          languageId: 'languageId',
          videoId: 'videoId'
        }
      ],
      snippet: [
        {
          id: 'snippetId',
          value: 'value',
          primary: true,
          languageId: 'languageId',
          videoId: 'videoId'
        }
      ],
      description: [
        {
          id: 'descriptionId',
          value: 'value',
          primary: true,
          languageId: 'languageId',
          videoId: 'videoId'
        }
      ],
      studyQuestions: [
        {
          id: 'studyQuestionId',
          value: 'value',
          order: 0,
          languageId: 'languageId',
          videoId: 'videoId',
          primary: true,
          crowdInId: 'crowdInId'
        }
      ],
      imageAlt: [
        {
          id: 'imageAltId',
          value: 'value',
          languageId: 'languageId',
          videoId: 'videoId',
          primary: true
        }
      ],
      children,
      subtitles: [
        {
          id: 'subtitleId',
          languageId: 'languageId',
          edition: 'edition',
          vttSrc: null,
          srtSrc: null,
          videoId: 'videoId',
          primary: true
        },
        {
          id: 'subtitleId1',
          languageId: 'languageId',
          edition: 'edition',
          vttSrc: 'vttSrc',
          srtSrc: null,
          videoId: 'videoId',
          primary: true
        },
        {
          id: 'subtitleId2',
          languageId: 'languageId',
          edition: 'edition',
          vttSrc: null,
          srtSrc: 'srtSrc',
          videoId: 'videoId',
          primary: true
        }
      ],
      images: [
        {
          id: 'imageId',
          aspectRatio: ImageAspectRatio.hd,
          uploaded: true,
          userId: 'testUserId',
          uploadUrl: 'testUrl',
          createdAt: new Date(),
          updatedAt: new Date(),
          videoId: null
        }
      ]
    }
  ]

  const video: Video = {
    id: 'videoId',
    label: 'behindTheScenes',
    primaryLanguageId: 'primaryLanguageId',
    thumbnail: null,
    videoStill: null,
    published: true,
    mobileCinematicHigh: null,
    mobileCinematicLow: null,
    mobileCinematicVeryLow: null,
    image: null,
    slug: null,
    noIndex: null,
    childIds: []
  }

  describe('videos', () => {
    const VIDEOS_QUERY = graphql(`
      query Videos(
        $languageId: ID
        $primary: Boolean
        $edition: String
        $offset: Int
        $limit: Int
        $where: VideosFilter
        $aspectRatio: ImageAspectRatio
      ) {
        videos(offset: $offset, limit: $limit, where: $where) {
          id
          bibleCitations {
            id
          }
          keywords(languageId: $languageId) {
            id
          }
          label
          primaryLanguageId
          title(languageId: $languageId, primary: $primary) {
            id
            value
            primary
            language {
              id
            }
          }
          snippet(languageId: $languageId, primary: $primary) {
            id
            value
            primary
            language {
              id
            }
          }
          description(languageId: $languageId, primary: $primary) {
            id
            value
            primary
            language {
              id
            }
          }
          studyQuestions(languageId: $languageId, primary: $primary) {
            id
            value
            primary
            language {
              id
            }
          }
          thumbnail
          videoStill
          mobileCinematicHigh
          mobileCinematicLow
          mobileCinematicVeryLow
          image
          imageAlt(languageId: $languageId, primary: $primary) {
            id
            value
            primary
            language {
              id
            }
          }
          variantLanguages {
            id
          }
          variantLanguagesCount
          slug
          noIndex
          children {
            id
          }
          childrenCount
          variantLanguagesWithSlug {
            slug
            language {
              id
            }
          }
          subtitles(
            languageId: $languageId
            primary: $primary
            edition: $edition
          ) {
            id
            languageId
            edition
            primary
            vttSrc
            srtSrc
            value
            language {
              id
            }
          }
          variant(languageId: $languageId) {
            id
          }
          images(aspectRatio: $aspectRatio) {
            id
            aspectRatio
            url
          }
        }
      }
    `)

    const result: ResultOf<typeof VIDEOS_QUERY>['videos'] = [
      {
        bibleCitations: [
          {
            id: 'bibleCitationId'
          }
        ],
        children: [
          {
            id: 'videoId1'
          },
          {
            id: 'videoId2'
          }
        ],
        childrenCount: 1,
        description: [
          {
            id: 'descriptionId',
            language: { id: 'languageId' },
            primary: true,
            value: 'value'
          }
        ],
        id: 'videoId',
        thumbnail: null,
        videoStill: null,
        mobileCinematicHigh: null,
        mobileCinematicLow: null,
        mobileCinematicVeryLow: null,
        image: null,
        imageAlt: [
          {
            id: 'imageAltId',
            language: { id: 'languageId' },
            primary: true,
            value: 'value'
          }
        ],
        keywords: [{ id: 'keywordId' }],
        label: 'behindTheScenes',
        noIndex: null,
        primaryLanguageId: 'primaryLanguageId',
        slug: '',
        snippet: [
          {
            id: 'snippetId',
            language: {
              id: 'languageId'
            },
            primary: true,
            value: 'value'
          }
        ],
        studyQuestions: [
          {
            id: 'studyQuestionId',
            language: {
              id: 'languageId'
            },
            primary: true,
            value: 'value'
          }
        ],
        subtitles: [
          {
            edition: 'edition',
            id: 'subtitleId',
            languageId: 'languageId',
            primary: true,
            srtSrc: null,
            vttSrc: null,
            value: '',
            language: {
              id: 'languageId'
            }
          },
          {
            edition: 'edition',
            id: 'subtitleId1',
            languageId: 'languageId',
            primary: true,
            srtSrc: null,
            vttSrc: 'vttSrc',
            value: 'vttSrc',
            language: {
              id: 'languageId'
            }
          },
          {
            edition: 'edition',
            id: 'subtitleId2',
            languageId: 'languageId',
            primary: true,
            srtSrc: 'srtSrc',
            vttSrc: null,
            value: 'srtSrc',
            language: {
              id: 'languageId'
            }
          }
        ],
        title: [
          {
            id: 'titleId',
            language: {
              id: 'languageId'
            },
            primary: true,
            value: 'value'
          }
        ],
        variant: { id: 'variantId' },
        variantLanguages: [{ id: 'languageId' }],
        variantLanguagesCount: 1,
        variantLanguagesWithSlug: [
          {
            language: { id: 'languageId' },
            slug: 'slug'
          }
        ],
        images: [
          {
            id: 'imageId',
            aspectRatio: ImageAspectRatio.hd,
            url: 'https://customer-.cloudflarestream.com/imageId'
          }
        ]
      }
    ]

    it('should query videos', async () => {
      prismaMock.video.findMany.mockResolvedValueOnce(videos)
      prismaMock.video.findMany.mockResolvedValueOnce(children)
      // variantLanguages
      prismaMock.videoVariant.findMany.mockResolvedValueOnce([
        { languageId: 'languageId' } as unknown as VideoVariant
      ])
      // variantLanguagesCount
      prismaMock.videoVariant.count.mockResolvedValueOnce(1)
      // childrenCount
      prismaMock.video.count.mockResolvedValueOnce(1)
      // variantLanguagesWithSlug
      prismaMock.videoVariant.findMany.mockResolvedValueOnce([
        { languageId: 'languageId', slug: 'slug' } as unknown as VideoVariant
      ])
      // variant
      prismaMock.videoVariant.findUnique.mockResolvedValueOnce({
        id: 'variantId'
      } as unknown as VideoVariant)
      const data = await client({
        document: VIDEOS_QUERY
      })
      expect(prismaMock.video.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 100,
        where: { published: true },
        include: {
          bibleCitation: true,
          description: {
            orderBy: {
              primary: 'desc'
            },
            where: {
              OR: [
                {
                  languageId: '529'
                }
              ]
            }
          },
          imageAlt: {
            orderBy: {
              primary: 'desc'
            },
            where: {
              OR: [
                {
                  languageId: '529'
                }
              ]
            }
          },
          keywords: {
            where: {
              languageId: '529'
            }
          },
          snippet: {
            orderBy: {
              primary: 'desc'
            },
            where: {
              OR: [
                {
                  languageId: '529'
                }
              ]
            }
          },
          studyQuestions: {
            orderBy: {
              order: 'asc'
            },
            where: {
              OR: [
                {
                  languageId: '529'
                }
              ]
            }
          },
          subtitles: {
            orderBy: {
              primary: 'desc'
            },
            where: {
              OR: undefined
            }
          },
          title: {
            orderBy: {
              primary: 'desc'
            },
            where: {
              OR: [
                {
                  languageId: '529'
                }
              ]
            }
          },
          images: {
            where: { aspectRatio: undefined },
            orderBy: { aspectRatio: 'desc' }
          }
        }
      })
      expect(data).toHaveProperty('data.videos', result)
    })

    it('should query videoVariants without default values', async () => {
      prismaMock.video.findMany.mockResolvedValueOnce([
        { ...videos[0], slug: 'slug', noIndex: true }
      ])
      // children
      prismaMock.video.findMany.mockResolvedValueOnce(children)
      // variantLanguages
      prismaMock.videoVariant.findMany.mockResolvedValueOnce([
        { languageId: 'languageId' } as unknown as VideoVariant
      ])
      // variantLanguagesCount
      prismaMock.videoVariant.count.mockResolvedValueOnce(1)
      // childrenCount
      prismaMock.video.count.mockResolvedValueOnce(1)
      // variantLanguagesWithSlug
      prismaMock.videoVariant.findMany.mockResolvedValueOnce([
        { languageId: 'languageId', slug: 'slug' } as unknown as VideoVariant
      ])
      // variant
      prismaMock.videoVariant.findUnique.mockResolvedValueOnce(null)

      const data = await client({
        document: VIDEOS_QUERY,
        variables: {
          languageId: '987'
        }
      })
      expect(data).toHaveProperty('data.videos', [
        { ...result[0], slug: 'slug', noIndex: true, variant: null }
      ])
    })

    it('should query videoVariants with variables', async () => {
      prismaMock.video.findMany.mockResolvedValueOnce(videos)
      // children
      prismaMock.video.findMany.mockResolvedValueOnce(children)
      // variantLanguages
      prismaMock.videoVariant.findMany.mockResolvedValueOnce([
        { languageId: 'languageId' } as unknown as VideoVariant
      ])
      // variantLanguagesCount
      prismaMock.videoVariant.count.mockResolvedValueOnce(1)
      // childrenCount
      prismaMock.video.count.mockResolvedValueOnce(1)
      // variantLanguagesWithSlug
      prismaMock.videoVariant.findMany.mockResolvedValueOnce([
        { languageId: 'languageId', slug: 'slug' } as unknown as VideoVariant
      ])
      // variant
      prismaMock.videoVariant.findUnique.mockResolvedValueOnce({
        id: 'variantId'
      } as unknown as VideoVariant)
      const data = await client({
        document: VIDEOS_QUERY,
        variables: {
          languageId: '987',
          primary: false,
          edition: 'edition',
          offset: 10,
          limit: 20,
          where: {
            title: 'Jesus'
          },
          aspectRatio: ImageAspectRatio.hd
        }
      })
      expect(prismaMock.video.findMany).toHaveBeenCalledWith({
        skip: 10,
        take: 20,
        where: {
          published: true,
          title: {
            some: {
              value: {
                search: 'Jesus'
              }
            }
          }
        },
        include: {
          bibleCitation: true,
          description: {
            orderBy: {
              primary: 'desc'
            },
            where: {
              OR: [
                {
                  primary: false
                },
                {
                  languageId: '987'
                }
              ]
            }
          },
          imageAlt: {
            orderBy: {
              primary: 'desc'
            },
            where: {
              OR: [
                {
                  primary: false
                },
                {
                  languageId: '987'
                }
              ]
            }
          },
          keywords: {
            where: {
              languageId: '987'
            }
          },
          snippet: {
            orderBy: {
              primary: 'desc'
            },
            where: {
              OR: [
                {
                  primary: false
                },
                {
                  languageId: '987'
                }
              ]
            }
          },
          studyQuestions: {
            orderBy: {
              order: 'asc'
            },
            where: {
              OR: [
                {
                  primary: false
                },
                {
                  languageId: '987'
                }
              ]
            }
          },
          subtitles: {
            orderBy: {
              primary: 'desc'
            },
            where: {
              OR: [
                {
                  languageId: '987'
                },
                {
                  primary: false
                },
                {
                  edition: 'edition'
                }
              ]
            }
          },
          title: {
            orderBy: {
              primary: 'desc'
            },
            where: {
              OR: [
                {
                  primary: false
                },
                {
                  languageId: '987'
                }
              ]
            }
          },
          images: {
            where: {
              aspectRatio: ImageAspectRatio.hd
            },
            orderBy: { aspectRatio: 'desc' }
          }
        }
      })
      expect(data).toHaveProperty('data.videos', result)
    })
  })

  describe('video', () => {
    const VIDEO_QUERY = graphql(`
      query Video($id: ID!, $idType: IdType) {
        video(id: $id, idType: $idType) {
          id
        }
      }
    `)

    it('should query video', async () => {
      prismaMock.video.findUniqueOrThrow.mockResolvedValueOnce(video)
      const data = await client({
        document: VIDEO_QUERY,
        variables: {
          id: 'videoId'
        }
      })
      expect(prismaMock.video.findUniqueOrThrow).toHaveBeenCalledWith({
        where: {
          id: 'videoId',
          published: true
        }
      })
      expect(data).toHaveProperty('data.video', { id: 'videoId' })
    })

    it('should query video by slug', async () => {
      prismaMock.video.findFirstOrThrow.mockResolvedValueOnce(video)
      const data = await client({
        document: VIDEO_QUERY,
        variables: {
          id: 'slug',
          idType: 'slug'
        }
      })
      expect(prismaMock.video.findFirstOrThrow).toHaveBeenCalledWith({
        where: {
          published: true,
          variants: { some: { slug: 'slug' } }
        }
      })
      expect(data).toHaveProperty('data.video', { id: 'videoId' })
    })
  })

  describe('adminVideos', () => {
    const ADMIN_VIDEOS_QUERY = graphql(`
      query AdminVideos(
        $languageId: ID
        $primary: Boolean
        $edition: String
        $offset: Int
        $limit: Int
        $where: VideosFilter
        $aspectRatio: ImageAspectRatio
      ) {
        adminVideos(offset: $offset, limit: $limit, where: $where) {
          id
          bibleCitations {
            id
          }
          keywords(languageId: $languageId) {
            id
          }
          label
          primaryLanguageId
          title(languageId: $languageId, primary: $primary) {
            id
            value
            primary
            language {
              id
            }
          }
          snippet(languageId: $languageId, primary: $primary) {
            id
            value
            primary
            language {
              id
            }
          }
          description(languageId: $languageId, primary: $primary) {
            id
            value
            primary
            language {
              id
            }
          }
          studyQuestions(languageId: $languageId, primary: $primary) {
            id
            value
            primary
            language {
              id
            }
          }
          thumbnail
          videoStill
          mobileCinematicHigh
          mobileCinematicLow
          mobileCinematicVeryLow
          image
          imageAlt(languageId: $languageId, primary: $primary) {
            id
            value
            primary
            language {
              id
            }
          }
          variantLanguages {
            id
          }
          variantLanguagesCount
          slug
          noIndex
          children {
            id
          }
          childrenCount
          variantLanguagesWithSlug {
            slug
            language {
              id
            }
          }
          subtitles(
            languageId: $languageId
            primary: $primary
            edition: $edition
          ) {
            id
            languageId
            edition
            primary
            vttSrc
            srtSrc
            value
            language {
              id
            }
          }
          variant(languageId: $languageId) {
            id
          }
          images(aspectRatio: $aspectRatio) {
            id
            aspectRatio
          }
        }
      }
    `)

    const result: ResultOf<typeof ADMIN_VIDEOS_QUERY>['adminVideos'] = [
      {
        bibleCitations: [
          {
            id: 'bibleCitationId'
          }
        ],
        children: [
          {
            id: 'videoId1'
          },
          {
            id: 'videoId2'
          }
        ],
        childrenCount: 1,
        description: [
          {
            id: 'descriptionId',
            language: { id: 'languageId' },
            primary: true,
            value: 'value'
          }
        ],
        id: 'videoId',
        thumbnail: null,
        videoStill: null,
        mobileCinematicHigh: null,
        mobileCinematicLow: null,
        mobileCinematicVeryLow: null,
        image: null,
        imageAlt: [
          {
            id: 'imageAltId',
            language: { id: 'languageId' },
            primary: true,
            value: 'value'
          }
        ],
        keywords: [{ id: 'keywordId' }],
        label: 'behindTheScenes',
        noIndex: null,
        primaryLanguageId: 'primaryLanguageId',
        slug: '',
        snippet: [
          {
            id: 'snippetId',
            language: {
              id: 'languageId'
            },
            primary: true,
            value: 'value'
          }
        ],
        studyQuestions: [
          {
            id: 'studyQuestionId',
            language: {
              id: 'languageId'
            },
            primary: true,
            value: 'value'
          }
        ],
        subtitles: [
          {
            edition: 'edition',
            id: 'subtitleId',
            languageId: 'languageId',
            primary: true,
            srtSrc: null,
            vttSrc: null,
            value: '',
            language: {
              id: 'languageId'
            }
          },
          {
            edition: 'edition',
            id: 'subtitleId1',
            languageId: 'languageId',
            primary: true,
            srtSrc: null,
            vttSrc: 'vttSrc',
            value: 'vttSrc',
            language: {
              id: 'languageId'
            }
          },
          {
            edition: 'edition',
            id: 'subtitleId2',
            languageId: 'languageId',
            primary: true,
            srtSrc: 'srtSrc',
            vttSrc: null,
            value: 'srtSrc',
            language: {
              id: 'languageId'
            }
          }
        ],
        title: [
          {
            id: 'titleId',
            language: {
              id: 'languageId'
            },
            primary: true,
            value: 'value'
          }
        ],
        variant: { id: 'variantId' },
        variantLanguages: [{ id: 'languageId' }],
        variantLanguagesCount: 1,
        variantLanguagesWithSlug: [
          {
            language: { id: 'languageId' },
            slug: 'slug'
          }
        ],
        images: [
          {
            id: 'imageId',
            aspectRatio: ImageAspectRatio.hd
          }
        ]
      }
    ]

    it('should query videos', async () => {
      prismaMock.video.findMany.mockResolvedValueOnce(videos)
      prismaMock.video.findMany.mockResolvedValueOnce(children)
      // variantLanguages
      prismaMock.videoVariant.findMany.mockResolvedValueOnce([
        { languageId: 'languageId' } as unknown as VideoVariant
      ])
      // variantLanguagesCount
      prismaMock.videoVariant.count.mockResolvedValueOnce(1)
      // childrenCount
      prismaMock.video.count.mockResolvedValueOnce(1)
      // variantLanguagesWithSlug
      prismaMock.videoVariant.findMany.mockResolvedValueOnce([
        { languageId: 'languageId', slug: 'slug' } as unknown as VideoVariant
      ])
      // variant
      prismaMock.videoVariant.findUnique.mockResolvedValueOnce({
        id: 'variantId'
      } as unknown as VideoVariant)
      prismaMock.userMediaRole.findUnique.mockResolvedValueOnce({
        id: 'userId',
        userId: 'userId',
        roles: ['publisher']
      })
      const data = await authClient({
        document: ADMIN_VIDEOS_QUERY
      })
      expect(prismaMock.video.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 100,
        where: {},
        include: {
          bibleCitation: true,
          description: {
            orderBy: {
              primary: 'desc'
            },
            where: {
              OR: [
                {
                  languageId: '529'
                }
              ]
            }
          },
          imageAlt: {
            orderBy: {
              primary: 'desc'
            },
            where: {
              OR: [
                {
                  languageId: '529'
                }
              ]
            }
          },
          keywords: {
            where: {
              languageId: '529'
            }
          },
          snippet: {
            orderBy: {
              primary: 'desc'
            },
            where: {
              OR: [
                {
                  languageId: '529'
                }
              ]
            }
          },
          studyQuestions: {
            orderBy: {
              order: 'asc'
            },
            where: {
              OR: [
                {
                  languageId: '529'
                }
              ]
            }
          },
          subtitles: {
            orderBy: {
              primary: 'desc'
            },
            where: {
              OR: undefined
            }
          },
          title: {
            orderBy: {
              primary: 'desc'
            },
            where: {
              OR: [
                {
                  languageId: '529'
                }
              ]
            }
          },
          images: {
            where: { aspectRatio: undefined },
            orderBy: { aspectRatio: 'desc' }
          }
        }
      })
      expect(data).toHaveProperty('data.adminVideos', result)
    })

    it('should query videoVariants without default values', async () => {
      prismaMock.video.findMany.mockResolvedValueOnce([
        { ...videos[0], slug: 'slug', noIndex: true }
      ])
      // children
      prismaMock.video.findMany.mockResolvedValueOnce(children)
      // variantLanguages
      prismaMock.videoVariant.findMany.mockResolvedValueOnce([
        { languageId: 'languageId' } as unknown as VideoVariant
      ])
      // variantLanguagesCount
      prismaMock.videoVariant.count.mockResolvedValueOnce(1)
      // childrenCount
      prismaMock.video.count.mockResolvedValueOnce(1)
      // variantLanguagesWithSlug
      prismaMock.videoVariant.findMany.mockResolvedValueOnce([
        { languageId: 'languageId', slug: 'slug' } as unknown as VideoVariant
      ])
      // variant
      prismaMock.videoVariant.findUnique.mockResolvedValueOnce(null)
      prismaMock.userMediaRole.findUnique.mockResolvedValueOnce({
        id: 'userId',
        userId: 'userId',
        roles: ['publisher']
      })

      const data = await client({
        document: ADMIN_VIDEOS_QUERY,
        variables: {
          languageId: '987'
        }
      })
      expect(data).toHaveProperty('data.adminVideos', [
        { ...result[0], slug: 'slug', noIndex: true, variant: null }
      ])
    })

    it('should query videoVariants with variables', async () => {
      prismaMock.video.findMany.mockResolvedValueOnce(videos)
      // children
      prismaMock.video.findMany.mockResolvedValueOnce(children)
      // variantLanguages
      prismaMock.videoVariant.findMany.mockResolvedValueOnce([
        { languageId: 'languageId' } as unknown as VideoVariant
      ])
      // variantLanguagesCount
      prismaMock.videoVariant.count.mockResolvedValueOnce(1)
      // childrenCount
      prismaMock.video.count.mockResolvedValueOnce(1)
      // variantLanguagesWithSlug
      prismaMock.videoVariant.findMany.mockResolvedValueOnce([
        { languageId: 'languageId', slug: 'slug' } as unknown as VideoVariant
      ])
      prismaMock.userMediaRole.findUnique.mockResolvedValueOnce({
        id: 'userId',
        userId: 'userId',
        roles: ['publisher']
      })
      // variant
      prismaMock.videoVariant.findUnique.mockResolvedValueOnce({
        id: 'variantId'
      } as unknown as VideoVariant)
      const data = await authClient({
        document: ADMIN_VIDEOS_QUERY,
        variables: {
          languageId: '987',
          primary: false,
          edition: 'edition',
          offset: 10,
          limit: 20,
          where: {
            title: 'Jesus'
          },
          aspectRatio: ImageAspectRatio.hd
        }
      })
      expect(prismaMock.video.findMany).toHaveBeenCalledWith({
        skip: 10,
        take: 20,
        where: {
          title: {
            some: {
              value: {
                search: 'Jesus'
              }
            }
          }
        },
        include: {
          bibleCitation: true,
          description: {
            orderBy: {
              primary: 'desc'
            },
            where: {
              OR: [
                {
                  primary: false
                },
                {
                  languageId: '987'
                }
              ]
            }
          },
          imageAlt: {
            orderBy: {
              primary: 'desc'
            },
            where: {
              OR: [
                {
                  primary: false
                },
                {
                  languageId: '987'
                }
              ]
            }
          },
          keywords: {
            where: {
              languageId: '987'
            }
          },
          snippet: {
            orderBy: {
              primary: 'desc'
            },
            where: {
              OR: [
                {
                  primary: false
                },
                {
                  languageId: '987'
                }
              ]
            }
          },
          studyQuestions: {
            orderBy: {
              order: 'asc'
            },
            where: {
              OR: [
                {
                  primary: false
                },
                {
                  languageId: '987'
                }
              ]
            }
          },
          subtitles: {
            orderBy: {
              primary: 'desc'
            },
            where: {
              OR: [
                {
                  languageId: '987'
                },
                {
                  primary: false
                },
                {
                  edition: 'edition'
                }
              ]
            }
          },
          title: {
            orderBy: {
              primary: 'desc'
            },
            where: {
              OR: [
                {
                  primary: false
                },
                {
                  languageId: '987'
                }
              ]
            }
          },
          images: {
            where: {
              aspectRatio: ImageAspectRatio.hd
            },
            orderBy: { aspectRatio: 'desc' }
          }
        }
      })
      expect(data).toHaveProperty('data.adminVideos', result)
    })

    it('should fail if not publisher', async () => {
      prismaMock.userMediaRole.findUnique.mockResolvedValueOnce({
        id: 'userId',
        userId: 'userId',
        roles: []
      })
      const data = await authClient({
        document: ADMIN_VIDEOS_QUERY
      })
      expect(data).toHaveProperty('data', null)
    })
  })

  describe('adminVideo', () => {
    const ADMIN_VIDEO_QUERY = graphql(`
      query AdminVideo($id: ID!, $idType: IdType) {
        adminVideo(id: $id, idType: $idType) {
          id
        }
      }
    `)

    const video: Video = {
      id: 'videoId',
      label: 'behindTheScenes',
      primaryLanguageId: 'primaryLanguageId',
      thumbnail: null,
      videoStill: null,
      published: true,
      mobileCinematicHigh: null,
      mobileCinematicLow: null,
      mobileCinematicVeryLow: null,
      image: null,
      slug: null,
      noIndex: null,
      childIds: []
    }

    it('should query video', async () => {
      prismaMock.video.findUniqueOrThrow.mockResolvedValueOnce(video)
      prismaMock.userMediaRole.findUnique.mockResolvedValueOnce({
        id: 'userId',
        userId: 'userId',
        roles: ['publisher']
      })
      const data = await authClient({
        document: ADMIN_VIDEO_QUERY,
        variables: {
          id: 'videoId'
        }
      })
      expect(prismaMock.video.findUniqueOrThrow).toHaveBeenCalledWith({
        where: {
          id: 'videoId'
        }
      })
      expect(data).toHaveProperty('data.adminVideo', { id: 'videoId' })
    })

    it('should query video by slug', async () => {
      prismaMock.video.findFirstOrThrow.mockResolvedValueOnce(video)
      prismaMock.userMediaRole.findUnique.mockResolvedValueOnce({
        id: 'userId',
        userId: 'userId',
        roles: ['publisher']
      })
      const data = await client({
        document: ADMIN_VIDEO_QUERY,
        variables: {
          id: 'slug',
          idType: 'slug'
        }
      })
      expect(prismaMock.video.findFirstOrThrow).toHaveBeenCalledWith({
        where: {
          variants: { some: { slug: 'slug' } }
        }
      })
      expect(data).toHaveProperty('data.adminVideo', { id: 'videoId' })
    })

    it('should fail if not publisher', async () => {
      prismaMock.userMediaRole.findUnique.mockResolvedValueOnce({
        id: 'userId',
        userId: 'userId',
        roles: []
      })
      const data = await authClient({
        document: ADMIN_VIDEO_QUERY,
        variables: {
          id: 'slug',
          idType: 'slug'
        }
      })
      expect(data).toHaveProperty('data', null)
    })
  })

  describe('videosCount', () => {
    const VIDEO_COUNT = graphql(`
      query VideoCount($where: VideosFilter) {
        videosCount(where: $where)
      }
    `)

    it('should return a count of videos', async () => {
      prismaMock.video.count.mockResolvedValueOnce(1)
      const data = await client({
        document: VIDEO_COUNT,
        variables: {
          where: null
        }
      })
      expect(prismaMock.video.count).toHaveBeenCalledWith({
        where: { published: true }
      })
      expect(data).toHaveProperty('data.videosCount', 1)
    })

    it('should return a count of videos with where', async () => {
      prismaMock.video.count.mockResolvedValueOnce(1)
      const data = await client({
        document: VIDEO_COUNT,
        variables: {
          where: {
            title: 'Jesus'
          }
        }
      })
      expect(prismaMock.video.count).toHaveBeenCalledWith({
        where: {
          id: undefined,
          label: undefined,
          published: true,
          title: { some: { value: { search: 'Jesus' } } },
          variants: undefined
        }
      })
      expect(data).toHaveProperty('data.videosCount', 1)
    })
  })
})
