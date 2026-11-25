import { Prisma } from '@core/prisma/journeys/client'

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

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

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

describe('campaignButtonBlockCreate', () => {
  const CREATE = graphql(`
    mutation CampaignButtonBlockCreate(
      $input: CampaignButtonBlockCreateInput!
    ) {
      campaignButtonBlockCreate(input: $input) {
        id
        parentBlockId
        parentOrder
        pageId
        label
        variant
        size
        align
        color
        labelColor
        placement
        action {
          parentBlockId
        }
      }
    }
  `)

  let fixture: CampaignFixture

  beforeEach(() => {
    fixture = setupCampaignBlockSpec()
    const header = fixture.blocks.find((block) => block.id === 'headerId')!
    prismaMock.campaignBlock.findFirst.mockResolvedValue(header)
    // The siblings query excludes owned blocks (the header logo has parentOrder null).
    prismaMock.campaignBlock.findMany.mockResolvedValue(
      fixture.blocks.filter(
        (block) =>
          block.parentBlockId === 'headerId' && block.parentOrder != null
      )
    )
    mockCampaignBlockWrites(campaignBlockWithAcl(fixture, 'navHomeId'), {
      createdId: 'newButtonId'
    })
  })

  async function create(
    input: Record<string, unknown>
  ): Promise<CampaignSpecResult<typeof CREATE>> {
    return await authClient({
      document: CREATE,
      variables: {
        input: { campaignId: 'campaignId', parentBlockId: 'headerId', ...input }
      }
    })
  }

  it('creates a "Button" Extra with no action, last among the chrome’s children', async () => {
    const result = await create({})

    expect(result).toEqual({
      data: {
        campaignButtonBlockCreate: {
          id: 'newButtonId',
          parentBlockId: 'headerId',
          parentOrder: 2,
          pageId: null,
          label: 'Button',
          variant: null,
          size: null,
          align: null,
          color: null,
          labelColor: null,
          placement: 'below',
          action: null
        }
      }
    })
    expect(prismaMock.campaignAction.create).not.toHaveBeenCalled()
  })

  it('validates and normalises every given column', async () => {
    const result = await create({
      label: ' Learn more ',
      variant: 'outlined',
      size: 'large',
      align: 'right',
      color: '#fff',
      labelColor: '#123456',
      placement: 'above'
    })

    expect(result.data.campaignButtonBlockCreate).toMatchObject({
      label: 'Learn more',
      variant: 'outlined',
      size: 'large',
      align: 'right',
      color: '#FFFFFF',
      labelColor: '#123456',
      placement: 'above'
    })
  })

  it('caps the label at 60 characters (BAD_USER_INPUT, label)', async () => {
    const result = await create({ label: 'x'.repeat(61) })

    expect(result.errors?.[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'label'
    })
    expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
  })

  it.each(['color', 'labelColor'])(
    'rejects a non-hex %s (BAD_USER_INPUT, the column)',
    async (field) => {
      const result = await create({ [field]: 'rgb(1,2,3)' })

      expect(result.errors?.[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field
      })
    }
  )

  it('rejects an Extra as the parent (BAD_USER_INPUT, parentBlockId)', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      fixture.blocks.find((block) => block.id === 'navHomeId') ?? null
    )

    const result = await create({ parentBlockId: 'navHomeId' })

    expect(result.errors?.[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'parentBlockId'
    })
  })

  it('throws FORBIDDEN for a caller outside the team', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(
      campaignFactory({ userId: 'someoneElse' }).build()
    )

    const result = await create({})

    expect(result.errors?.[0].extensions).toMatchObject({ code: 'FORBIDDEN' })
  })

  describe('the client-chosen id', () => {
    it.each([
      ['empty', ''],
      ['not a UUID', 'not-a-uuid']
    ])('refuses an id that is %s (BAD_USER_INPUT, id)', async (_label, id) => {
      const result = await create({ id })

      expect(result.errors?.[0]).toMatchObject({
        message: 'id must be a UUID',
        extensions: { code: 'BAD_USER_INPUT', field: 'id' }
      })
      expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
    })

    it('answers an id already taken by another block with BAD_USER_INPUT, id', async () => {
      prismaMock.campaignBlock.create.mockRejectedValue(idTaken())

      const result = await create({
        id: '0f2b4c6d-8e9f-4a1b-9c2d-3e4f5a6b7c8d'
      })

      expect(result.errors?.[0]).toMatchObject({
        message: 'id is already taken',
        extensions: { code: 'BAD_USER_INPUT', field: 'id' }
      })
    })

    it('keeps a UUID the client chose', async () => {
      const id = '0f2b4c6d-8e9f-4a1b-9c2d-3e4f5a6b7c8d'

      const result = await create({ id })

      expect(result.data.campaignButtonBlockCreate.id).toBe(id)
    })
  })
})
