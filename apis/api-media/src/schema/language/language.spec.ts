import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

interface LabeledVideoCountsResponse {
  data: {
    keywords: Array<{
      language: {
        id: string
        labeledVideoCounts: {
          seriesCount: number
          featureFilmCount: number
          shortFilmCount: number
        }
      }
    }>
  }
}

describe('Language', () => {
  const client = getClient()

  describe('labeledVideoCounts', () => {
    const LABELED_VIDEO_COUNTS_QUERY = graphql(`
      query LabeledVideoCounts {
        keywords {
          language {
            id
            labeledVideoCounts {
              seriesCount
              featureFilmCount
              shortFilmCount
            }
          }
        }
      }
    `)

    it('should return correct counts for different video types', async () => {
      const mockVideoVariants = [
        {
          id: '1',
          slug: 'variant-1',
          languageId: 'testLanguageId',
          videoId: 'video1',
          hls: null,
          dash: null,
          share: null,
          downloadable: true,
          duration: null,
          lengthInMilliseconds: null,
          published: true,
          edition: 'default',
          muxVideoId: null,
          video: { label: 'series' }
        },
        {
          id: '2',
          slug: 'variant-2',
          languageId: 'testLanguageId',
          videoId: 'video2',
          hls: null,
          dash: null,
          share: null,
          downloadable: true,
          duration: null,
          lengthInMilliseconds: null,
          published: true,
          edition: 'default',
          muxVideoId: null,
          video: { label: 'featureFilm' }
        },
        {
          id: '3',
          slug: 'variant-3',
          languageId: 'testLanguageId',
          videoId: 'video3',
          hls: null,
          dash: null,
          share: null,
          downloadable: true,
          duration: null,
          lengthInMilliseconds: null,
          published: true,
          edition: 'default',
          muxVideoId: null,
          video: { label: 'shortFilm' }
        }
      ]

      prismaMock.videoVariant.findMany.mockResolvedValue(mockVideoVariants)
      prismaMock.keyword.findMany.mockResolvedValue([
        {
          id: 'keywordId',
          value: 'test',
          languageId: 'testLanguageId'
        }
      ])

      const result = (await client({
        document: LABELED_VIDEO_COUNTS_QUERY
      })) as LabeledVideoCountsResponse

      expect(prismaMock.videoVariant.findMany).toHaveBeenCalledWith({
        where: {
          languageId: 'testLanguageId',
          video: {
            label: {
              in: ['series', 'featureFilm', 'shortFilm']
            }
          }
        },
        select: {
          video: {
            select: {
              label: true
            }
          }
        }
      })

      const labeledVideoCounts =
        result.data?.keywords?.[0]?.language?.labeledVideoCounts
      expect(labeledVideoCounts).toEqual({
        seriesCount: 1,
        featureFilmCount: 1,
        shortFilmCount: 1
      })
    })

    it('should return zero counts when no videos exist', async () => {
      prismaMock.videoVariant.findMany.mockResolvedValue([])
      prismaMock.keyword.findMany.mockResolvedValue([
        {
          id: 'keywordId',
          value: 'test',
          languageId: 'testLanguageId'
        }
      ])

      const result = (await client({
        document: LABELED_VIDEO_COUNTS_QUERY
      })) as LabeledVideoCountsResponse

      const labeledVideoCounts =
        result.data?.keywords?.[0]?.language?.labeledVideoCounts
      expect(labeledVideoCounts).toEqual({
        seriesCount: 0,
        featureFilmCount: 0,
        shortFilmCount: 0
      })
    })
  })
})
