import { campaignBlockWithAcl } from '../../../../test/campaignBlockFactory'
import {
  authClient,
  setupCampaignBlockSpec
} from '../../../../test/campaignBlockSpec'
import {
  CampaignFixture,
  campaignFactory
} from '../../../../test/campaignFactory'
import { prismaMock } from '../../../../test/prismaMock'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

describe('campaignBlockRestore', () => {
  const RESTORE = graphql(`
    mutation CampaignBlockRestore($id: ID!) {
      campaignBlockRestore(id: $id) {
        id
        parentOrder
        ... on CampaignButtonBlock {
          label
        }
      }
    }
  `)

  let fixture: CampaignFixture

  beforeEach(() => {
    fixture = setupCampaignBlockSpec()
    prismaMock.campaignBlock.update.mockImplementation((async ({
      where,
      data
    }: any) => ({
      ...fixture.blocks.find((block) => block.id === where.id),
      ...data
    })) as never)
  })

  async function restore(id: string): Promise<any> {
    return await authClient({ document: RESTORE, variables: { id } })
  }

  it('clears deletedAt and re-inserts the block at its parentOrder, renumbering the siblings', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(fixture, 'footerTermsId', {
        deletedAt: new Date()
      })
    )
    const others = fixture.blocks
      .filter(
        (block) =>
          block.parentBlockId === 'footerId' && block.id !== 'footerTermsId'
      )
      .map((block, parentOrder) => ({ ...block, parentOrder }))
    prismaMock.campaignBlock.findMany
      .mockResolvedValueOnce(others)
      .mockResolvedValueOnce([])

    const result = await restore('footerTermsId')

    expect(result).toEqual({
      data: {
        campaignBlockRestore: [
          { id: 'footerCopyrightId', parentOrder: 0 },
          { id: 'footerTermsId', parentOrder: 1, label: 'Terms of Use' },
          { id: 'footerPrivacyId', parentOrder: 2, label: 'Your Privacy' }
        ]
      }
    })
    expect(prismaMock.campaignBlock.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'footerTermsId' } })
    )
    expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith({
      where: { id: 'footerTermsId' },
      data: { deletedAt: null },
      include: { action: true }
    })
    expect(prismaMock.campaignBlock.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          parentBlockId: 'footerId',
          id: { not: 'footerTermsId' }
        })
      })
    )
  })

  describe('a block binned from a column slot', () => {
    const slot = { id: 'slotId', typename: 'CampaignColumnBlock' }

    beforeEach(() => {
      prismaMock.campaignBlock.findFirst.mockResolvedValue(
        campaignBlockWithAcl(fixture, 'heroId', {
          id: 'slotHeroId',
          parentBlockId: 'slotId',
          parentOrder: 0,
          deletedAt: new Date()
        })
      )
      prismaMock.campaignBlock.findUnique.mockResolvedValue(slot as never)
    })

    it('is refused while the slot holds another section (CONFLICT, id)', async () => {
      prismaMock.campaignBlock.findMany.mockResolvedValueOnce([
        { ...fixture.blocks[0], id: 'otherId', parentBlockId: 'slotId' }
      ])

      const result = await restore('slotHeroId')

      expect(result.errors[0].extensions).toMatchObject({
        code: 'CONFLICT',
        field: 'id'
      })
      expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
    })

    it('comes back when the slot is empty', async () => {
      prismaMock.campaignBlock.findMany.mockResolvedValue([])
      prismaMock.campaignBlock.update.mockResolvedValue({
        ...fixture.blocks[0],
        id: 'slotHeroId',
        parentBlockId: 'slotId',
        parentOrder: 0,
        deletedAt: null
      } as never)

      const result = await restore('slotHeroId')

      expect(result.data.campaignBlockRestore).toEqual([
        { id: 'slotHeroId', parentOrder: 0 }
      ])
    })
  })

  it('throws NOT_FOUND for an unknown id', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(null)

    const result = await restore('gone')

    expect(result.errors[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
  })

  it('throws FORBIDDEN for a caller outside the team', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(
        campaignFactory({ userId: 'someoneElse' }).build(),
        'footerTermsId',
        { deletedAt: new Date() }
      )
    )

    const result = await restore('footerTermsId')

    expect(result.errors[0].extensions).toMatchObject({ code: 'FORBIDDEN' })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })
})
