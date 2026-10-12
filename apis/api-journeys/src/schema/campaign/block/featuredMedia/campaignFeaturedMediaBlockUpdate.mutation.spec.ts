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

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

const FEATURED_MEDIA: Partial<CampaignBlockRow> = {
  id: 'featuredId',
  typename: 'CampaignFeaturedMediaBlock',
  parentOrder: 5,
  eyebrow: 'Watch',
  title: 'The story of Jesus',
  lede: null,
  bullets: 'Two hours long\nFree to share',
  bulletsTranslations: {
    '496': { value: 'Deux heures\nGratuit', source: 'human' }
  },
  mediaSide: 'right',
  mediaBlockId: 'currentMediaId'
}

describe('campaignFeaturedMediaBlockUpdate', () => {
  const UPDATE = graphql(`
    mutation CampaignFeaturedMediaBlockUpdate(
      $id: ID!
      $input: CampaignFeaturedMediaBlockUpdateInput!
    ) {
      campaignFeaturedMediaBlockUpdate(id: $id, input: $input) {
        id
        eyebrow
        title
        lede
        bullets
        bulletsTranslations {
          languageId
          value
        }
        mediaSide
        mediaBlockId
        backgroundKind
        backgroundOverlay
        coverBlockId
        textColor
      }
    }
  `)

  let fixture: CampaignFixture
  let featuredMedia: ReturnType<typeof campaignBlockWithAcl>

  beforeEach(() => {
    fixture = setupCampaignBlockSpec()
    featuredMedia = campaignBlockWithAcl(fixture, 'heroId', FEATURED_MEDIA)
    prismaMock.campaignBlock.findFirst.mockResolvedValue(featuredMedia)
    prismaMock.campaignBlock.update.mockImplementation((async ({
      data
    }: any) => ({ ...featuredMedia, ...data })) as never)
  })

  async function update(
    input: Record<string, unknown>,
    id = 'featuredId'
  ): Promise<any> {
    return await authClient({ document: UPDATE, variables: { id, input } })
  }

  it('writes the given trimmed text fields, keeping multi-line bullets and the translations untouched', async () => {
    const result = await update({
      title: ' Watch the film ',
      bullets: 'One\nTwo\n\nThree',
      lede: ''
    })

    expect(result.data.campaignFeaturedMediaBlockUpdate).toMatchObject({
      eyebrow: 'Watch',
      title: 'Watch the film',
      lede: '',
      bullets: 'One\nTwo\n\nThree',
      bulletsTranslations: [
        { languageId: '496', value: 'Deux heures\nGratuit' }
      ]
    })
    expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith({
      where: { id: 'featuredId' },
      data: { title: 'Watch the film', bullets: 'One\nTwo\n\nThree', lede: '' },
      include: { action: true }
    })
    expect(prismaMock.campaign.update).toHaveBeenCalledWith({
      where: { id: 'campaignId' },
      data: { updatedAt: expect.any(Date) }
    })
  })

  it.each([
    ['eyebrow', 80],
    ['title', 150],
    ['lede', 500],
    ['bullets', 1000]
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

  it('moves the media to the left or right', async () => {
    const result = await update({ mediaSide: 'left' })

    expect(result.data.campaignFeaturedMediaBlockUpdate.mediaSide).toBe('left')
    expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith({
      where: { id: 'featuredId' },
      data: { mediaSide: 'left' },
      include: { action: true }
    })
  })

  it('refuses a null mediaSide, which is never null (BAD_USER_INPUT, mediaSide)', async () => {
    const result = await update({ mediaSide: null })

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'mediaSide'
    })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })

  it('reads a row without a stored mediaSide as right', async () => {
    featuredMedia = campaignBlockWithAcl(fixture, 'heroId', {
      ...FEATURED_MEDIA,
      mediaSide: null
    })
    prismaMock.campaignBlock.findFirst.mockResolvedValue(featuredMedia)

    const result = await update({ title: 'x' })

    expect(result.data.campaignFeaturedMediaBlockUpdate.mediaSide).toBe('right')
  })

  describe('mediaBlockId', () => {
    it('swaps the Media Slot to a block the section owns: the held block soft-deleted, the new one restored, in one transaction', async () => {
      prismaMock.campaignBlock.findFirst
        .mockResolvedValueOnce(featuredMedia)
        .mockResolvedValueOnce({
          id: 'previousMediaId',
          typename: 'CampaignImageBlock'
        } as never)

      const result = await update({ mediaBlockId: 'previousMediaId' })

      expect(result.data.campaignFeaturedMediaBlockUpdate.mediaBlockId).toBe(
        'previousMediaId'
      )
      expect(prismaMock.campaignBlock.findFirst).toHaveBeenLastCalledWith({
        where: {
          id: 'previousMediaId',
          campaignId: 'campaignId',
          parentBlockId: 'featuredId'
        },
        select: { id: true, typename: true }
      })
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1)
      expect(
        prismaMock.campaignBlock.update.mock.calls.map(([call]: any) => call)
      ).toEqual([
        {
          where: { id: 'currentMediaId' },
          data: { deletedAt: expect.any(Date) }
        },
        { where: { id: 'previousMediaId' }, data: { deletedAt: null } },
        {
          where: { id: 'featuredId' },
          data: { mediaBlockId: 'previousMediaId' },
          include: { action: true }
        }
      ])
    })

    it('empties the slot with null, soft-deleting the held block without a lookup', async () => {
      const result = await update({ mediaBlockId: null })

      expect(
        result.data.campaignFeaturedMediaBlockUpdate.mediaBlockId
      ).toBeNull()
      expect(prismaMock.campaignBlock.findFirst).toHaveBeenCalledTimes(1)
      expect(
        prismaMock.campaignBlock.update.mock.calls.map(([call]: any) => call)
      ).toEqual([
        {
          where: { id: 'currentMediaId' },
          data: { deletedAt: expect.any(Date) }
        },
        {
          where: { id: 'featuredId' },
          data: { mediaBlockId: null },
          include: { action: true }
        }
      ])
    })

    it('rejects a block the section does not own or that is not a video or image (BAD_USER_INPUT, mediaBlockId)', async () => {
      prismaMock.campaignBlock.findFirst
        .mockResolvedValueOnce(featuredMedia)
        .mockResolvedValueOnce({
          id: 'buttonId',
          typename: 'CampaignButtonBlock'
        } as never)
      const extra = await update({ mediaBlockId: 'buttonId' })
      expect(extra.errors[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'mediaBlockId'
      })

      prismaMock.campaignBlock.findFirst
        .mockResolvedValueOnce(featuredMedia)
        .mockResolvedValueOnce(null)
      const elsewhere = await update({ mediaBlockId: 'otherSectionMediaId' })
      expect(elsewhere.errors[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'mediaBlockId'
      })
      expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
    })
  })

  it('accepts the shared section fields through the shared helper', async () => {
    const result = await update({
      backgroundKind: 'contrast',
      backgroundOverlay: 'light',
      textColor: ' #abc '
    })

    expect(result.data.campaignFeaturedMediaBlockUpdate).toMatchObject({
      backgroundKind: 'contrast',
      backgroundOverlay: 'light',
      textColor: '#AABBCC'
    })
  })

  it('rejects a cover that is not a live image block (BAD_USER_INPUT, coverBlockId)', async () => {
    prismaMock.campaignBlock.findFirst
      .mockResolvedValueOnce(featuredMedia)
      .mockResolvedValueOnce(null)

    const result = await update({ coverBlockId: 'notAnImageId' })

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'coverBlockId'
    })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })

  it('throws NOT_FOUND when the live block is another typename', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(fixture, 'heroId')
    )

    const result = await update({ title: 'x' }, 'heroId')

    expect(result.errors[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })

  it('throws FORBIDDEN for a caller outside the team', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(
        campaignFactory({ userId: 'someoneElse' }).build(),
        'heroId',
        FEATURED_MEDIA
      )
    )

    const result = await update({ title: 'x' })

    expect(result.errors[0].extensions).toMatchObject({ code: 'FORBIDDEN' })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })
})
