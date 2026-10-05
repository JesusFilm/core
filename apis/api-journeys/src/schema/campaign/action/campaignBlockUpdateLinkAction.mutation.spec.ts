import { campaignBlockWithAcl } from '../../../../test/campaignBlockFactory'
import {
  authClient,
  setupCampaignBlockSpec
} from '../../../../test/campaignBlockSpec'
import {
  CAMPAIGN_FIXTURE_DATE,
  CampaignFixture,
  campaignFactory
} from '../../../../test/campaignFactory'
import { prismaMock } from '../../../../test/prismaMock'
import { graphql } from '../../../lib/graphql/subgraphGraphql'
import { LINK_URL_MAX_LENGTH } from '../validation'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

/** The upsert as Prisma answers it: the row after `update` (or `create`) was applied. */
export function mockActionUpsert(): void {
  prismaMock.campaignAction.upsert.mockImplementation((async ({
    where,
    update
  }: any) => ({
    campaignBlockId: where.campaignBlockId,
    updatedAt: CAMPAIGN_FIXTURE_DATE,
    blockId: null,
    regionId: null,
    url: null,
    target: null,
    ...update
  })) as never)
}

describe('campaignBlockUpdateLinkAction', () => {
  const UPDATE = graphql(`
    mutation CampaignBlockUpdateLinkAction(
      $id: ID!
      $input: CampaignLinkActionInput!
    ) {
      campaignBlockUpdateLinkAction(id: $id, input: $input) {
        __typename
        parentBlockId
        url
        target
      }
    }
  `)

  let fixture: CampaignFixture

  beforeEach(() => {
    fixture = setupCampaignBlockSpec()
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(fixture, 'heroButtonId')
    )
    mockActionUpsert()
  })

  async function update(
    input: Record<string, unknown>,
    id = 'heroButtonId'
  ): Promise<any> {
    return await authClient({ document: UPDATE, variables: { id, input } })
  }

  it('replaces the button’s scroll action with a link through one upsert that resets the other columns', async () => {
    const result = await update({
      url: ' https://example.com/path?x=1 ',
      target: '_blank'
    })

    expect(result).toEqual({
      data: {
        campaignBlockUpdateLinkAction: {
          __typename: 'CampaignLinkAction',
          parentBlockId: 'heroButtonId',
          url: 'https://example.com/path?x=1',
          target: '_blank'
        }
      }
    })
    expect(prismaMock.campaignAction.upsert).toHaveBeenCalledTimes(1)
    expect(prismaMock.campaignAction.upsert).toHaveBeenCalledWith({
      where: { campaignBlockId: 'heroButtonId' },
      create: {
        campaignBlockId: 'heroButtonId',
        url: 'https://example.com/path?x=1',
        target: '_blank'
      },
      update: {
        blockId: null,
        regionId: null,
        url: 'https://example.com/path?x=1',
        target: '_blank'
      }
    })
    expect(prismaMock.campaign.update).toHaveBeenCalledWith({
      where: { id: 'campaignId' },
      data: { updatedAt: expect.any(Date) }
    })
  })

  it('takes a null target for the same tab', async () => {
    const result = await update({ url: 'https://example.com' })

    expect(result.data.campaignBlockUpdateLinkAction.target).toBeNull()
    expect(prismaMock.campaignAction.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({ target: null })
      })
    )
  })

  it.each(['http://example.com', 'example.com', 'javascript:alert(1)'])(
    'rejects %s: the url must be https (BAD_USER_INPUT, url), no blocklist',
    async (url) => {
      const result = await update({ url })

      expect(result.errors[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'url'
      })
      expect(prismaMock.campaignAction.upsert).not.toHaveBeenCalled()
    }
  )

  it('caps the url at 2048 characters (BAD_USER_INPUT, url)', async () => {
    const result = await update({
      url: `https://example.com/${'a'.repeat(LINK_URL_MAX_LENGTH)}`
    })

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'url'
    })
    expect(prismaMock.campaignAction.upsert).not.toHaveBeenCalled()
  })

  it('refuses a block that is not a CampaignButtonBlock (BAD_USER_INPUT, id)', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(fixture, 'footerCopyrightId')
    )

    const result = await update(
      { url: 'https://example.com' },
      'footerCopyrightId'
    )

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'id'
    })
    expect(prismaMock.campaignAction.upsert).not.toHaveBeenCalled()
  })

  it('throws NOT_FOUND when the id is not a live block', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(null)

    const result = await update({ url: 'https://example.com' }, 'ghostId')

    expect(result.errors[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
    expect(prismaMock.campaignBlock.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'ghostId', deletedAt: null } })
    )
  })

  it('throws FORBIDDEN for a caller outside the team', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(
        campaignFactory({ userId: 'someoneElse' }).build(),
        'heroButtonId'
      )
    )

    const result = await update({ url: 'https://example.com' })

    expect(result.errors[0].extensions).toMatchObject({ code: 'FORBIDDEN' })
    expect(prismaMock.campaignAction.upsert).not.toHaveBeenCalled()
  })
})
