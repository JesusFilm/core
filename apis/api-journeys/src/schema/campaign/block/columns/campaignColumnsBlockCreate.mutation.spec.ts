import { Prisma } from '@core/prisma/journeys/client'

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

const LEFT_SLOT_ID = 'd4c11dcb-4ff3-4bd6-849e-817bae5d3f17'
const RIGHT_SLOT_ID = 'e09e15db-3ec7-44a2-9772-dc143d3f14cd'

function idTaken(): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
    code: 'P2002',
    clientVersion: 'test',
    meta: {
      driverAdapterError: {
        cause: {
          kind: 'UniqueConstraintViolation',
          constraint: { fields: ['id'] }
        }
      }
    }
  })
}

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
      ratio: 'equal',
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
        parentOrder: 5
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
    await create({ slotIds: [LEFT_SLOT_ID, RIGHT_SLOT_ID] })

    expect(prismaMock.campaignBlock.create).toHaveBeenNthCalledWith(2, {
      data: expect.objectContaining({ id: LEFT_SLOT_ID, parentOrder: 0 })
    })
    expect(prismaMock.campaignBlock.create).toHaveBeenNthCalledWith(3, {
      data: expect.objectContaining({ id: RIGHT_SLOT_ID, parentOrder: 1 })
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

    expect(result.errors[0].message).toContain(
      'Value "tall" does not exist in "CampaignColumnsRatio" enum'
    )
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

  describe('the client-chosen ids', () => {
    const SECTION_ID = '5a1d2c3b-4e5f-4a6b-8c7d-9e0f1a2b3c4d'

    it('refuses the same slot id twice (BAD_USER_INPUT, slotIds)', async () => {
      const result = await create({ slotIds: [LEFT_SLOT_ID, LEFT_SLOT_ID] })

      expect(result.errors[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'slotIds'
      })
      expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
    })

    it('refuses a slot id equal to the section id (BAD_USER_INPUT, slotIds)', async () => {
      const result = await create({
        id: SECTION_ID,
        slotIds: [SECTION_ID, RIGHT_SLOT_ID]
      })

      expect(result.errors[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'slotIds'
      })
      expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
    })

    it('refuses a slot id that is not a UUID (BAD_USER_INPUT, slotIds)', async () => {
      const result = await create({ slotIds: [LEFT_SLOT_ID, 'rightId'] })

      expect(result.errors[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'slotIds'
      })
    })

    it('names slotIds when the taken id is a slot’s', async () => {
      const insert = prismaMock.campaignBlock.create.getMockImplementation()
      prismaMock.campaignBlock.create.mockImplementation((async (args: any) => {
        if (args.data.id === RIGHT_SLOT_ID) throw idTaken()
        return await insert?.(args)
      }) as never)
      prismaMock.campaignBlock.findMany.mockImplementation((async (
        args: any
      ) =>
        args?.where?.id?.in != null
          ? [{ id: RIGHT_SLOT_ID }]
          : fixture.blocks.filter(
              (block) =>
                block.pageId === 'landingPageId' && block.parentBlockId == null
            )) as never)

      const result = await create({
        id: SECTION_ID,
        slotIds: [LEFT_SLOT_ID, RIGHT_SLOT_ID]
      })

      expect(result.errors[0]).toMatchObject({
        message: 'slotIds is already taken',
        extensions: { code: 'BAD_USER_INPUT', field: 'slotIds' }
      })
    })
  })
})
