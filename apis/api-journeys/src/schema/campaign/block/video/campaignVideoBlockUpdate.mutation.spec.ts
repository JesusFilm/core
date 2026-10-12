import { campaignBlockWithAcl } from '../../../../../test/campaignBlockFactory'
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

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

vi.mock('../../../block/video/service', async () => ({
  ...(await vi.importActual('../../../block/video/service')),
  fetchFieldsFromYouTube: vi.fn(),
  fetchFieldsFromMux: vi.fn()
}))

const YOUTUBE_ID = 'jQaN9DvFTbw'

const WATCH_VIDEO: Partial<CampaignBlockRow> = {
  id: 'heroMediaId',
  typename: 'CampaignVideoBlock',
  parentBlockId: 'heroId',
  parentOrder: null,
  eyebrow: null,
  lede: null,
  source: 'internal',
  videoId: '1_jf-0-0',
  videoVariantLanguageId: '529',
  title: 'Our title',
  titleTranslations: { '496': { value: 'Notre titre', source: 'human' } },
  description: 'Our description'
}

describe('campaignVideoBlockUpdate', () => {
  const UPDATE = graphql(`
    mutation CampaignVideoBlockUpdate(
      $id: ID!
      $input: CampaignVideoBlockUpdateInput!
    ) {
      campaignVideoBlockUpdate(id: $id, input: $input) {
        id
        source
        videoId
        title
        titleTranslations {
          languageId
          value
        }
        description
        image
        duration
      }
    }
  `)

  let fixture: CampaignFixture

  function videoBlock(overrides: Partial<CampaignBlockRow> = {}): void {
    const video = campaignBlockWithAcl(fixture, 'heroId', {
      ...WATCH_VIDEO,
      ...overrides
    })
    prismaMock.campaignBlock.findFirst.mockResolvedValue(video)
    prismaMock.campaignBlock.update.mockImplementation((async ({
      data
    }: any) => ({ ...video, ...data })) as never)
  }

  beforeEach(() => {
    fixture = setupCampaignBlockSpec()
    videoBlock()
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
  })

  async function update(
    input: Record<string, unknown>,
    id = 'heroMediaId'
  ): Promise<any> {
    return await authClient({ document: UPDATE, variables: { id, input } })
  }

  it('writes the given trimmed overrides, leaving translations and the rest untouched', async () => {
    const result = await update({ title: ' New title ' })

    expect(result.data.campaignVideoBlockUpdate).toMatchObject({
      title: 'New title',
      titleTranslations: [{ languageId: '496', value: 'Notre titre' }],
      description: 'Our description'
    })
    expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith({
      where: { id: 'heroMediaId' },
      data: { title: 'New title' },
      include: { action: true }
    })
    expect(fetchFieldsFromYouTube).not.toHaveBeenCalled()
    expect(fetchFieldsFromMux).not.toHaveBeenCalled()
    expect(prismaMock.campaign.update).toHaveBeenCalledWith({
      where: { id: 'campaignId' },
      data: { updatedAt: expect.any(Date) }
    })
  })

  it.each([
    ['title', 200],
    ['description', 1000]
  ])(
    'caps %s at %i characters (BAD_USER_INPUT, the field)',
    async (field, max) => {
      const ok = await update({ [field]: 'x'.repeat(max) })
      expect(ok.errors).toBeUndefined()

      prismaMock.campaignBlock.update.mockClear()
      const result = await update({ [field]: 'x'.repeat(max + 1) })

      expect(result.errors[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field
      })
      expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
    }
  )

  it('clears a Watch video’s overrides on null or empty, its text being read live', async () => {
    const result = await update({ title: null, description: '' })

    expect(result.data.campaignVideoBlockUpdate).toMatchObject({
      title: null,
      description: null
    })
    expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith({
      where: { id: 'heroMediaId' },
      data: { title: null, description: null },
      include: { action: true }
    })
    expect(fetchFieldsFromYouTube).not.toHaveBeenCalled()
    expect(fetchFieldsFromMux).not.toHaveBeenCalled()
  })

  it('re-reads a YouTube video’s source text when an override is set back to null', async () => {
    videoBlock({ source: 'youTube', videoId: YOUTUBE_ID })

    const result = await update({ title: null, description: null })

    expect(fetchFieldsFromYouTube).toHaveBeenCalledTimes(1)
    expect(fetchFieldsFromYouTube).toHaveBeenCalledWith(YOUTUBE_ID)
    expect(result.data.campaignVideoBlockUpdate).toMatchObject({
      title: 'YouTube title',
      description: 'YouTube description'
    })
    expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith({
      where: { id: 'heroMediaId' },
      data: { title: 'YouTube title', description: 'YouTube description' },
      include: { action: true }
    })
  })

  it('re-reads only the field set back to null, keeping the other override', async () => {
    videoBlock({ source: 'youTube', videoId: YOUTUBE_ID })

    await update({ title: null, description: 'Kept' })

    expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith({
      where: { id: 'heroMediaId' },
      data: { title: 'YouTube title', description: 'Kept' },
      include: { action: true }
    })
  })

  it('re-reads a Mux video’s title, which has no description, when set back to null', async () => {
    videoBlock({ source: 'mux', videoId: 'muxVideoId' })

    const result = await update({ title: null, description: null })

    expect(fetchFieldsFromMux).toHaveBeenCalledWith('muxVideoId')
    expect(result.data.campaignVideoBlockUpdate).toMatchObject({
      title: 'Mux title',
      description: null
    })
  })

  it('throws NOT_FOUND when the live block is another typename', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(fixture, 'heroId')
    )

    const result = await update({ title: 'x' }, 'heroId')

    expect(result.errors[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })

  it('requires campaign Update: FORBIDDEN for a caller outside the team', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(
        campaignFactory({ userId: 'someoneElse' }).build(),
        'heroId',
        WATCH_VIDEO
      )
    )

    const result = await update({ title: 'x' })

    expect(result.errors[0].extensions).toMatchObject({ code: 'FORBIDDEN' })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })
})
