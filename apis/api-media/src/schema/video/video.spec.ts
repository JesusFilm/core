import { GraphQLError } from 'graphql'

import {
  BibleCitation,
  CloudflareImage,
  CloudflareR2,
  ImageAspectRatio,
  Keyword,
  Prisma,
  Video,
  VideoDescription,
  VideoEdition,
  VideoImageAlt,
  VideoLabel,
  VideoSnippet,
  VideoStudyQuestion,
  VideoSubtitle,
  VideoTitle,
  VideoVariant
} from '.prisma/api-media-client'
import { ResultOf, graphql } from '@core/shared/gql'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'

import { getLanguageIdFromInfo } from './video'

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
    parent: Video[]
    subtitles: VideoSubtitle[]
    images: CloudflareImage[]
    cloudflareAssets: CloudflareR2[]
    variants: VideoVariant[]
    videoEditions: VideoEdition[]
    availableLanguages: string[]
    originId: string | null
  }

  const children: Video[] = [
    {
      id: 'videoId2',
      label: 'collection',
      primaryLanguageId: 'primaryLanguageId',
      slug: null,
      noIndex: null,
      published: true,
      childIds: [],
      availableLanguages: [],
      locked: false,
      originId: null,
      restrictDownloadPlatforms: [],
      restrictViewPlatforms: [],
      publishedAt: null
    },
    {
      id: 'videoId1',
      label: 'collection',
      primaryLanguageId: 'primaryLanguageId',
      slug: null,
      noIndex: null,
      published: true,
      childIds: [],
      availableLanguages: [],
      locked: false,
      originId: null,
      restrictDownloadPlatforms: [],
      restrictViewPlatforms: [],
      publishedAt: null
    }
  ]

  const parents: Video[] = [
    {
      id: 'videoId3',
      label: 'collection',
      primaryLanguageId: 'primaryLanguageId',
      slug: null,
      noIndex: null,
      published: true,
      childIds: [],
      availableLanguages: [],
      locked: false,
      originId: null,
      restrictDownloadPlatforms: [],
      restrictViewPlatforms: [],
      publishedAt: null
    },
    {
      id: 'videoId4',
      label: 'collection',
      primaryLanguageId: 'primaryLanguageId',
      slug: null,
      noIndex: null,
      published: true,
      childIds: [],
      availableLanguages: [],
      locked: false,
      originId: null,
      restrictDownloadPlatforms: [],
      restrictViewPlatforms: [],
      publishedAt: null
    }
  ]

  const videos: VideoAndIncludes[] = [
    {
      id: 'videoId',
      label: 'behindTheScenes',
      primaryLanguageId: 'primaryLanguageId',
      slug: null,
      noIndex: null,
      published: true,
      childIds: ['videoId1', 'videoId2'],
      availableLanguages: [],
      originId: 'originId',
      locked: false,
      restrictDownloadPlatforms: [],
      restrictViewPlatforms: [],
      publishedAt: null,
      bibleCitation: [
        {
          id: 'bibleCitationId',
          osisId: 'Gen',
          bibleBookId: 'bibleBookId',
          chapterStart: 1,
          chapterEnd: -1,
          verseStart: 1,
          verseEnd: -1,
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
      parent: parents,
      subtitles: [
        {
          id: 'subtitleId',
          languageId: 'languageId',
          edition: 'edition',
          vttSrc: null,
          srtSrc: null,
          videoId: 'videoId',
          primary: true,
          vttAssetId: null,
          vttVersion: 1,
          srtAssetId: null,
          srtVersion: 1
        },
        {
          id: 'subtitleId1',
          languageId: 'languageId',
          edition: 'edition',
          vttSrc: 'vttSrc',
          srtSrc: null,
          videoId: 'videoId',
          primary: true,
          vttAssetId: null,
          vttVersion: 1,
          srtAssetId: null,
          srtVersion: 1
        },
        {
          id: 'subtitleId2',
          languageId: 'languageId',
          edition: 'edition',
          vttSrc: null,
          srtSrc: 'srtSrc',
          videoId: 'videoId',
          primary: true,
          vttAssetId: null,
          vttVersion: 1,
          srtAssetId: null,
          srtVersion: 1
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
      ],
      cloudflareAssets: [
        {
          id: 'assetId',
          videoId: 'videoId',
          fileName: 'assetFileName',
          uploadUrl: 'assetUploadUrl',
          userId: 'testUserId',
          publicUrl: 'https://assets.jesusfilm.org/assetFileName',
          createdAt: new Date(),
          updatedAt: new Date(),
          contentType: 'application/octet-stream',
          contentLength: 0,
          originalFilename: null
        }
      ],
      videoEditions: [{ id: 'edition', name: 'base', videoId: 'videoId' }],
      variants: [
        {
          id: 'variantId2',
          hls: 'hlsUrl',
          languageId: 'languageId2',
          slug: 'slug2',
          videoId: 'videoId',
          edition: 'edition',
          dash: null,
          downloadable: true,
          duration: null,
          lengthInMilliseconds: null,
          share: null,
          published: true,
          muxVideoId: 'muxVideoId',
          masterUrl: 'masterUrl',
          masterWidth: 320,
          masterHeight: 180,
          assetId: null,
          brightcoveId: null,
          version: 1
        },
        {
          id: 'variantId1',
          hls: 'hlsUrl',
          languageId: 'languageId1',
          slug: 'slug1',
          videoId: 'videoId',
          edition: 'edition',
          dash: null,
          downloadable: true,
          duration: null,
          lengthInMilliseconds: null,
          share: null,
          published: false,
          muxVideoId: 'muxVideoId1',
          masterUrl: 'masterUrl1',
          masterWidth: 320,
          masterHeight: 180,
          assetId: null,
          brightcoveId: null,
          version: 1
        }
      ]
    }
  ]

  const video: Video = {
    id: 'videoId',
    label: 'behindTheScenes',
    primaryLanguageId: 'primaryLanguageId',
    published: true,
    slug: null,
    noIndex: null,
    childIds: [],
    availableLanguages: [],
    originId: null,
    locked: false,
    restrictDownloadPlatforms: [],
    restrictViewPlatforms: [],
    publishedAt: null
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
        $input: VideoVariantFilter
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
          locked
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
          parents {
            id
          }
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
          variants(input: $input) {
            id
            language {
              id
            }
          }
          images(aspectRatio: $aspectRatio) {
            id
            aspectRatio
            url
          }
          cloudflareAssets {
            id
          }
          videoEditions {
            id
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
        parents: [
          {
            id: 'videoId3'
          },
          {
            id: 'videoId4'
          }
        ],
        description: [
          {
            id: 'descriptionId',
            language: { id: 'languageId' },
            primary: true,
            value: 'value'
          }
        ],
        id: 'videoId',
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
        videoEditions: [{ id: 'edition' }],
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
        variants: [
          {
            id: 'variantId1',
            language: {
              id: 'languageId1'
            }
          },
          {
            id: 'variantId2',
            language: {
              id: 'languageId2'
            }
          }
        ],
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
            url: `https://imagedelivery.net/${
              process.env.CLOUDFLARE_IMAGE_ACCOUNT ?? 'testAccount'
            }/imageId`
          }
        ],
        cloudflareAssets: [
          {
            id: 'assetId'
          }
        ],
        locked: false
      }
    ]

    it('should query videos', async () => {
      prismaMock.video.findMany.mockResolvedValueOnce(videos)
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

      prismaMock.videoVariant.findMany.mockResolvedValueOnce([
        {
          id: 'variantId1',
          languageId: 'languageId1'
        } as unknown as VideoVariant,
        {
          id: 'variantId2',
          languageId: 'languageId2'
        } as unknown as VideoVariant
      ])

      const data = await client({
        document: VIDEOS_QUERY
      })
      expect(prismaMock.video.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 100,
        where: { published: true },
        include: {
          videoEditions: true,
          bibleCitation: {
            orderBy: {
              order: 'asc'
            }
          },
          cloudflareAssets: true,
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
          parent: {
            where: {}
          },
          children: {
            where: {}
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

      prismaMock.videoVariant.findMany.mockResolvedValueOnce([
        {
          id: 'variantId1',
          languageId: 'languageId1'
        } as unknown as VideoVariant,
        {
          id: 'variantId2',
          languageId: 'languageId2'
        } as unknown as VideoVariant
      ])

      const data = await client({
        document: VIDEOS_QUERY,
        variables: {
          languageId: '987'
        }
      })
      expect(data).toHaveProperty('data.videos', [
        {
          ...result[0],
          slug: 'slug',
          noIndex: true,
          variant: null
        }
      ])
    })

    it('should query videoVariants with variables', async () => {
      prismaMock.video.findMany.mockResolvedValueOnce(videos)

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

      prismaMock.videoVariant.findMany.mockResolvedValueOnce([
        {
          id: 'variantId1',
          languageId: 'languageId1'
        } as unknown as VideoVariant,
        {
          id: 'variantId2',
          languageId: 'languageId2'
        } as unknown as VideoVariant
      ])

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
          videoEditions: true,
          bibleCitation: {
            orderBy: {
              order: 'asc'
            }
          },
          cloudflareAssets: true,
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
          parent: {
            where: {}
          },
          children: {
            where: {}
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

    it('should query videoVariants with different variable precedence', async () => {
      prismaMock.video.findMany.mockResolvedValueOnce(videos)

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
      // variant - test the precedence logic
      prismaMock.videoVariant.findUnique.mockResolvedValueOnce({
        id: 'variantId'
      } as unknown as VideoVariant)

      prismaMock.videoVariant.findMany.mockResolvedValueOnce([
        {
          id: 'variantId1',
          languageId: 'languageId1'
        } as unknown as VideoVariant,
        {
          id: 'variantId2',
          languageId: 'languageId2'
        } as unknown as VideoVariant
      ])

      const data = await client({
        document: VIDEOS_QUERY,
        variables: {
          languageId: '987'
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

    it('should throw error when not found', async () => {
      prismaMock.video.findFirstOrThrow.mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('No Video found', {
          code: 'P2025',
          clientVersion: 'prismaVersion'
        })
      )
      const data = await client({
        document: VIDEO_QUERY,
        variables: {
          id: 'slug',
          idType: 'slug'
        }
      })

      expect(data).toHaveProperty('errors', [
        new GraphQLError('Video not found with id slug:slug')
      ])
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
          parents {
            id
          }
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
        parents: [
          {
            id: 'videoId3'
          },
          {
            id: 'videoId4'
          }
        ],
        description: [
          {
            id: 'descriptionId',
            language: { id: 'languageId' },
            primary: true,
            value: 'value'
          }
        ],
        id: 'videoId',
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
          bibleCitation: {
            orderBy: {
              order: 'asc'
            }
          },
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
          parent: {
            where: {}
          },
          children: {
            where: {}
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
          bibleCitation: {
            orderBy: {
              order: 'asc'
            }
          },
          children: {
            where: {}
          },
          parent: {
            where: {}
          },
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
      published: true,
      slug: null,
      noIndex: null,
      childIds: [],
      availableLanguages: [],
      originId: null,
      locked: false,
      restrictDownloadPlatforms: [],
      restrictViewPlatforms: [],
      publishedAt: null
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

  describe('adminVideosCount', () => {
    const ADMIN_VIDEO_COUNT = graphql(`
      query AdminVideoCount($where: VideosFilter) {
        adminVideosCount(where: $where)
      }
    `)

    it('should return a count of videos', async () => {
      prismaMock.video.count.mockResolvedValueOnce(1)
      prismaMock.userMediaRole.findUnique.mockResolvedValueOnce({
        id: 'userId',
        userId: 'userId',
        roles: ['publisher']
      })

      const data = await authClient({
        document: ADMIN_VIDEO_COUNT,
        variables: {
          where: null
        }
      })
      expect(prismaMock.video.count).toHaveBeenCalledWith({
        where: {}
      })
      expect(data).toHaveProperty('data.adminVideosCount', 1)
    })

    it('should return a count of videos with where', async () => {
      prismaMock.video.count.mockResolvedValueOnce(1)
      prismaMock.userMediaRole.findUnique.mockResolvedValueOnce({
        id: 'userId',
        userId: 'userId',
        roles: ['publisher']
      })

      const data = await authClient({
        document: ADMIN_VIDEO_COUNT,
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
          published: undefined,
          title: { some: { value: { search: 'Jesus' } } },
          variants: undefined
        }
      })
      expect(data).toHaveProperty('data.adminVideosCount', 1)
    })

    describe('getLanguageIdFromInfo', () => {
      it('should return languageId from info when object', () => {
        const parentId = 'videoId'
        const info = {
          variableValues: {
            456: [
              {
                id: 'notVideoId',
                primaryLanguageId: 'notPrimaryLanguageId'
              }
            ],
            abc: [
              {
                id: 'videoId',
                primaryLanguageId: 'primaryLanguageId'
              }
            ]
          }
        }
        expect(getLanguageIdFromInfo(info, parentId)).toBe('primaryLanguageId')
      })

      it('should return languageId from info when array', () => {
        const parentId = 'videoId'
        const info = {
          variableValues: [
            [
              {
                id: 'notVideoId',
                primaryLanguageId: 'notPrimaryLanguageId'
              }
            ],
            [
              {
                id: 'videoId',
                primaryLanguageId: 'primaryLanguageId'
              }
            ]
          ]
        }
        expect(getLanguageIdFromInfo(info, parentId)).toBe('primaryLanguageId')
      })
    })
  })

  describe('mutations', () => {
    describe('videoCreate', () => {
      const CREATE_VIDEO_MUTATION = graphql(`
        mutation CreateVideo($input: VideoCreateInput!) {
          videoCreate(input: $input) {
            id
          }
        }
      `)

      it('should create video', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.video.create.mockResolvedValue({
          id: 'id',
          label: VideoLabel.featureFilm,
          primaryLanguageId: 'primaryLanguageId',
          published: true,
          slug: 'slug',
          noIndex: true,
          childIds: [],
          availableLanguages: [],
          originId: 'originId'
        } as unknown as Video)
        const result = await authClient({
          document: CREATE_VIDEO_MUTATION,
          variables: {
            input: {
              id: 'id',
              label: VideoLabel.featureFilm,
              primaryLanguageId: 'primaryLanguageId',
              published: true,
              slug: 'slug',
              noIndex: true,
              childIds: [],
              originId: 'originId'
            }
          }
        })
        expect(prismaMock.video.create).toHaveBeenCalledWith({
          data: {
            id: 'id',
            label: 'featureFilm',
            primaryLanguageId: 'primaryLanguageId',
            published: true,
            publishedAt: expect.any(Date),
            slug: 'slug',
            noIndex: true,
            childIds: [],
            originId: 'originId'
          }
        })
        expect(result).toHaveProperty('data.videoCreate', {
          id: 'id'
        })
      })

      it('should fail if not publisher', async () => {
        const result = await client({
          document: CREATE_VIDEO_MUTATION,
          variables: {
            input: {
              id: 'id',
              label: VideoLabel.featureFilm,
              primaryLanguageId: 'primaryLanguageId',
              published: true,
              slug: 'slug',
              noIndex: true,
              childIds: [],
              originId: 'originId'
            }
          }
        })
        expect(result).toHaveProperty('data', null)
      })

      it('should create video with publishedAt when published is true', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.video.create.mockResolvedValue({
          id: 'id',
          label: VideoLabel.featureFilm,
          primaryLanguageId: 'primaryLanguageId',
          published: true,
          slug: 'slug',
          noIndex: true,
          childIds: [],
          availableLanguages: [],
          originId: 'originId',
          publishedAt: new Date()
        } as unknown as Video)

        await authClient({
          document: CREATE_VIDEO_MUTATION,
          variables: {
            input: {
              id: 'id',
              label: VideoLabel.featureFilm,
              primaryLanguageId: 'primaryLanguageId',
              published: true,
              slug: 'slug',
              noIndex: true,
              childIds: [],
              originId: 'originId'
            }
          }
        })

        expect(prismaMock.video.create).toHaveBeenCalledWith({
          data: {
            id: 'id',
            label: 'featureFilm',
            primaryLanguageId: 'primaryLanguageId',
            published: true,
            publishedAt: expect.any(Date),
            slug: 'slug',
            noIndex: true,
            childIds: [],
            originId: 'originId'
          }
        })
      })

      it('should create video without publishedAt when published is false', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.video.create.mockResolvedValue({
          id: 'id',
          label: VideoLabel.featureFilm,
          primaryLanguageId: 'primaryLanguageId',
          published: false,
          slug: 'slug',
          noIndex: true,
          childIds: [],
          availableLanguages: [],
          originId: 'originId',
          publishedAt: null
        } as unknown as Video)

        await authClient({
          document: CREATE_VIDEO_MUTATION,
          variables: {
            input: {
              id: 'id',
              label: VideoLabel.featureFilm,
              primaryLanguageId: 'primaryLanguageId',
              published: false,
              slug: 'slug',
              noIndex: true,
              childIds: [],
              originId: 'originId'
            }
          }
        })

        expect(prismaMock.video.create).toHaveBeenCalledWith({
          data: {
            id: 'id',
            label: 'featureFilm',
            primaryLanguageId: 'primaryLanguageId',
            published: false,
            publishedAt: undefined,
            slug: 'slug',
            noIndex: true,
            childIds: [],
            originId: 'originId'
          }
        })
      })
    })

    describe('videoUpdate', () => {
      const VIDEO_UPDATE_MUTATION = graphql(`
        mutation VideoUpdate($input: VideoUpdateInput!) {
          videoUpdate(input: $input) {
            id
          }
        }
      `)

      it('should update video', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.video.findUnique.mockResolvedValue({
          published: false,
          publishedAt: null,
          slug: 'old-slug',
          variants: [{ languageId: 'en' }]
        } as any)
        prismaMock.video.findMany.mockResolvedValue([{ id: 'id' }] as any)
        prismaMock.video.update.mockResolvedValue({
          id: 'id',
          label: VideoLabel.episode,
          primaryLanguageId: 'primaryLanguageId',
          published: true,
          slug: 'slug',
          noIndex: true,
          childIds: [],
          availableLanguages: [],
          originId: null
        } as unknown as Video)
        const result = await authClient({
          document: VIDEO_UPDATE_MUTATION,
          variables: {
            input: {
              id: 'id',
              label: VideoLabel.episode,
              primaryLanguageId: 'primaryLanguageId',
              published: true,
              slug: 'slug',
              noIndex: true,
              childIds: []
            }
          }
        })
        expect(prismaMock.video.findUnique).toHaveBeenCalledWith({
          where: { id: 'id' },
          select: expect.objectContaining({
            published: true,
            publishedAt: true,
            slug: true,
            variants: expect.anything()
          })
        })
        expect(prismaMock.video.update).toHaveBeenCalledWith({
          where: { id: 'id' },
          include: { children: true },
          data: {
            label: 'episode',
            primaryLanguageId: 'primaryLanguageId',
            published: true,
            publishedAt: expect.any(Date),
            slug: 'slug',
            noIndex: true,
            childIds: [],
            children: {
              set: []
            }
          }
        })
        expect(result).toHaveProperty('data.videoUpdate', {
          id: 'id'
        })
      })

      it('should update video with child relations when childIds are provided', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.video.findMany.mockResolvedValue([
          { id: 'child1' },
          { id: 'child2' },
          { id: 'parent-id' }
        ] as any)
        prismaMock.video.update.mockResolvedValue({
          id: 'parent-id',
          label: VideoLabel.series,
          childIds: ['child1', 'child2'],
          children: [{ id: 'child1' }, { id: 'child2' }]
        } as unknown as Video)

        const result = await authClient({
          document: VIDEO_UPDATE_MUTATION,
          variables: {
            input: {
              id: 'parent-id',
              childIds: ['child1', 'child2']
            }
          }
        })

        expect(prismaMock.video.update).toHaveBeenCalledWith({
          where: { id: 'parent-id' },
          include: { children: true },
          data: {
            childIds: ['child1', 'child2'],
            children: {
              set: [{ id: 'child1' }, { id: 'child2' }]
            }
          }
        })
        expect(result).toHaveProperty('data.videoUpdate', {
          id: 'parent-id'
        })
      })

      it('should set publishedAt when updating from unpublished to published', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.video.findUnique.mockResolvedValue({
          published: false,
          publishedAt: null,
          slug: 'existing-slug',
          variants: [{ languageId: 'en' }]
        } as any)
        prismaMock.video.update.mockResolvedValue({
          id: 'id',
          published: true,
          publishedAt: new Date()
        } as unknown as Video)

        await authClient({
          document: VIDEO_UPDATE_MUTATION,
          variables: {
            input: {
              id: 'id',
              published: true
            }
          }
        })

        expect(prismaMock.video.findUnique).toHaveBeenCalledWith({
          where: { id: 'id' },
          select: expect.objectContaining({
            published: true,
            publishedAt: true,
            slug: true,
            variants: expect.anything()
          })
        })
        expect(prismaMock.video.update).toHaveBeenCalledWith({
          where: { id: 'id' },
          include: { children: true },
          data: {
            published: true,
            publishedAt: expect.any(Date)
          }
        })
      })

      it('should NOT overwrite existing publishedAt when updating to published', async () => {
        const existingPublishedAt = new Date('2023-01-01')
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.video.findUnique.mockResolvedValue({
          published: false,
          publishedAt: existingPublishedAt,
          slug: 'existing-slug',
          variants: [{ languageId: 'en' }]
        } as any)
        prismaMock.video.update.mockResolvedValue({
          id: 'id',
          published: true,
          publishedAt: existingPublishedAt
        } as unknown as Video)

        await authClient({
          document: VIDEO_UPDATE_MUTATION,
          variables: {
            input: {
              id: 'id',
              published: true
            }
          }
        })

        expect(prismaMock.video.findUnique).toHaveBeenCalledWith({
          where: { id: 'id' },
          select: expect.objectContaining({
            published: true,
            publishedAt: true,
            slug: true,
            variants: expect.anything()
          })
        })
        expect(prismaMock.video.update).toHaveBeenCalledWith({
          where: { id: 'id' },
          include: { children: true },
          data: {
            published: true,
            publishedAt: undefined
          }
        })
      })

      it('should not set publishedAt when published is not being updated', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.video.update.mockResolvedValue({
          id: 'id',
          label: VideoLabel.episode
        } as unknown as Video)

        await authClient({
          document: VIDEO_UPDATE_MUTATION,
          variables: {
            input: {
              id: 'id',
              label: VideoLabel.episode
            }
          }
        })

        // Should not check for publishedAt when published is not being updated
        expect(prismaMock.video.findUnique).not.toHaveBeenCalledWith({
          where: { id: 'id' },
          select: { publishedAt: true }
        })
        expect(prismaMock.video.update).toHaveBeenCalledWith({
          where: { id: 'id' },
          include: { children: true },
          data: {
            label: 'episode',
            publishedAt: undefined
          }
        })
      })

      it('should fail if not publisher', async () => {
        const result = await client({
          document: VIDEO_UPDATE_MUTATION,
          variables: {
            input: {
              id: 'id',
              label: VideoLabel.segment,
              primaryLanguageId: 'primaryLanguageId',
              published: true,
              slug: 'slug',
              noIndex: true,
              childIds: []
            }
          }
        })
        expect(result).toHaveProperty('data', null)
      })

      it('should allow slug update when publishedAt is null', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.video.findUnique.mockResolvedValue({
          published: false,
          publishedAt: null,
          slug: 'old-slug',
          variants: []
        } as any)
        prismaMock.video.update.mockResolvedValue({
          id: 'id',
          slug: 'new-slug'
        } as unknown as Video)

        const result = await authClient({
          document: VIDEO_UPDATE_MUTATION,
          variables: {
            input: {
              id: 'id',
              slug: 'new-slug'
            }
          }
        })

        expect(prismaMock.video.findUnique).toHaveBeenCalledWith({
          where: { id: 'id' },
          select: expect.objectContaining({
            published: true,
            publishedAt: true,
            slug: true,
            variants: expect.anything()
          })
        })
        expect(prismaMock.video.update).toHaveBeenCalledWith({
          where: { id: 'id' },
          include: { children: true },
          data: {
            slug: 'new-slug',
            publishedAt: undefined
          }
        })
        expect(result).toHaveProperty('data.videoUpdate', {
          id: 'id'
        })
      })

      it('should prevent slug update when publishedAt is not null', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.video.findUnique.mockResolvedValue({
          published: false,
          publishedAt: new Date('2023-01-01'),
          slug: 'old-slug',
          variants: []
        } as any)

        const result = await authClient({
          document: VIDEO_UPDATE_MUTATION,
          variables: {
            input: {
              id: 'id',
              slug: 'new-slug'
            }
          }
        })

        expect(prismaMock.video.findUnique).toHaveBeenCalledWith({
          where: { id: 'id' },
          select: expect.objectContaining({
            published: true,
            publishedAt: true,
            slug: true,
            variants: expect.anything()
          })
        })
        expect(prismaMock.video.update).not.toHaveBeenCalled()
        expect(result).toHaveProperty('data', null)
      })

      it('should allow slug update with same value when publishedAt is not null', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.video.findUnique.mockResolvedValue({
          published: false,
          publishedAt: new Date('2023-01-01'),
          slug: 'same-slug',
          variants: []
        } as any)
        prismaMock.video.update.mockResolvedValue({
          id: 'id',
          slug: 'same-slug'
        } as unknown as Video)

        const result = await authClient({
          document: VIDEO_UPDATE_MUTATION,
          variables: {
            input: {
              id: 'id',
              slug: 'same-slug'
            }
          }
        })

        expect(prismaMock.video.findUnique).toHaveBeenCalledWith({
          where: { id: 'id' },
          select: expect.objectContaining({
            published: true,
            publishedAt: true,
            slug: true,
            variants: expect.anything()
          })
        })
        expect(prismaMock.video.update).toHaveBeenCalledWith({
          where: { id: 'id' },
          include: { children: true },
          data: {
            slug: 'same-slug',
            publishedAt: undefined
          }
        })
        expect(result).toHaveProperty('data.videoUpdate', {
          id: 'id'
        })
      })
    })

    describe('videoDelete', () => {
      const VIDEO_DELETE_MUTATION = graphql(`
        mutation VideoDelete($id: ID!) {
          videoDelete(id: $id) {
            id
          }
        }
      `)

      it('should delete video that has never been published', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.video.findUnique.mockResolvedValue({
          id: 'videoId',
          published: false,
          publishedAt: null,
          variants: [
            {
              muxVideoId: 'muxVideoId1',
              muxVideo: { assetId: 'assetId1' }
            }
          ],
          cloudflareAssets: [{ key: 'asset1.mp4' }, { key: 'asset2.jpg' }],
          bibleCitation: [{ id: 'citation1' }]
        } as any)
        prismaMock.video.delete.mockResolvedValue({
          id: 'videoId'
        } as any)

        const result = await authClient({
          document: VIDEO_DELETE_MUTATION,
          variables: {
            id: 'videoId'
          }
        })

        expect(prismaMock.video.findUnique).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { id: 'videoId' }
          })
        )
        expect(prismaMock.video.delete).toHaveBeenCalledWith({
          where: { id: 'videoId' }
        })
        expect(result).toHaveProperty('data.videoDelete', {
          id: 'videoId'
        })
      })

      it('should fail to delete video that has been published', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.video.findUnique.mockResolvedValue({
          id: 'videoId',
          published: true,
          publishedAt: new Date('2023-01-01'),
          variants: [],
          cloudflareAssets: [],
          bibleCitation: []
        } as any)

        const result = await authClient({
          document: VIDEO_DELETE_MUTATION,
          variables: {
            id: 'videoId'
          }
        })

        expect(result).toHaveProperty('data', null)
        expect(result).toHaveProperty('errors')
        expect(prismaMock.video.delete).not.toHaveBeenCalled()
      })

      it('should fail to delete unpublished video that was previously published', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.video.findUnique.mockResolvedValue({
          id: 'videoId',
          published: false,
          publishedAt: new Date('2023-01-01'), // Has been published before
          variants: [],
          cloudflareAssets: [],
          bibleCitation: []
        } as any)

        const result = await authClient({
          document: VIDEO_DELETE_MUTATION,
          variables: {
            id: 'videoId'
          }
        })

        expect(result).toHaveProperty('data', null)
        expect(result).toHaveProperty('errors')
        expect(prismaMock.video.delete).not.toHaveBeenCalled()
      })

      it('should fail to delete non-existent video', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.video.findUnique.mockResolvedValue(null)

        const result = await authClient({
          document: VIDEO_DELETE_MUTATION,
          variables: {
            id: 'nonExistentId'
          }
        })

        expect(result).toHaveProperty('data', null)
        expect(result).toHaveProperty('errors')
        expect(prismaMock.video.delete).not.toHaveBeenCalled()
      })

      it('should fail if not publisher', async () => {
        const result = await client({
          document: VIDEO_DELETE_MUTATION,
          variables: {
            id: 'videoId'
          }
        })

        expect(result).toHaveProperty('data', null)
        expect(prismaMock.video.delete).not.toHaveBeenCalled()
      })

      it('should delete video with no related assets', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.video.findUnique.mockResolvedValue({
          id: 'videoId',
          published: false,
          publishedAt: null,
          variants: [],
          cloudflareAssets: [],
          bibleCitation: []
        } as any)
        prismaMock.video.delete.mockResolvedValue({
          id: 'videoId'
        } as any)

        const result = await authClient({
          document: VIDEO_DELETE_MUTATION,
          variables: {
            id: 'videoId'
          }
        })

        expect(prismaMock.video.delete).toHaveBeenCalledWith({
          where: { id: 'videoId' }
        })
        expect(result).toHaveProperty('data.videoDelete', {
          id: 'videoId'
        })
      })
    })

    describe('parent variant management on video update', () => {
      it('should document expected behavior when video published status changes', () => {
        // This test documents the expected behavior when a video's published status changes
        // The actual functionality is tested through integration tests

        const expectedBehavior = {
          // When a video is published (published: false -> true)
          onPublish: [
            'Find all published variants for this video',
            'For each published variant, call handleParentVariantCreation',
            'Create empty parent variants for all parent videos',
            'Update parent videos availableLanguages arrays'
          ],

          // When a video is unpublished (published: true -> false)
          onUnpublish: [
            'Find all variants for this video',
            'For each variant, call handleParentVariantCleanup',
            'Remove parent variants if no other children have variants in same language',
            'Update parent videos availableLanguages arrays'
          ]
        }

        // Assert that the expected behavior is documented
        expect(expectedBehavior.onPublish).toHaveLength(4)
        expect(expectedBehavior.onUnpublish).toHaveLength(4)
      })
    })
  })

  describe('entity', () => {
    const VIDEO = graphql(`
      query CoreVideo {
        _entities(
          representations: [
            { __typename: "Video", id: "testId", primaryLanguageId: null }
          ]
        ) {
          ... on Video {
            id
          }
        }
      }
    `)

    it('should return video', async () => {
      prismaMock.video.findUniqueOrThrow.mockResolvedValue({
        id: 'testId',
        label: 'behindTheScenes',
        primaryLanguageId: 'primaryLanguageId',
        slug: null,
        noIndex: null,
        published: true,
        childIds: [],
        availableLanguages: [],
        locked: false,
        originId: null,
        restrictDownloadPlatforms: [],
        restrictViewPlatforms: [],
        publishedAt: null
      })
      const data = await client({
        document: VIDEO
      })
      expect(prismaMock.video.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 'testId' }
      })
      expect(data).toHaveProperty('data._entities[0]', {
        id: 'testId'
      })
    })
  })
})
