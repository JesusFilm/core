import { campaignBlockWithAcl } from '../../../../../test/campaignBlockAcl'
import {
  CampaignSpecResult,
  authClient,
  setupCampaignBlockSpec
} from '../../../../../test/campaignBlockSetup'
import { mockCampaignBlockWrites } from '../../../../../test/campaignBlockWrites'
import {
  CampaignFixture,
  campaignFactory
} from '../../../../../test/campaignFactory'
import { prismaMock } from '../../../../../test/prismaMock'
import { graphql } from '../../../../lib/graphql/subgraphGraphql'
import {
  fetchLanguage,
  fetchWatchVideoById,
  fetchWatchVideoBySlug
} from '../../gatewayClient'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

vi.mock('../../gatewayClient', async () => ({
  ...(await vi.importActual('../../gatewayClient')),
  fetchLanguage: vi.fn(),
  fetchWatchVideoBySlug: vi.fn(),
  fetchWatchVideoById: vi.fn()
}))

const WATCH_URL =
  'https://www.jesusfilm.org/watch/outreach-collection.html/english.html'

describe('campaignVideoCarouselBlockUpdate', () => {
  const UPDATE = graphql(`
    mutation CampaignVideoCarouselBlockUpdate(
      $id: ID!
      $input: CampaignVideoCarouselBlockUpdateInput!
    ) {
      campaignVideoCarouselBlockUpdate(id: $id, input: $input) {
        id
        eyebrow
        title
        videoId
        videoVariantLanguageId
      }
    }
  `)

  let fixture: CampaignFixture

  beforeEach(() => {
    fixture = setupCampaignBlockSpec()
    vi.mocked(fetchLanguage).mockResolvedValue({ id: '529', bcp47: 'en' })
    const block = campaignBlockWithAcl(fixture, 'carouselId')
    prismaMock.campaignBlock.findFirst.mockResolvedValue(block)
    mockCampaignBlockWrites(block)
  })

  async function update(
    input: Record<string, unknown>
  ): Promise<CampaignSpecResult<typeof UPDATE>> {
    return await authClient({
      document: UPDATE,
      variables: { id: 'carouselId', input }
    })
  }

  it.each([
    ['eyebrow', 80],
    ['title', 150]
  ])(
    'caps %s at %i characters (BAD_USER_INPUT, the field)',
    async (field, max) => {
      const ok = await update({ [field]: ' ' + 'x'.repeat(max) + ' ' })
      expect(ok.errors).toBeUndefined()
      expect(ok.data.campaignVideoCarouselBlockUpdate[field]).toBe(
        'x'.repeat(max)
      )

      const result = await update({ [field]: 'x'.repeat(max + 1) })

      expect(result.errors?.[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field
      })
    }
  )

  it('allows empty text', async () => {
    const field = 'title'
    const result = await update({ [field]: '' })

    expect(result.data.campaignVideoCarouselBlockUpdate[field]).toBe('')
  })

  it('throws NOT_FOUND when the id is not a live CampaignVideoCarouselBlock', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(fixture, 'heroButtonId')
    )

    const result = await update({ title: 'x' })

    expect(result.errors?.[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })

  it('throws FORBIDDEN for a caller outside the team', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(
        campaignFactory({ userId: 'someoneElse' }).build(),
        'carouselId'
      )
    )

    const result = await update({ title: 'x' })

    expect(result.errors?.[0].extensions).toMatchObject({ code: 'FORBIDDEN' })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })

  describe('Watch expansion', () => {
    it.each(['collection', 'series', 'featureFilm', 'shortFilm'])(
      'sets videoId and the campaign language from a pasted Watch URL naming no language, whatever the Video’s label (%s)',
      async (label) => {
        vi.mocked(fetchWatchVideoBySlug).mockResolvedValue({
          id: 'watchVideoId',
          label,
          childrenCount: 3,
          variant: null
        })

        const result = await update({ url: WATCH_URL })

        expect(result.errors).toBeUndefined()
        expect(fetchWatchVideoBySlug).toHaveBeenCalledWith(
          'outreach-collection/english'
        )
        expect(result.data.campaignVideoCarouselBlockUpdate).toMatchObject({
          videoId: 'watchVideoId',
          videoVariantLanguageId: fixture.defaultLanguageId
        })
        // The nullable id is the mode: the only columns written are the two ids.
        expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { id: 'carouselId' },
            data: {
              videoId: 'watchVideoId',
              videoVariantLanguageId: fixture.defaultLanguageId
            }
          })
        )
      }
    )

    it('remembers the language the pasted URL names', async () => {
      vi.mocked(fetchWatchVideoBySlug).mockResolvedValue({
        id: 'watchVideoId',
        label: 'collection',
        childrenCount: 3,
        variant: { language: { id: '21028' } }
      })

      const result = await update({ url: WATCH_URL })

      expect(result.data.campaignVideoCarouselBlockUpdate).toMatchObject({
        videoId: 'watchVideoId',
        videoVariantLanguageId: '21028'
      })
    })

    it('takes the given variant language over the URL’s', async () => {
      vi.mocked(fetchWatchVideoBySlug).mockResolvedValue({
        id: 'watchVideoId',
        label: 'collection',
        childrenCount: 3,
        variant: { language: { id: '21028' } }
      })

      const result = await update({
        url: WATCH_URL,
        videoVariantLanguageId: '496'
      })

      expect(result.data.campaignVideoCarouselBlockUpdate).toMatchObject({
        videoId: 'watchVideoId',
        videoVariantLanguageId: '496'
      })
    })

    it('refuses a variant language that is not an api-languages language (BAD_USER_INPUT, videoVariantLanguageId)', async () => {
      vi.mocked(fetchWatchVideoBySlug).mockResolvedValue({
        id: 'watchVideoId',
        label: 'collection',
        childrenCount: 3
      })
      vi.mocked(fetchWatchVideoById).mockResolvedValue({
        id: 'watchVideoId',
        label: 'series',
        childrenCount: 8
      })
      vi.mocked(fetchLanguage).mockResolvedValue(null)

      const withUrl = await update({
        url: WATCH_URL,
        videoVariantLanguageId: 'nope'
      })
      const withVideoId = await update({
        videoId: 'watchVideoId',
        videoVariantLanguageId: 'nope'
      })

      for (const result of [withUrl, withVideoId])
        expect(result.errors?.[0].extensions).toMatchObject({
          code: 'BAD_USER_INPUT',
          field: 'videoVariantLanguageId'
        })
      expect(fetchLanguage).toHaveBeenCalledWith('nope')
      expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
    })

    it('refuses a link that is not a Watch video (BAD_USER_INPUT, url)', async () => {
      vi.mocked(fetchWatchVideoBySlug).mockResolvedValue(null)

      const unresolved = await update({ url: WATCH_URL })
      const misshapen = await update({ url: 'https://example.com/film' })

      for (const result of [unresolved, misshapen])
        expect(result.errors?.[0]).toMatchObject({
          message: "That link isn't a Watch video",
          extensions: { code: 'BAD_USER_INPUT', field: 'url' }
        })
      expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
    })

    it('refuses url together with videoId (BAD_USER_INPUT, url)', async () => {
      const result = await update({ url: WATCH_URL, videoId: 'watchVideoId' })

      expect(result.errors?.[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'url'
      })
    })

    it('writes a known videoId back (what undo sends) after checking it is a published Watch video', async () => {
      vi.mocked(fetchWatchVideoById).mockResolvedValue({
        id: 'watchVideoId',
        label: 'series',
        childrenCount: 8
      })

      const result = await update({
        videoId: 'watchVideoId',
        videoVariantLanguageId: '529'
      })

      expect(fetchWatchVideoById).toHaveBeenCalledWith('watchVideoId')
      expect(result.data.campaignVideoCarouselBlockUpdate).toMatchObject({
        videoId: 'watchVideoId',
        videoVariantLanguageId: '529'
      })
    })

    it('refuses an unknown videoId (BAD_USER_INPUT, videoId)', async () => {
      vi.mocked(fetchWatchVideoById).mockResolvedValue(null)

      const result = await update({ videoId: 'missingId' })

      expect(result.errors?.[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'videoId'
      })
      expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
    })

    it('switches to explicit mode with videoId null, clearing both ids without a lookup', async () => {
      prismaMock.campaignBlock.findFirst.mockResolvedValue(
        campaignBlockWithAcl(fixture, 'carouselId', {
          videoId: 'watchVideoId',
          videoVariantLanguageId: '529'
        })
      )

      const result = await update({ videoId: null })

      expect(result.errors).toBeUndefined()
      expect(result.data.campaignVideoCarouselBlockUpdate).toMatchObject({
        videoId: null,
        videoVariantLanguageId: null
      })
      expect(fetchWatchVideoById).not.toHaveBeenCalled()
    })

    it('leaves the mode alone when neither is given', async () => {
      await update({ title: 'Films' })

      expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { title: 'Films' } })
      )
    })

    it('refuses videoVariantLanguageId on its own (BAD_USER_INPUT, videoVariantLanguageId)', async () => {
      const result = await update({ videoVariantLanguageId: '529' })

      expect(result.errors?.[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'videoVariantLanguageId'
      })
    })
  })
})
