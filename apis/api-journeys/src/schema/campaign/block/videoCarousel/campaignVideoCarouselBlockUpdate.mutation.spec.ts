import { campaignBlockWithAcl } from '../../../../../test/campaignBlockFactory'
import {
  authClient,
  setupCampaignBlockSpec
} from '../../../../../test/campaignBlockSpec'
import { CampaignFixture } from '../../../../../test/campaignFactory'
import { prismaMock } from '../../../../../test/prismaMock'
import { graphql } from '../../../../lib/graphql/subgraphGraphql'
import { fetchWatchVideoBySlug } from '../../gatewayClient'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

vi.mock('../../gatewayClient', async () => ({
  ...(await vi.importActual('../../gatewayClient')),
  fetchWatchVideoBySlug: vi.fn()
}))

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
    const block = campaignBlockWithAcl(fixture, 'carouselId')
    prismaMock.campaignBlock.findFirst.mockResolvedValue(block)
    prismaMock.campaignBlock.update.mockImplementation((async ({
      data
    }: any) => ({ ...block, ...data })) as never)
  })

  async function update(input: Record<string, unknown>): Promise<any> {
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

      expect(result.errors[0].extensions).toMatchObject({
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

    expect(result.errors[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })

  describe('Watch expansion', () => {
    const WATCH_URL = 'https://www.jesusfilm.org/watch/jesus.html/english.html'

    beforeEach(() => {
      vi.mocked(fetchWatchVideoBySlug).mockResolvedValue({
        id: '1_jf-0-0',
        label: 'featureFilm',
        childrenCount: 61
      })
    })

    it('stores the resolved video id and the campaign default language from a Watch url', async () => {
      prismaMock.campaign.findUnique.mockResolvedValue({
        defaultLanguageId: '529'
      } as never)

      const result = await update({ url: WATCH_URL })

      expect(result.errors).toBeUndefined()
      expect(result.data.campaignVideoCarouselBlockUpdate).toMatchObject({
        videoId: '1_jf-0-0',
        videoVariantLanguageId: '529'
      })
      expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            videoId: '1_jf-0-0',
            videoVariantLanguageId: '529'
          })
        })
      )
    })

    it('is NOT_FOUND when the Watch url resolves to no published Video', async () => {
      vi.mocked(fetchWatchVideoBySlug).mockResolvedValue(null)

      const result = await update({ url: 'https://nope.example.org/watch/x' })

      expect(result.errors[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'url'
      })
      expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
    })

    it('is BAD_USER_INPUT (videoId) when a url is given with a videoId', async () => {
      const result = await update({ url: WATCH_URL, videoId: '1_jf-0-0' })

      expect(result.errors[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'videoId'
      })
      expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
    })

    it('stores a known videoId with its variant language', async () => {
      const result = await update({
        videoId: '1_jf-0-0',
        videoVariantLanguageId: '496'
      })

      expect(result.errors).toBeUndefined()
      expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            videoId: '1_jf-0-0',
            videoVariantLanguageId: '496'
          })
        })
      )
    })

    it('switches to explicit items when videoId is null, clearing the variant language', async () => {
      const result = await update({ videoId: null })

      expect(result.errors).toBeUndefined()
      expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            videoId: null,
            videoVariantLanguageId: null
          })
        })
      )
    })

    it('leaves the mode alone when no video field is given', async () => {
      const result = await update({ title: 'New title' })

      expect(result.errors).toBeUndefined()
      const data = (
        prismaMock.campaignBlock.update.mock.calls[0][0] as {
          data: Record<string, unknown>
        }
      ).data
      expect(data.videoId).toBeUndefined()
      expect(data.videoVariantLanguageId).toBeUndefined()
    })
  })
})
