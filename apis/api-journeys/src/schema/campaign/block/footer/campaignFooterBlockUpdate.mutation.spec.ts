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

describe('campaignFooterBlockUpdate', () => {
  const UPDATE = graphql(`
    mutation CampaignFooterBlockUpdate(
      $id: ID!
      $input: CampaignFooterBlockUpdateInput!
    ) {
      campaignFooterBlockUpdate(id: $id, input: $input) {
        id
        backgroundKind
        backgroundColor
        coverBlockId
        backgroundOverlay
        headingColor
        textColor
        buttonColor
        buttonTextColor
        accentColor
      }
    }
  `)

  let fixture: CampaignFixture

  beforeEach(() => {
    fixture = setupCampaignBlockSpec()
    const chrome = campaignBlockWithAcl(fixture, 'footerId')
    prismaMock.campaignBlock.findFirst.mockResolvedValue(chrome)
    prismaMock.campaignBlock.update.mockImplementation((async ({
      data
    }: any) => ({ ...chrome, ...data })) as never)
  })

  async function update(
    input: Record<string, unknown>,
    blockId = 'footerId'
  ): Promise<any> {
    return await authClient({
      document: UPDATE,
      variables: { id: blockId, input }
    })
  }

  it('accepts the shared section fields through the shared helper and bumps the campaign', async () => {
    const result = await update({
      backgroundKind: 'contrast',
      headingColor: '#fff',
      buttonColor: ' #f2b544 ',
      accentColor: null
    })

    expect(result.data.campaignFooterBlockUpdate).toMatchObject({
      id: 'footerId',
      backgroundKind: 'contrast',
      headingColor: '#FFFFFF',
      buttonColor: '#F2B544',
      accentColor: null
    })
    expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith({
      where: { id: 'footerId' },
      data: {
        backgroundKind: 'contrast',
        headingColor: '#FFFFFF',
        buttonColor: '#F2B544',
        accentColor: null
      },
      include: { action: true }
    })
    expect(prismaMock.campaign.update).toHaveBeenCalledWith({
      where: { id: 'campaignId' },
      data: { updatedAt: expect.any(Date) }
    })
  })

  it('rejects a bad colour with the column as field (BAD_USER_INPUT)', async () => {
    const result = await update({ textColor: 'red' })

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'textColor'
    })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })

  it('throws NOT_FOUND when the id is not the live footer', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(fixture, 'headerId')
    )

    const result = await update({ backgroundKind: 'surface' }, 'headerId')

    expect(result.errors[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })

  it('requires campaign Update: FORBIDDEN for a caller outside the team', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(
        campaignFactory({ userId: 'someoneElse' }).build(),
        'footerId'
      )
    )

    const result = await update({ backgroundKind: 'surface' })

    expect(result.errors[0].extensions).toMatchObject({ code: 'FORBIDDEN' })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })
})
