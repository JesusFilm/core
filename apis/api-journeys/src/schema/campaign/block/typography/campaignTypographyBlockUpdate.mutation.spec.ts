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

import { validateTypographyInput } from './validateTypographyInput'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

describe('campaignTypographyBlockUpdate', () => {
  const UPDATE = graphql(`
    mutation CampaignTypographyBlockUpdate(
      $id: ID!
      $input: CampaignTypographyBlockUpdateInput!
    ) {
      campaignTypographyBlockUpdate(id: $id, input: $input) {
        id
        content
        variant
        align
        color
        placement
      }
    }
  `)

  let fixture: CampaignFixture

  beforeEach(() => {
    fixture = setupCampaignBlockSpec()
    const copyright = campaignBlockWithAcl(fixture, 'footerCopyrightId')
    prismaMock.campaignBlock.findFirst.mockResolvedValue(copyright)
    prismaMock.campaignBlock.update.mockImplementation((async ({
      data
    }: any) => ({ ...copyright, ...data })) as never)
  })

  async function update(
    input: Record<string, unknown>,
    id = 'footerCopyrightId'
  ): Promise<any> {
    return await authClient({ document: UPDATE, variables: { id, input } })
  }

  it('writes the trimmed content and leaves the other columns alone', async () => {
    const result = await update({ content: '  © 2027 Jesus Film Project  ' })

    expect(result.data.campaignTypographyBlockUpdate).toMatchObject({
      id: 'footerCopyrightId',
      content: '© 2027 Jesus Film Project',
      variant: 'caption'
    })
    expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith({
      where: { id: 'footerCopyrightId' },
      data: { content: '© 2027 Jesus Film Project' },
      include: { action: true }
    })
    expect(prismaMock.campaign.update).toHaveBeenCalledWith({
      where: { id: 'campaignId' },
      data: { updatedAt: expect.any(Date) }
    })
  })

  it('allows empty content', async () => {
    const result = await update({ content: '' })

    expect(result.data.campaignTypographyBlockUpdate.content).toBe('')
  })

  it('caps content at 2000 characters (BAD_USER_INPUT, content)', async () => {
    const result = await update({ content: 'x'.repeat(2001) })

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'content'
    })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })

  it('accepts each of core’s twelve variants and null for body1', async () => {
    for (const variant of [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'subtitle1',
      'subtitle2',
      'body1',
      'body2',
      'caption',
      'overline'
    ]) {
      expect(validateTypographyInput({ variant })).toEqual({
        typographyVariant: variant
      })
    }
    const result = await update({ variant: null })

    expect(result.data.campaignTypographyBlockUpdate.variant).toBeNull()
    expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { typographyVariant: null } })
    )
  })

  it('rejects a variant outside the twelve (BAD_USER_INPUT, variant)', () => {
    expect(() => validateTypographyInput({ variant: 'display' })).toThrow(
      expect.objectContaining({
        extensions: { code: 'BAD_USER_INPUT', field: 'variant' }
      })
    )
  })

  it('takes align left, center, right or null to follow the section', async () => {
    for (const align of ['left', 'center', 'right']) {
      expect(validateTypographyInput({ align })).toEqual({ align })
    }
    expect(() => validateTypographyInput({ align: 'justify' })).toThrow(
      expect.objectContaining({
        extensions: { code: 'BAD_USER_INPUT', field: 'align' }
      })
    )

    const result = await update({ align: null })

    expect(result.data.campaignTypographyBlockUpdate.align).toBeNull()
  })

  it('normalises color through assertHex and accepts null', async () => {
    const result = await update({ color: ' #abc ' })

    expect(result.data.campaignTypographyBlockUpdate.color).toBe('#AABBCC')

    const cleared = await update({ color: null })
    expect(cleared.data.campaignTypographyBlockUpdate.color).toBeNull()
  })

  it('rejects a colour that is not hex (BAD_USER_INPUT, color)', async () => {
    const result = await update({ color: 'red' })

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'color'
    })
  })

  it('throws NOT_FOUND when the id is not a live typography block', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(fixture, 'heroButtonId')
    )

    const result = await update({ content: 'x' }, 'heroButtonId')

    expect(result.errors[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
  })

  it('throws FORBIDDEN for a caller outside the team', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(
      campaignBlockWithAcl(
        campaignFactory({ userId: 'someoneElse' }).build(),
        'footerCopyrightId'
      )
    )

    const result = await update({ content: 'x' })

    expect(result.errors[0].extensions).toMatchObject({ code: 'FORBIDDEN' })
    expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
  })
})
