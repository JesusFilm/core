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

describe('campaignBlockDelete', () => {
  const DELETE = graphql(`
    mutation CampaignBlockDelete($id: ID!) {
      campaignBlockDelete(id: $id) {
        id
        parentOrder
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

  async function remove(id: string): Promise<any> {
    return await authClient({ document: DELETE, variables: { id } })
  }

  it('stamps deletedAt and returns the remaining siblings renumbered contiguously', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(fixture, 'footerTermsId')
    )
    prismaMock.campaignBlock.findMany.mockResolvedValue(
      fixture.blocks.filter(
        (block) =>
          block.parentBlockId === 'footerId' && block.id !== 'footerTermsId'
      )
    )

    const result = await remove('footerTermsId')

    expect(result).toEqual({
      data: {
        campaignBlockDelete: [
          { id: 'footerCopyrightId', parentOrder: 0 },
          { id: 'footerPrivacyId', parentOrder: 1 }
        ]
      }
    })
    expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith({
      where: { id: 'footerTermsId' },
      data: { deletedAt: expect.any(Date) }
    })
    expect(prismaMock.campaignBlock.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          parentBlockId: 'footerId',
          deletedAt: null
        })
      })
    )
    expect(prismaMock.campaign.update).toHaveBeenCalledWith({
      where: { id: 'campaignId' },
      data: { updatedAt: expect.any(Date) }
    })
  })

  it.each(['headerId', 'footerId'])(
    'refuses to delete the chrome block %s (CONFLICT, id)',
    async (id) => {
      prismaMock.campaignBlock.findFirst.mockResolvedValue(
        campaignBlockWithAcl(fixture, id)
      )

      const result = await remove(id)

      expect(result.errors[0].extensions).toMatchObject({
        code: 'CONFLICT',
        field: 'id'
      })
      expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
    }
  )

  it('throws NOT_FOUND for a block that is already deleted or unknown', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(null)

    const result = await remove('gone')

    expect(result.errors[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
  })

  it('throws FORBIDDEN for a caller outside the team', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(
        campaignFactory({ userId: 'someoneElse' }).build(),
        'footerTermsId'
      )
    )

    const result = await remove('footerTermsId')

    expect(result.errors[0].extensions).toMatchObject({ code: 'FORBIDDEN' })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })

  it('soft-deletes a section, renumbers the page’s sections and leaves its children to fall out of the tree', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(fixture, 'landingSwitcherId')
    )
    prismaMock.campaignBlock.findMany.mockResolvedValue(
      fixture.blocks.filter(
        (block) =>
          block.pageId === 'landingPageId' &&
          block.parentBlockId == null &&
          block.id !== 'landingSwitcherId'
      )
    )

    const result = await remove('landingSwitcherId')

    expect(result.data.campaignBlockDelete).toEqual([
      { id: 'heroId', parentOrder: 0 },
      { id: 'carouselId', parentOrder: 1 },
      { id: 'landingJourneyListId', parentOrder: 2 },
      { id: 'landingAnalyticsId', parentOrder: 3 }
    ])
    expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith({
      where: { id: 'landingSwitcherId' },
      data: { deletedAt: expect.any(Date) }
    })
    // Only the section row is stamped; a child keeps its row untouched for restore.
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'heroButtonId' } })
    )
    expect(prismaMock.campaignBlock.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          parentBlockId: null,
          pageId: 'landingPageId',
          regionId: null
        })
      })
    )
  })

  it('refuses to delete a column slot (CONFLICT, id)', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(fixture, 'heroId', {
        id: 'slotId',
        typename: 'CampaignColumnBlock'
      })
    )

    const result = await remove('slotId')

    expect(result.errors[0].extensions).toMatchObject({
      code: 'CONFLICT',
      field: 'id'
    })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })

  it.each(['landingPageId', 'regionPageId'])(
    'refuses to delete the page %s (CONFLICT, id)',
    async (id) => {
      prismaMock.campaignBlock.findFirst.mockResolvedValue(null)
      const { team, languages, theme, pages, blocks, regions, strings, ...row } =
        fixture
      prismaMock.campaignPage.findUnique.mockResolvedValue({
        ...pages.find((page) => page.id === id)!,
        campaign: { ...row, team }
      } as never)

      const result = await remove(id)

      expect(result.errors[0].extensions).toMatchObject({
        code: 'CONFLICT',
        field: 'id'
      })
      expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
    }
  )
})
