import { campaignBlockWithAcl } from '../../../../../test/campaignBlockFactory'
import {
  authClient,
  setupCampaignBlockSpec
} from '../../../../../test/campaignBlockSpec'
import {
  CampaignFixture,
  campaignFactory
} from '../../../../../test/campaignFactory'
import { prismaMock } from '../../../../../test/prismaMock'
import { graphql } from '../../../../lib/graphql/subgraphGraphql'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

describe('campaignColumnsBlockCreate', () => {
  const CREATE = graphql(`
    mutation CampaignColumnsBlockCreate(
      $input: CampaignColumnsBlockCreateInput!
    ) {
      campaignColumnsBlockCreate(input: $input) {
        id
        pageId
        parentBlockId
        parentOrder
        ratio
      }
    }
  `)

  let fixture: CampaignFixture

  beforeEach(() => {
    fixture = setupCampaignBlockSpec()
    const hero = campaignBlockWithAcl(fixture, 'heroId')
    prismaMock.campaignPage.findFirst.mockResolvedValue(fixture.pages[0])
    prismaMock.campaignBlock.findMany.mockResolvedValue(
      fixture.blocks.filter(
        (block) =>
          block.pageId === 'landingPageId' && block.parentBlockId == null
      )
    )
    prismaMock.campaignBlock.create.mockImplementation((async ({
      data
    }: any) => ({
      ...hero,
      action: null,
      ratio: null,
      ...data,
      id: data.id ?? 'newColumnsId'
    })) as never)
  })

  async function create(input: Record<string, unknown>): Promise<any> {
    return await authClient({
      document: CREATE,
      variables: {
        input: { campaignId: 'campaignId', pageId: 'landingPageId', ...input }
      }
    })
  }

  it('creates the section with exactly two empty slots at parentOrder 0 and 1 in one transaction', async () => {
    const result = await create({})

    expect(result).toEqual({
      data: {
        campaignColumnsBlockCreate: {
          id: 'newColumnsId',
          pageId: 'landingPageId',
          parentBlockId: null,
          parentOrder: 5,
          ratio: 'equal'
        }
      }
    })
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1)
    expect(prismaMock.campaignBlock.create).toHaveBeenCalledTimes(3)
    expect(prismaMock.campaignBlock.create).toHaveBeenNthCalledWith(1, {
      data: expect.objectContaining({
        typename: 'CampaignColumnsBlock',
        campaignId: 'campaignId',
        pageId: 'landingPageId',
        parentBlockId: null,
        parentOrder: 5,
        ratio: 'equal'
      }),
      include: { action: true }
    })
    for (const [index, parentOrder] of [0, 1].entries())
      expect(prismaMock.campaignBlock.create).toHaveBeenNthCalledWith(
        index + 2,
        {
          data: {
            typename: 'CampaignColumnBlock',
            campaignId: 'campaignId',
            pageId: 'landingPageId',
            regionId: null,
            parentBlockId: 'newColumnsId',
            parentOrder
          }
        }
      )
  })

  it.each(['equal', 'wideLeft', 'wideRight'])(
    'stores the ratio %s',
    async (ratio) => {
      await create({ ratio })

      expect(prismaMock.campaignBlock.create).toHaveBeenNthCalledWith(1, {
        data: expect.objectContaining({ ratio }),
        include: { action: true }
      })
    }
  )

  it('creates the slots under the ids the client chose', async () => {
    await create({ slotIds: ['leftId', 'rightId'] })

    expect(prismaMock.campaignBlock.create).toHaveBeenNthCalledWith(2, {
      data: expect.objectContaining({ id: 'leftId', parentOrder: 0 })
    })
    expect(prismaMock.campaignBlock.create).toHaveBeenNthCalledWith(3, {
      data: expect.objectContaining({ id: 'rightId', parentOrder: 1 })
    })
  })

  it.each([[['onlyOneId']], [['a', 'b', 'c']]])(
    'refuses slotIds that are not exactly two (BAD_USER_INPUT, slotIds): %j',
    async (slotIds) => {
      const result = await create({ slotIds })

      expect(result.errors[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'slotIds'
      })
    }
  )

  it('rejects a ratio outside the enum', async () => {
    const result = await create({ ratio: 'tall' })

    expect(result.errors).toBeDefined()
    expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
  })

  it('refuses to nest inside a column slot (BAD_USER_INPUT, parentBlockId)', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue({
      id: 'slotId',
      campaignId: 'campaignId',
      pageId: 'landingPageId',
      typename: 'CampaignColumnBlock'
    } as never)

    const result = await create({ parentBlockId: 'slotId' })

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'parentBlockId'
    })
    expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
  })

  it('throws FORBIDDEN for a caller outside the team', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(
      campaignFactory({ userId: 'someoneElse' }).build()
    )

    const result = await create({})

    expect(result.errors[0].extensions).toMatchObject({ code: 'FORBIDDEN' })
    expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
  })
})
