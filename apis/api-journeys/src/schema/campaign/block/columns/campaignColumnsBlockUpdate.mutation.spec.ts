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

describe('campaignColumnsBlockUpdate', () => {
  const UPDATE = graphql(`
    mutation CampaignColumnsBlockUpdate(
      $id: ID!
      $input: CampaignColumnsBlockUpdateInput!
    ) {
      campaignColumnsBlockUpdate(id: $id, input: $input) {
        id
        ratio
      }
    }
  `)

  const UPDATE_STYLE = graphql(`
    mutation CampaignColumnsBlockUpdateStyle(
      $id: ID!
      $input: CampaignColumnsBlockUpdateInput!
    ) {
      campaignColumnsBlockUpdate(id: $id, input: $input) {
        id
        backgroundKind
        backgroundOverlay
      }
    }
  `)

  let fixture: CampaignFixture

  beforeEach(() => {
    fixture = setupCampaignBlockSpec()
    const block = campaignBlockWithAcl(fixture, 'heroId', {
      id: 'columnsId',
      typename: 'CampaignColumnsBlock',
      ratio: 'equal'
    })
    prismaMock.campaignBlock.findFirst.mockResolvedValue(block)
    mockCampaignBlockWrites(block)
  })

  async function update(
    input: Record<string, unknown>,
    document: typeof UPDATE | typeof UPDATE_STYLE = UPDATE
  ): Promise<CampaignSpecResult<typeof UPDATE | typeof UPDATE_STYLE>> {
    return await authClient({
      document,
      variables: { id: 'columnsId', input }
    })
  }

  it.each(['equal', 'wideLeft', 'wideRight'])(
    'sets the ratio to %s',
    async (ratio) => {
      const result = await update({ ratio })

      expect(result).toEqual({
        data: { campaignColumnsBlockUpdate: { id: 'columnsId', ratio } }
      })
      expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith({
        where: { id: 'columnsId' },
        data: { ratio },
        include: { action: true }
      })
    }
  )

  it('rejects a ratio outside the enum at the schema', async () => {
    const result = await update({ ratio: 'tall' })

    expect(result.errors?.[0].message).toContain(
      'Value "tall" does not exist in "CampaignColumnsRatio" enum'
    )
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })

  it('throws NOT_FOUND when the id is not a live CampaignColumnsBlock', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(fixture, 'heroButtonId')
    )

    const result = await update({ ratio: 'wideLeft' })

    expect(result.errors?.[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })

  it('throws FORBIDDEN for a caller outside the team', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(
        campaignFactory({ userId: 'someoneElse' }).build(),
        'heroId',
        {
          id: 'columnsId',
          typename: 'CampaignColumnsBlock'
        }
      )
    )

    const result = await update({ ratio: 'wideLeft' })

    expect(result.errors?.[0].extensions).toMatchObject({ code: 'FORBIDDEN' })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })

  it('writes an explicit backgroundKind and overlay, leaving the colour and cover alone', async () => {
    const result = await update(
      { backgroundKind: 'surface', backgroundOverlay: 'heavy' },
      UPDATE_STYLE
    )

    expect(result.data.campaignColumnsBlockUpdate).toMatchObject({
      backgroundKind: 'surface',
      backgroundOverlay: 'heavy'
    })
    expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { backgroundKind: 'surface', backgroundOverlay: 'heavy' }
      })
    )
  })
})
