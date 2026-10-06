import { campaignBlockWithAcl } from '../../../../../test/campaignBlockFactory'
import {
  authClient,
  setupCampaignBlockSpec
} from '../../../../../test/campaignBlockSpec'
import { CampaignFixture } from '../../../../../test/campaignFactory'
import { prismaMock } from '../../../../../test/prismaMock'
import { graphql } from '../../../../lib/graphql/subgraphGraphql'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

describe('campaignRichTextBlockUpdate', () => {
  const UPDATE = graphql(`
    mutation CampaignRichTextBlockUpdate(
      $id: ID!
      $input: CampaignRichTextBlockUpdateInput!
    ) {
      campaignRichTextBlockUpdate(id: $id, input: $input) {
        id
        title
        content
      }
    }
  `)

  let fixture: CampaignFixture

  beforeEach(() => {
    fixture = setupCampaignBlockSpec()
    const block = campaignBlockWithAcl(fixture, 'heroId', {
      id: 'richTextId',
      typename: 'CampaignRichTextBlock',
      title: 'Our story',
      content: 'First.\n\nSecond.'
    })
    prismaMock.campaignBlock.findFirst.mockResolvedValue(block)
    prismaMock.campaignBlock.update.mockImplementation((async ({
      data
    }: any) => ({ ...block, ...data })) as never)
  })

  async function update(input: Record<string, unknown>): Promise<any> {
    return await authClient({
      document: UPDATE,
      variables: { id: 'richTextId', input }
    })
  }

  it('updates only the given fields', async () => {
    const result = await update({ content: ' New text. ' })

    expect(result).toEqual({
      data: {
        campaignRichTextBlockUpdate: {
          id: 'richTextId',
          title: 'Our story',
          content: 'New text.'
        }
      }
    })
    expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith({
      where: { id: 'richTextId' },
      data: { content: 'New text.' },
      include: { action: true }
    })
  })

  it.each([
    ['title', 150],
    ['content', 5000]
  ])(
    'caps %s at %i characters (BAD_USER_INPUT, the field)',
    async (field, max) => {
      const ok = await update({ [field]: 'x'.repeat(max) })
      expect(ok.errors).toBeUndefined()

      const result = await update({ [field]: 'x'.repeat(max + 1) })

      expect(result.errors[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field
      })
    }
  )

  it('allows empty text', async () => {
    const result = await update({ content: '' })

    expect(result.data.campaignRichTextBlockUpdate.content).toBe('')
  })

  it('throws NOT_FOUND when the id is not a live CampaignRichTextBlock', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(fixture, 'heroButtonId')
    )

    const result = await update({ content: 'x' })

    expect(result.errors[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })
})
