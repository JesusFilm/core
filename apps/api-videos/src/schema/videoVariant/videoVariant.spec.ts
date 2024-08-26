import { graphql } from 'gql.tada'

import {
  VideoVariant,
  VideoVariantDownload,
  VideoVariantSubtitle
} from '.prisma/api-videos-client'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'

describe('videoVariant', () => {
  const client = getClient()

  describe('videoVariants', () => {
    const VIDEO_VARIANTS_QUERY = graphql(`
      query videoVariants($languageId: ID, $primary: Boolean) {
        videoVariants {
          id
          hls
          downloads {
            id
            quality
            size
            url
          }
          duration
          language {
            id
          }
          subtitle(languageId: $languageId, primary: $primary) {
            id
            value
            primary
            language {
              id
            }
          }
          subtitleCount
          slug
        }
      }
    `)

    type VideoVariantAndIncludes = VideoVariant & {
      downloads: VideoVariantDownload[]
      subtitle: VideoVariantSubtitle[]
    }

    it('should query videoVariants', async () => {
      prismaMock.videoVariant.findMany.mockResolvedValueOnce([
        {
          id: 'videoVariantId',
          hls: null,
          duration: null,
          languageId: 'languageId',
          edition: 'base',
          slug: 'videoSlug',
          videoId: 'videoId',
          downloads: [
            {
              id: 'downloadId',
              quality: 'high',
              size: null,
              url: 'url',
              videoVariantId: 'videoVariantId'
            }
          ],
          subtitle: [
            {
              id: 'subtitleId',
              value: 'value',
              primary: false,
              languageId: 'languageId',
              videoVariantId: 'videoVariantId'
            }
          ]
        }
      ] as VideoVariantAndIncludes[])
      prismaMock.videoVariantSubtitle.count.mockResolvedValueOnce(123)
      const data = await client({
        document: VIDEO_VARIANTS_QUERY
      })
      expect(prismaMock.videoVariant.findMany).toHaveBeenCalledWith({
        include: {
          downloads: true,
          subtitle: {
            orderBy: { primary: 'desc' },
            where: {
              OR: [{ languageId: '529' }]
            }
          }
        }
      })
      expect(data).toHaveProperty('data.videoVariants', [
        {
          id: 'videoVariantId',
          hls: null,
          downloads: [
            {
              id: 'downloadId',
              quality: 'high',
              size: 0,
              url: 'url'
            }
          ],
          duration: 0,
          language: { id: 'languageId' },
          subtitle: [
            {
              id: 'subtitleId',
              value: 'value',
              primary: false,
              language: {
                id: 'languageId'
              }
            }
          ],
          subtitleCount: 123,
          slug: 'videoSlug'
        }
      ])
    })

    it('should query videoVariants without default values', async () => {
      prismaMock.videoVariant.findMany.mockResolvedValueOnce([
        {
          id: 'videoVariantId',
          hls: null,
          duration: 768,
          languageId: 'languageId',
          edition: 'base',
          slug: 'videoSlug',
          videoId: 'videoId',
          downloads: [
            {
              id: 'downloadId',
              quality: 'high',
              size: 1024,
              url: 'url',
              videoVariantId: 'videoVariantId'
            }
          ],
          subtitle: [
            {
              id: 'subtitleId',
              value: 'value',
              primary: false,
              languageId: 'languageId',
              videoVariantId: 'videoVariantId'
            }
          ]
        }
      ] as VideoVariantAndIncludes[])
      prismaMock.videoVariantSubtitle.count.mockResolvedValueOnce(123)
      const data = await client({
        document: VIDEO_VARIANTS_QUERY
      })
      expect(prismaMock.videoVariant.findMany).toHaveBeenCalledWith({
        include: {
          downloads: true,
          subtitle: {
            orderBy: { primary: 'desc' },
            where: {
              OR: [{ languageId: '529' }]
            }
          }
        }
      })
      expect(data).toHaveProperty('data.videoVariants', [
        {
          id: 'videoVariantId',
          hls: null,
          downloads: [
            {
              id: 'downloadId',
              quality: 'high',
              size: 1024,
              url: 'url'
            }
          ],
          duration: 768,
          language: { id: 'languageId' },
          subtitle: [
            {
              id: 'subtitleId',
              value: 'value',
              primary: false,
              language: {
                id: 'languageId'
              }
            }
          ],
          subtitleCount: 123,
          slug: 'videoSlug'
        }
      ])
    })

    it('should query videoVariants with variables', async () => {
      prismaMock.videoVariant.findMany.mockResolvedValueOnce([
        {
          id: 'videoVariantId',
          hls: null,
          duration: 768,
          languageId: 'languageId',
          edition: 'base',
          slug: 'videoSlug',
          videoId: 'videoId',
          downloads: [
            {
              id: 'downloadId',
              quality: 'high',
              size: 1024,
              url: 'url',
              videoVariantId: 'videoVariantId'
            }
          ],
          subtitle: [
            {
              id: 'subtitleId',
              value: 'value',
              primary: false,
              languageId: 'languageId',
              videoVariantId: 'videoVariantId'
            }
          ]
        }
      ] as VideoVariantAndIncludes[])
      prismaMock.videoVariantSubtitle.count.mockResolvedValueOnce(123)
      const data = await client({
        document: VIDEO_VARIANTS_QUERY,
        variables: { languageId: 'languageId', primary: false }
      })
      expect(prismaMock.videoVariant.findMany).toHaveBeenCalledWith({
        include: {
          downloads: true,
          subtitle: {
            orderBy: { primary: 'desc' },
            where: {
              OR: [{ primary: false }, { languageId: 'languageId' }]
            }
          }
        }
      })
      expect(data).toHaveProperty('data.videoVariants', [
        {
          id: 'videoVariantId',
          hls: null,
          downloads: [
            {
              id: 'downloadId',
              quality: 'high',
              size: 1024,
              url: 'url'
            }
          ],
          duration: 768,
          language: { id: 'languageId' },
          subtitle: [
            {
              id: 'subtitleId',
              value: 'value',
              primary: false,
              language: {
                id: 'languageId'
              }
            }
          ],
          subtitleCount: 123,
          slug: 'videoSlug'
        }
      ])
    })
  })
})
