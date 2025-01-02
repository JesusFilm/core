import {
  VideoEdition,
  VideoVariant,
  VideoVariantDownload
} from '.prisma/api-media-client'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

describe('videoVariant', () => {
  const client = getClient()

  const authClient = getClient({
    headers: {
      authorization: 'token'
    },
    context: {
      currentRoles: ['publisher']
    }
  })

  describe('videoVariants', () => {
    const VIDEO_VARIANTS_QUERY = graphql(`
      query videoVariants(
        $languageId: ID
        $primary: Boolean
        $input: VideoVariantFilter
      ) {
        videoVariants(input: $input) {
          id
          videoId
          hls
          downloadable
          downloads {
            id
            quality
            size
            height
            width
            url
          }
          duration
          language {
            id
          }
          published
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
          videoEdition {
            id
            name
          }
        }
      }
    `)

    type VideoVariantAndIncludes = VideoVariant & {
      downloads: VideoVariantDownload[]
      videoEdition: VideoEdition
    }

    it('should query videoVariants', async () => {
      prismaMock.videoVariant.findMany.mockResolvedValueOnce([
        {
          id: 'videoVariantId',
          videoId: 'videoId',
          hls: null,
          duration: null,
          languageId: 'languageId',
          edition: 'base',
          slug: 'videoSlug',
          downloadable: true,
          downloads: [
            {
              id: 'downloadId',
              quality: 'high',
              size: null,
              url: 'url',
              videoVariantId: 'videoVariantId'
            }
          ],
          published: true,
          videoEdition: {
            id: 'videoEditionId',
            name: 'videoEditionName'
          }
        }
      ] as VideoVariantAndIncludes[])
      prismaMock.videoSubtitle.findMany.mockResolvedValueOnce([
        {
          edition: 'base',
          id: 'subtitleId',
          vttSrc: 'value',
          srtSrc: null,
          primary: false,
          languageId: 'languageId',
          videoId: 'videoId'
        }
      ])
      prismaMock.videoSubtitle.count.mockResolvedValueOnce(123)
      const data = await client({
        document: VIDEO_VARIANTS_QUERY
      })
      expect(prismaMock.videoVariant.findMany).toHaveBeenCalledWith({
        where: {
          published: true
        },
        include: {
          downloads: true,
          videoEdition: true
        }
      })
      expect(prismaMock.videoSubtitle.findMany).toHaveBeenCalledWith({
        where: {
          AND: [{ videoId: 'videoId', edition: 'base' }, { OR: [] }]
        },
        orderBy: {
          primary: 'desc'
        }
      })
      expect(prismaMock.videoSubtitle.count).toHaveBeenCalledWith({
        where: { videoId: 'videoId', edition: 'base' }
      })
      expect(data).toHaveProperty('data.videoVariants', [
        {
          id: 'videoVariantId',
          videoId: 'videoId',
          hls: null,
          downloadable: true,
          downloads: [
            {
              id: 'downloadId',
              quality: 'high',
              size: 0,
              url: 'url',
              height: 0,
              width: 0
            }
          ],
          videoEdition: {
            id: 'videoEditionId',
            name: 'videoEditionName'
          },
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
          slug: 'videoSlug',
          published: true
        }
      ])
    })

    it('should query videoVariants without default values', async () => {
      prismaMock.videoVariant.findMany.mockResolvedValueOnce([
        {
          id: 'videoVariantId',
          videoId: 'videoId',
          hls: null,
          duration: 768,
          languageId: 'languageId',
          edition: 'base',
          slug: 'videoSlug',
          downloadable: true,
          published: true,
          downloads: [
            {
              id: 'downloadId',
              quality: 'high',
              size: 1024,
              url: 'url',
              height: 0,
              width: 0,
              videoVariantId: 'videoVariantId'
            }
          ],
          videoEdition: {
            id: 'videoEditionId',
            name: 'videoEditionName'
          }
        }
      ] as VideoVariantAndIncludes[])
      prismaMock.videoSubtitle.findMany.mockResolvedValueOnce([
        {
          id: 'subtitleId',
          vttSrc: 'value',
          srtSrc: null,
          primary: false,
          languageId: 'languageId',
          videoId: 'videoId',
          edition: 'base'
        }
      ])
      prismaMock.videoSubtitle.count.mockResolvedValueOnce(123)
      const data = await client({
        document: VIDEO_VARIANTS_QUERY
      })
      expect(prismaMock.videoVariant.findMany).toHaveBeenCalledWith({
        where: {
          published: true
        },
        include: {
          downloads: true,
          videoEdition: true
        }
      })
      expect(prismaMock.videoSubtitle.findMany).toHaveBeenCalledWith({
        where: {
          AND: [{ videoId: 'videoId', edition: 'base' }, { OR: [] }]
        },
        orderBy: {
          primary: 'desc'
        }
      })
      expect(prismaMock.videoSubtitle.count).toHaveBeenCalledWith({
        where: { videoId: 'videoId', edition: 'base' }
      })
      expect(data).toHaveProperty('data.videoVariants', [
        {
          id: 'videoVariantId',
          videoId: 'videoId',
          hls: null,
          downloadable: true,
          downloads: [
            {
              id: 'downloadId',
              quality: 'high',
              size: 1024,
              height: 0,
              width: 0,
              url: 'url'
            }
          ],
          videoEdition: {
            id: 'videoEditionId',
            name: 'videoEditionName'
          },
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
          slug: 'videoSlug',
          published: true
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
          downloadable: true,
          downloads: [
            {
              id: 'downloadId',
              quality: 'high',
              size: 1024,
              url: 'url',
              videoVariantId: 'videoVariantId',
              height: 0,
              width: 0
            }
          ],
          published: false,
          videoEdition: {
            id: 'videoEditionId',
            name: 'videoEditionName'
          }
        }
      ] as VideoVariantAndIncludes[])
      prismaMock.videoSubtitle.findMany.mockResolvedValueOnce([
        {
          edition: 'base',
          id: 'subtitleId',
          vttSrc: 'value',
          srtSrc: null,
          primary: false,
          languageId: 'languageId',
          videoId: 'videoId'
        }
      ])
      prismaMock.videoSubtitle.count.mockResolvedValueOnce(123)
      const data = await client({
        document: VIDEO_VARIANTS_QUERY,
        variables: {
          languageId: 'languageId',
          primary: false,
          input: {
            onlyPublished: false
          }
        }
      })
      expect(prismaMock.videoVariant.findMany).toHaveBeenCalledWith({
        where: {
          published: undefined
        },
        include: {
          downloads: true,
          videoEdition: true
        }
      })
      expect(data).toHaveProperty('data.videoVariants', [
        {
          id: 'videoVariantId',
          videoId: 'videoId',
          hls: null,
          downloadable: true,
          downloads: [
            {
              id: 'downloadId',
              quality: 'high',
              size: 1024,
              url: 'url',
              height: 0,
              width: 0
            }
          ],
          videoEdition: {
            id: 'videoEditionId',
            name: 'videoEditionName'
          },
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
          slug: 'videoSlug',
          published: false
        }
      ])
    })
  })

  describe('mutations', () => {
    describe('videoVariantCreate', () => {
      const VIDEO_VARIANT_CREATE_MUTATION = graphql(`
        mutation VideoVariantCreate($input: VideoVariantCreateInput!) {
          videoVariantCreate(input: $input) {
            id
          }
        }
      `)

      it('should create a new video variant', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.videoVariant.create.mockResolvedValue({
          id: 'id',
          hls: 'hls',
          duration: 1024,
          lengthInMilliseconds: 123456,
          dash: 'dash',
          edition: 'base',
          slug: 'videoSlug',
          videoId: 'videoId',
          languageId: 'languageId',
          published: true,
          share: 'share',
          downloadable: true
        })
        const result = await authClient({
          document: VIDEO_VARIANT_CREATE_MUTATION,
          variables: {
            input: {
              id: 'id',
              hls: 'hls',
              dash: 'dash',
              duration: 1024,
              lengthInMilliseconds: 123456,
              languageId: 'languageId',
              edition: 'base',
              slug: 'videoSlug',
              videoId: 'videoId',
              share: 'share',
              downloadable: true
            }
          }
        })
        expect(prismaMock.videoVariant.create).toHaveBeenCalledWith({
          data: {
            id: 'id',
            hls: 'hls',
            dash: 'dash',
            duration: 1024,
            lengthInMilliseconds: 123456,
            languageId: 'languageId',
            edition: 'base',
            slug: 'videoSlug',
            videoId: 'videoId',
            share: 'share',
            downloadable: true
          }
        })
        expect(result).toHaveProperty('data.videoVariantCreate', {
          id: 'id'
        })
      })

      it('should fail if not publisher', async () => {
        const result = await client({
          document: VIDEO_VARIANT_CREATE_MUTATION,
          variables: {
            input: {
              id: 'id',
              hls: 'hls',
              dash: 'dash',
              duration: 1024,
              lengthInMilliseconds: 123456,
              languageId: 'languageId',
              edition: 'base',
              slug: 'videoSlug',
              videoId: 'videoId',
              share: 'share',
              downloadable: true
            }
          }
        })
        expect(result).toHaveProperty('data', null)
      })
    })

    describe('videoVariantUpdate', () => {
      const VIDEO_VARIANT_UPDATE_MUTATION = graphql(`
        mutation VideoVariantUpdate($input: VideoVariantUpdateInput!) {
          videoVariantUpdate(input: $input) {
            id
          }
        }
      `)

      it('should update a video variant', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.videoVariant.update.mockResolvedValue({
          id: 'id',
          hls: 'hls',
          duration: 1024,
          lengthInMilliseconds: 123456,
          dash: 'dash',
          edition: 'base',
          slug: 'videoSlug',
          videoId: 'videoId',
          languageId: 'languageId',
          published: true,
          share: 'share',
          downloadable: false
        })
        const result = await authClient({
          document: VIDEO_VARIANT_UPDATE_MUTATION,
          variables: {
            input: {
              id: 'id',
              hls: 'hls',
              dash: 'dash',
              duration: 1024,
              lengthInMilliseconds: 123456,
              languageId: 'languageId',
              edition: 'base',
              slug: 'videoSlug',
              videoId: 'videoId',
              share: 'share',
              downloadable: false
            }
          }
        })
        expect(prismaMock.videoVariant.update).toHaveBeenCalledWith({
          where: { id: 'id' },
          data: {
            hls: 'hls',
            dash: 'dash',
            duration: 1024,
            lengthInMilliseconds: 123456,
            languageId: 'languageId',
            edition: 'base',
            slug: 'videoSlug',
            videoId: 'videoId',
            share: 'share',
            downloadable: false
          }
        })
        expect(result).toHaveProperty('data.videoVariantUpdate', {
          id: 'id'
        })
      })

      it('should fail if not publisher', async () => {
        const result = await client({
          document: VIDEO_VARIANT_UPDATE_MUTATION,
          variables: {
            input: {
              id: 'id',
              hls: 'hls',
              dash: 'dash',
              duration: 1024,
              lengthInMilliseconds: 123456,
              languageId: 'languageId',
              edition: 'base',
              slug: 'videoSlug',
              videoId: 'videoId',
              share: 'share',
              downloadable: true
            }
          }
        })
        expect(result).toHaveProperty('data', null)
      })
    })

    describe('videoVariantDelete', () => {
      const VIDEO_VARIANT_DELETE_MUTATION = graphql(`
        mutation VideoVariantDelete($id: ID!) {
          videoVariantDelete(id: $id) {
            id
          }
        }
      `)

      it('should delete a video variant', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.videoVariant.delete.mockResolvedValue({
          id: 'id',
          hls: 'hls',
          duration: 1024,
          lengthInMilliseconds: 123456,
          dash: 'dash',
          edition: 'base',
          slug: 'videoSlug',
          videoId: 'videoId',
          languageId: 'languageId',
          published: true,
          share: 'share',
          downloadable: true
        })
        const result = await authClient({
          document: VIDEO_VARIANT_DELETE_MUTATION,
          variables: {
            id: 'id'
          }
        })
        expect(prismaMock.videoVariant.delete).toHaveBeenCalledWith({
          where: { id: 'id' }
        })
        expect(result).toHaveProperty('data.videoVariantDelete', {
          id: 'id'
        })
      })

      it('should fail if not publisher', async () => {
        const result = await client({
          document: VIDEO_VARIANT_DELETE_MUTATION,
          variables: {
            id: 'id'
          }
        })
        expect(result).toHaveProperty('data', null)
      })
    })
  })
})
