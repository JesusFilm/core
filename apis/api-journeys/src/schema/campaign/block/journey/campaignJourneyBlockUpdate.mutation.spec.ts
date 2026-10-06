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

describe('campaignJourneyBlockUpdate', () => {
  const UPDATE = graphql(`
    mutation CampaignJourneyBlockUpdate(
      $id: ID!
      $input: CampaignJourneyBlockUpdateInput!
    ) {
      campaignJourneyBlockUpdate(id: $id, input: $input) {
        id
        journeyId
        title
        description
        titleTranslations {
          languageId
          value
          source
        }
      }
    }
  `)

  let fixture: CampaignFixture

  beforeEach(() => {
    fixture = setupCampaignBlockSpec()
    const item = campaignBlockWithAcl(fixture, 'landingJourneyListId', {
      id: 'journeyItemId',
      typename: 'CampaignJourneyBlock',
      parentBlockId: 'landingJourneyListId',
      parentOrder: 0,
      journeyId: 'journeyId',
      title: 'The Christmas story',
      titleTranslations: { '496': { value: 'Histoire', source: 'human' } },
      description: 'A short journey.'
    })
    prismaMock.campaignBlock.findFirst.mockResolvedValue(item)
    prismaMock.campaignBlock.update.mockImplementation((async ({
      data
    }: any) => ({ ...item, ...data })) as never)
  })

  async function update(
    input: Record<string, unknown>,
    id = 'journeyItemId'
  ): Promise<any> {
    return await authClient({ document: UPDATE, variables: { id, input } })
  }

  it.each([
    ['title', 200],
    ['description', 1000]
  ])(
    'caps %s at %i characters (BAD_USER_INPUT, the field)',
    async (field, max) => {
      const ok = await update({ [field]: ' ' + 'x'.repeat(max) + ' ' })
      expect(ok.errors).toBeUndefined()
      expect(ok.data.campaignJourneyBlockUpdate[field]).toBe('x'.repeat(max))

      const result = await update({ [field]: 'x'.repeat(max + 1) })

      expect(result.errors[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field
      })
    }
  )

  it('writes only the given default-language fields and leaves translations and the link alone', async () => {
    const result = await update({ title: '  Christmas, retold  ' })

    expect(result.data.campaignJourneyBlockUpdate).toMatchObject({
      id: 'journeyItemId',
      journeyId: 'journeyId',
      title: 'Christmas, retold',
      description: 'A short journey.',
      titleTranslations: [
        { languageId: '496', value: 'Histoire', source: 'human' }
      ]
    })
    expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith({
      where: { id: 'journeyItemId' },
      data: { title: 'Christmas, retold' },
      include: { action: true }
    })
    expect(prismaMock.campaign.update).toHaveBeenCalledWith({
      where: { id: 'campaignId' },
      data: { updatedAt: expect.any(Date) }
    })
  })

  it('allows empty text', async () => {
    const result = await update({ description: '' })

    expect(result.data.campaignJourneyBlockUpdate.description).toBe('')
  })

  it('throws NOT_FOUND for a live block of another typename', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(fixture, 'heroId')
    )

    const result = await update({ title: 'x' }, 'heroId')

    expect(result.errors[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })

  it('throws NOT_FOUND for an unknown or deleted block', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(null)

    const result = await update({ title: 'x' }, 'missing')

    expect(result.errors[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
  })

  it('throws FORBIDDEN for a caller outside the team', async () => {
    const outsider = campaignFactory({ userId: 'someoneElse' }).build()
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(outsider, 'landingJourneyListId', {
        typename: 'CampaignJourneyBlock'
      })
    )

    const result = await update({ title: 'x' })

    expect(result.errors[0].extensions).toMatchObject({ code: 'FORBIDDEN' })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })
})
