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

describe('campaignHeaderBlockUpdate', () => {
  const UPDATE = graphql(`
    mutation CampaignHeaderBlockUpdate(
      $id: ID!
      $input: CampaignHeaderBlockUpdateInput!
    ) {
      campaignHeaderBlockUpdate(id: $id, input: $input) {
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
        logoBlockId
      }
    }
  `)

  let fixture: CampaignFixture

  beforeEach(() => {
    fixture = setupCampaignBlockSpec()
    const chrome = campaignBlockWithAcl(fixture, 'headerId')
    prismaMock.campaignBlock.findFirst.mockResolvedValue(chrome)
    mockCampaignBlockWrites(chrome)
  })

  async function update(
    input: Record<string, unknown>,
    blockId = 'headerId'
  ): Promise<CampaignSpecResult<typeof UPDATE>> {
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

    expect(result.data.campaignHeaderBlockUpdate).toMatchObject({
      id: 'headerId',
      backgroundKind: 'contrast',
      headingColor: '#FFFFFF',
      buttonColor: '#F2B544',
      accentColor: null
    })
    expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith({
      where: { id: 'headerId' },
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

  it('sets logoBlockId to an image block owned by the header, soft-deleting the logo it held', async () => {
    prismaMock.campaignBlock.findFirst
      .mockResolvedValueOnce(campaignBlockWithAcl(fixture, 'headerId'))
      .mockResolvedValueOnce(
        campaignBlockWithAcl(fixture, 'headerId', { logoBlockId: 'oldLogoId' })
      )
      .mockResolvedValueOnce({
        id: 'logoId',
        typename: 'CampaignImageBlock'
      } as never)

    const result = await update({ logoBlockId: 'logoId' })

    expect(result.data.campaignHeaderBlockUpdate).toMatchObject({
      id: 'headerId',
      logoBlockId: 'logoId'
    })
    expect(prismaMock.campaignBlock.findFirst).toHaveBeenLastCalledWith({
      where: {
        id: 'logoId',
        campaignId: 'campaignId',
        parentBlockId: 'headerId'
      },
      select: { id: true, typename: true }
    })
    expect(
      vi
        .mocked(prismaMock.campaignBlock.update)
        .mock.calls.map(([call]) => call)
    ).toEqual([
      { where: { id: 'oldLogoId' }, data: { deletedAt: expect.any(Date) } },
      { where: { id: 'logoId' }, data: { deletedAt: null } },
      {
        where: { id: 'headerId' },
        data: { logoBlockId: 'logoId' },
        include: { action: true }
      }
    ])
  })

  it('clears logoBlockId with null, soft-deleting the logo it held, without a lookup', async () => {
    const header = campaignBlockWithAcl(fixture, 'headerId', {
      logoBlockId: 'logoId'
    })
    prismaMock.campaignBlock.findFirst.mockResolvedValue(header)

    const result = await update({ logoBlockId: null })

    expect(result.data.campaignHeaderBlockUpdate.logoBlockId).toBeNull()
    expect(prismaMock.campaignBlock.findFirst).not.toHaveBeenCalledWith(
      expect.objectContaining({ select: { id: true, typename: true } })
    )
    expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith({
      where: { id: 'logoId' },
      data: { deletedAt: expect.any(Date) }
    })
    expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith({
      where: { id: 'headerId' },
      data: { logoBlockId: null },
      include: { action: true }
    })
  })

  it('rejects a logo that is not a CampaignImageBlock owned by the header (BAD_USER_INPUT, logoBlockId)', async () => {
    prismaMock.campaignBlock.findFirst
      .mockResolvedValueOnce(campaignBlockWithAcl(fixture, 'headerId'))
      .mockResolvedValueOnce(campaignBlockWithAcl(fixture, 'headerId'))
      .mockResolvedValueOnce(null)

    const result = await update({ logoBlockId: 'heroId' })

    expect(result.errors?.[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'logoBlockId'
    })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })

  it('rejects a bad colour with the column as field (BAD_USER_INPUT)', async () => {
    const result = await update({ textColor: 'red' })

    expect(result.errors?.[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'textColor'
    })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })

  it('throws NOT_FOUND when the id is not the live header', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(fixture, 'footerId')
    )

    const result = await update({ backgroundKind: 'surface' }, 'footerId')

    expect(result.errors?.[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })

  it('requires campaign Update: FORBIDDEN for a caller outside the team', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(
        campaignFactory({ userId: 'someoneElse' }).build(),
        'headerId'
      )
    )

    const result = await update({ backgroundKind: 'surface' })

    expect(result.errors?.[0].extensions).toMatchObject({ code: 'FORBIDDEN' })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })
})
