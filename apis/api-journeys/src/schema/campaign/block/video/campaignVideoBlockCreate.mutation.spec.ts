import { GraphQLError } from 'graphql'

import {
  authClient,
  setupCampaignBlockSpec
} from '../../../../../test/campaignBlockSpec'
import {
  CampaignBlockRow,
  CampaignFixture,
  campaignFactory
} from '../../../../../test/campaignFactory'
import { prismaMock } from '../../../../../test/prismaMock'
import { graphql } from '../../../../lib/graphql/subgraphGraphql'
import {
  fetchFieldsFromMux,
  fetchFieldsFromYouTube
} from '../../../block/video/service'
import { fetchWatchVideoBySlug } from '../../gatewayClient'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

vi.mock('../../../block/video/service', async () => ({
  ...(await vi.importActual('../../../block/video/service')),
  fetchFieldsFromYouTube: vi.fn(),
  fetchFieldsFromMux: vi.fn()
}))

vi.mock('../../gatewayClient', async () => ({
  ...(await vi.importActual('../../gatewayClient')),
  fetchWatchVideoBySlug: vi.fn()
}))

const YOUTUBE_ID = 'jQaN9DvFTbw'
const WATCH_URL = 'https://www.jesusfilm.org/watch/jesus.html/english.html'

describe('campaignVideoBlockCreate', () => {
  const CREATE = graphql(`
    mutation CampaignVideoBlockCreate($input: CampaignVideoBlockCreateInput!) {
      campaignVideoBlockCreate(input: $input) {
        id
        pageId
        regionId
        parentBlockId
        parentOrder
        source
        videoId
        videoVariantLanguageId
        title
        description
        image
        duration
        mediaVideo {
          __typename
          # Video's primaryLanguageId is ID!, the others' ID: alias one.
          ... on Video {
            id
            videoPrimaryLanguageId: primaryLanguageId
          }
          ... on YouTube {
            id
            primaryLanguageId
          }
          ... on MuxVideo {
            id
            primaryLanguageId
          }
        }
      }
    }
  `)

  let fixture: CampaignFixture
  let hero: CampaignBlockRow
  let carousel: CampaignBlockRow

  beforeEach(() => {
    fixture = setupCampaignBlockSpec()
    hero = fixture.blocks.find((block) => block.id === 'heroId')!
    carousel = fixture.blocks.find((block) => block.id === 'carouselId')!
    prismaMock.campaignBlock.findFirst.mockResolvedValue(hero)
    vi.mocked(fetchFieldsFromYouTube).mockResolvedValue({
      title: 'YouTube title',
      description: 'YouTube description',
      image: 'https://i.ytimg.com/vi/jQaN9DvFTbw/hqdefault.jpg',
      duration: 120
    })
    vi.mocked(fetchFieldsFromMux).mockResolvedValue({
      title: 'Mux title',
      image: 'https://image.mux.com/playbackId/thumbnail.png?time=1',
      duration: 90,
      endAt: 90
    })
    vi.mocked(fetchWatchVideoBySlug).mockResolvedValue({
      id: '1_jf-0-0',
      label: 'featureFilm',
      childrenCount: 61
    })
    prismaMock.campaignBlock.create.mockImplementation((async ({
      data
    }: any) => ({
      ...hero,
      action: null,
      ...data,
      id: data.id ?? 'newVideoId'
    })) as never)
    prismaMock.campaignBlock.update.mockImplementation((async ({
      where,
      data
    }: any) => ({
      ...fixture.blocks.find((block) => block.id === where.id),
      ...data
    })) as never)
  })

  async function create(input: Record<string, unknown>): Promise<any> {
    return await authClient({
      document: CREATE,
      variables: {
        input: { campaignId: 'campaignId', parentBlockId: 'heroId', ...input }
      }
    })
  }

  function createdData(): Record<string, unknown> {
    return (prismaMock.campaignBlock.create.mock.calls[0][0] as any).data
  }

  describe('the owned row', () => {
    it('creates the video with parentOrder null and the owner’s scoping, points mediaBlockId at it and soft-deletes the previous media', async () => {
      prismaMock.campaignBlock.findFirst.mockResolvedValue({
        ...hero,
        mediaBlockId: 'oldMediaId'
      })

      const result = await create({
        id: 'videoId',
        source: 'youTube',
        videoId: YOUTUBE_ID
      })

      expect(result).toEqual({
        data: {
          campaignVideoBlockCreate: {
            id: 'videoId',
            pageId: 'landingPageId',
            regionId: null,
            parentBlockId: 'heroId',
            parentOrder: null,
            source: 'youTube',
            videoId: YOUTUBE_ID,
            videoVariantLanguageId: null,
            title: 'YouTube title',
            description: 'YouTube description',
            image: 'https://i.ytimg.com/vi/jQaN9DvFTbw/hqdefault.jpg',
            duration: 120,
            mediaVideo: {
              __typename: 'YouTube',
              id: YOUTUBE_ID,
              primaryLanguageId: null
            }
          }
        }
      })
      expect(prismaMock.campaignBlock.findFirst).toHaveBeenCalledWith({
        where: { id: 'heroId', campaignId: 'campaignId', deletedAt: null }
      })
      expect(prismaMock.campaignBlock.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          id: 'videoId',
          typename: 'CampaignVideoBlock',
          campaignId: 'campaignId',
          pageId: 'landingPageId',
          regionId: null,
          parentBlockId: 'heroId',
          parentOrder: null
        }),
        include: { action: true }
      })
      expect(
        prismaMock.campaignBlock.update.mock.calls.map(([call]: any) => call)
      ).toEqual([
        {
          where: { id: 'oldMediaId' },
          data: { deletedAt: expect.any(Date) }
        },
        { where: { id: 'heroId' }, data: { mediaBlockId: 'videoId' } }
      ])
      expect(prismaMock.campaign.update).toHaveBeenCalledWith({
        where: { id: 'campaignId' },
        data: { updatedAt: expect.any(Date) }
      })
      // Siblings are never read for an owned block.
      expect(prismaMock.campaignBlock.findMany).not.toHaveBeenCalled()
    })

    it('fills the Media Slot of a Featured Media section', async () => {
      prismaMock.campaignBlock.findFirst.mockResolvedValue({
        ...hero,
        id: 'featuredId',
        typename: 'CampaignFeaturedMediaBlock'
      })

      const result = await create({
        parentBlockId: 'featuredId',
        source: 'youTube',
        videoId: YOUTUBE_ID
      })

      expect(result.data.campaignVideoBlockCreate).toMatchObject({
        id: 'newVideoId',
        parentBlockId: 'featuredId',
        parentOrder: null
      })
      expect(prismaMock.campaignBlock.update).toHaveBeenCalledTimes(1)
      expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith({
        where: { id: 'featuredId' },
        data: { mediaBlockId: 'newVideoId' }
      })
    })

    it('refuses a section without a Media Slot (BAD_USER_INPUT, mediaBlockId)', async () => {
      // A Region Switcher hosts Extras but has no Media Slot (and is not a
      // carousel, so it does not take explicit video items either).
      prismaMock.campaignBlock.findFirst.mockResolvedValue(
        fixture.blocks.find((block) => block.id === 'landingSwitcherId')!
      )

      const result = await create({
        parentBlockId: 'landingSwitcherId',
        source: 'youTube',
        videoId: YOUTUBE_ID
      })

      expect(result.errors[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'mediaBlockId'
      })
      expect(fetchFieldsFromYouTube).not.toHaveBeenCalled()
      expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
    })

    it('refuses an Extra or a missing parent (BAD_USER_INPUT, parentBlockId)', async () => {
      prismaMock.campaignBlock.findFirst.mockResolvedValueOnce(
        fixture.blocks.find((block) => block.id === 'heroButtonId')!
      )
      const extra = await create({
        parentBlockId: 'heroButtonId',
        source: 'youTube',
        videoId: YOUTUBE_ID
      })
      expect(extra.errors[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'parentBlockId'
      })

      prismaMock.campaignBlock.findFirst.mockResolvedValueOnce(null)
      const missing = await create({
        parentBlockId: 'elsewhere',
        source: 'youTube',
        videoId: YOUTUBE_ID
      })
      expect(missing.errors[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'parentBlockId'
      })
      expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
    })
  })

  describe('the carousel item', () => {
    it('appends an explicit YouTube item as the next ordered child, without touching any Media Slot', async () => {
      prismaMock.campaignBlock.findFirst.mockResolvedValue(carousel)
      // One item already sits in the carousel, so the new one is order 1.
      prismaMock.campaignBlock.findMany.mockResolvedValue([
        { ...carousel, id: 'item0', parentBlockId: 'carouselId', parentOrder: 0 }
      ])

      const result = await create({
        parentBlockId: 'carouselId',
        source: 'youTube',
        videoId: YOUTUBE_ID
      })

      expect(result.data.campaignVideoBlockCreate).toMatchObject({
        id: 'newVideoId',
        parentBlockId: 'carouselId',
        parentOrder: 1,
        source: 'youTube',
        videoId: YOUTUBE_ID
      })
      expect(prismaMock.campaignBlock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            typename: 'CampaignVideoBlock',
            parentBlockId: 'carouselId',
            parentOrder: 1,
            pageId: 'landingPageId',
            regionId: null
          })
        })
      )
      // A carousel item is a child, not a Media Slot swap.
      expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
      expect(prismaMock.campaign.update).toHaveBeenCalledWith({
        where: { id: 'campaignId' },
        data: { updatedAt: expect.any(Date) }
      })
    })
  })

  describe('YouTube and Mux', () => {
    it('fetches a YouTube video’s title, description, poster and duration once at pick', async () => {
      await create({ source: 'youTube', videoId: YOUTUBE_ID })

      expect(fetchFieldsFromYouTube).toHaveBeenCalledTimes(1)
      expect(fetchFieldsFromYouTube).toHaveBeenCalledWith(YOUTUBE_ID)
      expect(createdData()).toMatchObject({
        source: 'youTube',
        videoId: YOUTUBE_ID,
        videoVariantLanguageId: null,
        title: 'YouTube title',
        description: 'YouTube description',
        image: 'https://i.ytimg.com/vi/jQaN9DvFTbw/hqdefault.jpg',
        duration: 120
      })
    })

    it('fetches a Mux video’s title, poster and duration once at pick, with no description', async () => {
      const result = await create({ source: 'mux', videoId: 'muxVideoId' })

      expect(fetchFieldsFromMux).toHaveBeenCalledTimes(1)
      expect(fetchFieldsFromMux).toHaveBeenCalledWith('muxVideoId')
      expect(result.data.campaignVideoBlockCreate).toMatchObject({
        source: 'mux',
        videoId: 'muxVideoId',
        videoVariantLanguageId: null,
        title: 'Mux title',
        description: null,
        image: 'https://image.mux.com/playbackId/thumbnail.png?time=1',
        duration: 90,
        mediaVideo: {
          __typename: 'MuxVideo',
          id: 'muxVideoId',
          primaryLanguageId: null
        }
      })
    })

    it('stores no poster or duration for a Mux video still processing', async () => {
      vi.mocked(fetchFieldsFromMux).mockResolvedValue({ title: 'Processing' })

      await create({ source: 'mux', videoId: 'muxVideoId' })

      expect(createdData()).toMatchObject({
        title: 'Processing',
        image: null,
        duration: null
      })
    })

    it('lets the overrides given at create win over the fetched text', async () => {
      const result = await create({
        source: 'youTube',
        videoId: YOUTUBE_ID,
        title: ' Our title ',
        description: 'Our description'
      })

      expect(result.data.campaignVideoBlockCreate).toMatchObject({
        title: 'Our title',
        description: 'Our description',
        image: 'https://i.ytimg.com/vi/jQaN9DvFTbw/hqdefault.jpg',
        duration: 120
      })
    })

    it.each([
      ['youTube', 'not-an-id', 'videoId must be a valid YouTube videoId'],
      ['youTube', undefined, 'videoId is required'],
      ['mux', undefined, 'videoId is required for mux source']
    ])(
      'validates a %s id %s with the VideoBlock zod schema (BAD_USER_INPUT, videoId)',
      async (source, videoId, message) => {
        const result = await create({ source, videoId })

        expect(result.errors[0]).toMatchObject({
          message,
          extensions: { code: 'BAD_USER_INPUT', field: 'videoId' }
        })
        expect(fetchFieldsFromYouTube).not.toHaveBeenCalled()
        expect(fetchFieldsFromMux).not.toHaveBeenCalled()
        expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
      }
    )

    it('rejects an empty Mux id (BAD_USER_INPUT, videoId)', async () => {
      const result = await create({ source: 'mux', videoId: '' })

      expect(result.errors[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'videoId'
      })
      expect(fetchFieldsFromMux).not.toHaveBeenCalled()
    })

    it('passes on NOT_FOUND for an id unknown to its service', async () => {
      vi.mocked(fetchFieldsFromYouTube).mockRejectedValue(
        new GraphQLError('videoId cannot be found on YouTube', {
          extensions: { code: 'NOT_FOUND' }
        })
      )

      const result = await create({ source: 'youTube', videoId: YOUTUBE_ID })

      expect(result.errors[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
      expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
    })

    it('refuses a url on a YouTube or Mux video (BAD_USER_INPUT, url)', async () => {
      const result = await create({
        source: 'youTube',
        videoId: YOUTUBE_ID,
        url: WATCH_URL
      })

      expect(result.errors[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'url'
      })
      expect(fetchFieldsFromYouTube).not.toHaveBeenCalled()
    })
  })

  describe('source', () => {
    it('takes internal, youTube and mux only (BAD_USER_INPUT, source)', async () => {
      const result = await create({ source: 'cloudflare', videoId: 'cfId' })

      expect(result.errors[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'source'
      })
      expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
    })
  })

  describe('a Watch video (internal)', () => {
    it('resolves a pasted Watch url through its variant slug and stores only the ids, in the campaign language', async () => {
      const result = await create({ source: 'internal', url: WATCH_URL })

      expect(fetchWatchVideoBySlug).toHaveBeenCalledWith('jesus/english')
      expect(result.data.campaignVideoBlockCreate).toMatchObject({
        source: 'internal',
        videoId: '1_jf-0-0',
        videoVariantLanguageId: '529',
        title: null,
        description: null,
        image: null,
        duration: null,
        mediaVideo: {
          __typename: 'Video',
          id: '1_jf-0-0',
          videoPrimaryLanguageId: '529'
        }
      })
      expect(createdData()).toMatchObject({
        typename: 'CampaignVideoBlock',
        source: 'internal',
        videoId: '1_jf-0-0',
        videoVariantLanguageId: '529',
        title: null,
        description: null,
        image: null,
        duration: null
      })
      expect(fetchFieldsFromYouTube).not.toHaveBeenCalled()
      expect(fetchFieldsFromMux).not.toHaveBeenCalled()
    })

    it('takes the variant language from the campaign’s default language', async () => {
      prismaMock.campaign.findUnique.mockResolvedValue(
        campaignFactory({ defaultLanguageId: '496' }).build()
      )

      await create({ source: 'internal', url: WATCH_URL })

      expect(createdData()).toMatchObject({ videoVariantLanguageId: '496' })
    })

    it('strips a container Watch url to the variant slug', async () => {
      await create({
        source: 'internal',
        url: 'https://www.jesusfilm.org/watch/easter.html/jesus/english.html'
      })

      expect(fetchWatchVideoBySlug).toHaveBeenCalledWith('jesus/english')
    })

    it('keeps title and description overrides on a Watch video', async () => {
      await create({
        source: 'internal',
        url: WATCH_URL,
        title: 'Our title',
        description: 'Our description'
      })

      expect(createdData()).toMatchObject({
        title: 'Our title',
        description: 'Our description'
      })
    })

    it('rejects a Watch url that does not resolve (BAD_USER_INPUT, url)', async () => {
      vi.mocked(fetchWatchVideoBySlug).mockResolvedValue(null)

      const result = await create({ source: 'internal', url: WATCH_URL })

      expect(result.errors[0]).toMatchObject({
        message: "That link isn't a Watch video",
        extensions: { code: 'BAD_USER_INPUT', field: 'url' }
      })
      expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
    })

    it.each([
      'https://www.jesusfilm.org/about',
      'https://www.jesusfilm.org/watch/jesus.html',
      'https://www.youtube.com/watch?v=jQaN9DvFTbw',
      'not a url'
    ])(
      'rejects %s, not a Watch url shape, without a gateway call (BAD_USER_INPUT, url)',
      async (url) => {
        const result = await create({ source: 'internal', url })

        expect(result.errors[0]).toMatchObject({
          message: "That link isn't a Watch video",
          extensions: { code: 'BAD_USER_INPUT', field: 'url' }
        })
        expect(fetchWatchVideoBySlug).not.toHaveBeenCalled()
        expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
      }
    )

    it('needs a url or a known Video id (BAD_USER_INPUT, url)', async () => {
      const result = await create({ source: 'internal' })

      expect(result.errors[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'url'
      })
    })
  })

  describe('overrides', () => {
    it.each([
      ['title', 200],
      ['description', 1000]
    ])(
      'caps %s at %i characters (BAD_USER_INPUT, the field)',
      async (field, max) => {
        const ok = await create({
          source: 'youTube',
          videoId: YOUTUBE_ID,
          [field]: 'x'.repeat(max)
        })
        expect(ok.errors).toBeUndefined()

        prismaMock.campaignBlock.create.mockClear()
        vi.mocked(fetchFieldsFromYouTube).mockClear()
        const result = await create({
          source: 'youTube',
          videoId: YOUTUBE_ID,
          [field]: 'x'.repeat(max + 1)
        })

        expect(result.errors[0].extensions).toMatchObject({
          code: 'BAD_USER_INPUT',
          field
        })
        expect(fetchFieldsFromYouTube).not.toHaveBeenCalled()
        expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
      }
    )
  })

  it('throws FORBIDDEN for a caller outside the team', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(
      campaignFactory({ userId: 'someoneElse' }).build()
    )

    const result = await create({ source: 'youTube', videoId: YOUTUBE_ID })

    expect(result.errors[0].extensions).toMatchObject({ code: 'FORBIDDEN' })
    expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
  })

  it('throws NOT_FOUND for an unknown campaign', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(null)

    const result = await create({
      campaignId: 'missing',
      source: 'youTube',
      videoId: YOUTUBE_ID
    })

    expect(result.errors[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
    expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
  })
})
