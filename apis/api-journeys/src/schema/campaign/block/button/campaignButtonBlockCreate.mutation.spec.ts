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
    prismaMock.campaignBlock.findMany.mockResolvedValue(
      fixture.blocks.filter((block) => block.parentBlockId === 'headerId')
    )
    prismaMock.campaignBlock.create.mockImplementation((async ({
      data
    }: any) => ({
      ...campaignBlockWithAcl(fixture, 'navHomeId'),
      action: null,
      ...data,
      id: data.id ?? 'newButtonId'
    })) as never)
  })

  async function create(input: Record<string, unknown>): Promise<any> {
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

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'label'
    })
    expect(prismaMock.campaignBlock.create).not.toHaveBeenCalled()
  })

  it.each(['color', 'labelColor'])(
    'rejects a non-hex %s (BAD_USER_INPUT, the column)',
    async (field) => {
      const result = await create({ [field]: 'rgb(1,2,3)' })

      expect(result.errors[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field
      })
    }
  )

  it('rejects an Extra as the parent (BAD_USER_INPUT, parentBlockId)', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      fixture.blocks.find((block) => block.id === 'navHomeId')
    )

    const result = await create({ parentBlockId: 'navHomeId' })

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'parentBlockId'
    })
  })

  it('throws FORBIDDEN for a caller outside the team', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(
      campaignFactory({ userId: 'someoneElse' }).build()
    )

    const result = await create({})

    expect(result.errors[0].extensions).toMatchObject({ code: 'FORBIDDEN' })
  })
})
